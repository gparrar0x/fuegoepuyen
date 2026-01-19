import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  fetchFIRMSData,
  isDuplicate,
  confidenceToIntensity,
  type FIRMSHotspot,
} from '@/lib/nasa-firms';

// Vercel Cron: run every 15 minutes
export const runtime = 'edge';
export const maxDuration = 60;

// Cron config for vercel.json:
// { "path": "/api/cron/firms", "schedule": "*/15 * * * *" }

export async function GET(request: Request) {
  // Verify cron secret (optional, for Vercel cron jobs)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[FIRMS Cron] Starting data fetch...');

    // Fetch NASA FIRMS data (5 days max for free tier)
    const hotspots = await fetchFIRMSData(5);

    if (hotspots.length === 0) {
      console.log('[FIRMS Cron] No hotspots found');
      return NextResponse.json({
        success: true,
        message: 'No hotspots found',
        imported: 0,
      });
    }

    console.log(`[FIRMS Cron] Found ${hotspots.length} hotspots from NASA FIRMS`);

    // Get existing reports for deduplication
    const supabase = createAdminClient();
    const { data: existingReports, error: fetchError } = await supabase
      .from('fire_reports')
      .select('latitude, longitude, source_id')
      .eq('source', 'nasa_firms')
      .gte('created_at', new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString());

    if (fetchError) {
      console.error('[FIRMS Cron] Error fetching existing reports:', fetchError);
      throw fetchError;
    }

    const reports = existingReports as Array<{ latitude: number; longitude: number; source_id: string | null }> | null;
    const existingSourceIds = new Set(
      reports?.map((r) => r.source_id).filter(Boolean) || []
    );

    // Filter out duplicates
    const newHotspots = hotspots.filter((hotspot) => {
      // Check by source_id (date + time + lat + lng)
      const sourceId = generateSourceId(hotspot);
      if (existingSourceIds.has(sourceId)) {
        return false;
      }

      // Check by proximity (1km threshold)
      if (reports && isDuplicate(hotspot, reports, 1)) {
        return false;
      }

      return true;
    });

    console.log(`[FIRMS Cron] ${newHotspots.length} new hotspots after deduplication`);

    if (newHotspots.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new hotspots to import',
        imported: 0,
        total_found: hotspots.length,
      });
    }

    // Insert new fire reports
    const reportsToInsert = newHotspots.map((hotspot) => ({
      latitude: hotspot.latitude,
      longitude: hotspot.longitude,
      source: 'nasa_firms' as const,
      source_id: generateSourceId(hotspot),
      status: 'pending' as const,
      intensity: confidenceToIntensity(hotspot.confidence),
      description: generateDescription(hotspot),
      detected_at: parseDetectionDate(hotspot),
    }));

    const { data: insertedReports, error: insertError } = await supabase
      .from('fire_reports')
      // @ts-expect-error - Supabase types don't match exactly with our insert shape
      .insert(reportsToInsert)
      .select('id');

    if (insertError) {
      console.error('[FIRMS Cron] Error inserting reports:', insertError);
      throw insertError;
    }

    console.log(`[FIRMS Cron] Successfully imported ${insertedReports?.length || 0} new hotspots`);

    return NextResponse.json({
      success: true,
      message: `Imported ${insertedReports?.length || 0} new fire reports`,
      imported: insertedReports?.length || 0,
      total_found: hotspots.length,
      duplicates_skipped: hotspots.length - newHotspots.length,
    });
  } catch (error) {
    console.error('[FIRMS Cron] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function generateSourceId(hotspot: FIRMSHotspot): string {
  return `${hotspot.acq_date}_${hotspot.acq_time}_${hotspot.latitude.toFixed(4)}_${hotspot.longitude.toFixed(4)}`;
}

function generateDescription(hotspot: FIRMSHotspot): string {
  const parts = [
    `Detectado por NASA FIRMS (${hotspot.satellite})`,
    `Confianza: ${hotspot.confidence}`,
    `FRP: ${hotspot.frp.toFixed(1)} MW`,
    `Fecha: ${hotspot.acq_date} ${hotspot.acq_time}`,
    hotspot.daynight === 'D' ? 'Día' : 'Noche',
  ];
  return parts.join(' | ');
}

function parseDetectionDate(hotspot: FIRMSHotspot): string {
  // acq_date format: "2026-01-17", acq_time format: "0142" (HHMM)
  const time = hotspot.acq_time.padStart(4, '0');
  const hours = time.slice(0, 2);
  const minutes = time.slice(2, 4);
  return `${hotspot.acq_date}T${hours}:${minutes}:00Z`;
}
