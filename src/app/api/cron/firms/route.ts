import { NextResponse } from 'next/server'
import {
  confidenceToIntensity,
  FIRMSError,
  type FIRMSHotspot,
  fetchFIRMSData,
  generateDescription,
  generateSourceId,
  isDuplicate,
  parseDetectionDate,
} from '@/lib/nasa-firms'
import { createAdminClient } from '@/lib/supabase/admin'

// Vercel Cron: run every 15 minutes
// vercel.json: { "path": "/api/cron/firms", "schedule": "*/15 * * * *" }
export const runtime = 'edge'
export const maxDuration = 60

export async function GET(request: Request) {
  // Verify cron secret (optional, for Vercel cron jobs)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('[FIRMS Cron] Starting data fetch...')

    // Fetch NASA FIRMS data (2 days for more frequent cron, was 5 for daily)
    const hotspots = await fetchFIRMSData(2)

    if (hotspots.length === 0) {
      console.log('[FIRMS Cron] No hotspots found')
      return NextResponse.json({
        success: true,
        message: 'No hotspots found',
        imported: 0,
      })
    }

    console.log(`[FIRMS Cron] Found ${hotspots.length} hotspots from NASA FIRMS`)

    // Get existing reports for deduplication (match fetch window + buffer)
    const supabase = createAdminClient()
    const lookbackDays = 5 // 2 days fetch + 3 days buffer
    const { data: existingReports, error: fetchError } = await supabase
      .from('fire_reports')
      .select('latitude, longitude, source_id')
      .eq('source', 'nasa_firms')
      .gte('created_at', new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000).toISOString())

    if (fetchError) {
      console.error('[FIRMS Cron] Error fetching existing reports:', fetchError)
      throw fetchError
    }

    const reports = existingReports as Array<{
      latitude: number
      longitude: number
      source_id: string | null
    }> | null
    const existingSourceIds = new Set(reports?.map((r) => r.source_id).filter(Boolean) || [])

    // Filter out duplicates
    const newHotspots = hotspots.filter((hotspot) => {
      // Check by source_id (date + time + lat + lng)
      const sourceId = generateSourceId(hotspot)
      if (existingSourceIds.has(sourceId)) {
        return false
      }

      // Check by proximity (500m threshold)
      if (reports && isDuplicate(hotspot, reports, 0.5)) {
        return false
      }

      return true
    })

    console.log(`[FIRMS Cron] ${newHotspots.length} new hotspots after deduplication`)

    if (newHotspots.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new hotspots to import',
        imported: 0,
        total_found: hotspots.length,
      })
    }

    // Insert new fire reports
    const reportsToInsert = newHotspots.map((hotspot: FIRMSHotspot) => ({
      latitude: hotspot.latitude,
      longitude: hotspot.longitude,
      source: 'nasa_firms',
      source_id: generateSourceId(hotspot),
      status: 'pending',
      intensity: confidenceToIntensity(hotspot.confidence, hotspot.frp),
      description: generateDescription(hotspot),
      detected_at: parseDetectionDate(hotspot),
      reported_by: null,
      verified_at: null,
      verified_by: null,
      image_url: null,
    }))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: insertedReports, error: insertError } = await supabase
      .from('fire_reports')
      .insert(reportsToInsert as any)
      .select('id')

    if (insertError) {
      console.error('[FIRMS Cron] Error inserting reports:', insertError)
      throw insertError
    }

    console.log(`[FIRMS Cron] Successfully imported ${insertedReports?.length || 0} new hotspots`)

    return NextResponse.json({
      success: true,
      message: `Imported ${insertedReports?.length || 0} new fire reports`,
      imported: insertedReports?.length || 0,
      total_found: hotspots.length,
      duplicates_skipped: hotspots.length - newHotspots.length,
    })
  } catch (error) {
    console.error('[FIRMS Cron] Error:', error)

    // Handle specific FIRMS errors
    if (error instanceof FIRMSError) {
      const statusCode = error.code === 'NO_API_KEY' ? 503 : 502
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
        },
        { status: statusCode },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
