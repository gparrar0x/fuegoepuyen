import { NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase/public'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const startedAt = Date.now()
  let supabaseOk = false
  let supabaseLatencyMs: number | null = null

  try {
    const t0 = Date.now()
    const supabase = createPublicClient()
    const { error } = await supabase
      .from('fire_reports')
      .select('id', { count: 'exact', head: true })
      .limit(1)
    supabaseLatencyMs = Date.now() - t0
    supabaseOk = !error
  } catch {
    supabaseOk = false
  }

  const body = {
    status: supabaseOk ? 'ok' : 'degraded',
    service: 'igni',
    timestamp: new Date().toISOString(),
    check_duration_ms: Date.now() - startedAt,
    checks: {
      supabase: {
        ok: supabaseOk,
        latency_ms: supabaseLatencyMs,
      },
    },
  }

  return NextResponse.json(body, { status: supabaseOk ? 200 : 503 })
}
