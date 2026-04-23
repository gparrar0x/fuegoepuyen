import { NextResponse } from 'next/server'
import { buildCapAlert, getCapContext } from '@/lib/cap'
import { createPublicClient } from '@/lib/supabase/public'

export const runtime = 'nodejs'
export const revalidate = 30

const CAP_EMITTED_STATUSES = ['verified', 'active', 'contained', 'extinguished', 'false_alarm']

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: 'Invalid id format' }, { status: 400 })
  }

  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('fire_reports')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (!CAP_EMITTED_STATUSES.includes(data.status)) {
    return NextResponse.json(
      { error: 'Report not eligible for CAP (not verified yet)' },
      { status: 409 },
    )
  }

  const xml = buildCapAlert(data, getCapContext())

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=30, s-maxage=30',
    },
  })
}
