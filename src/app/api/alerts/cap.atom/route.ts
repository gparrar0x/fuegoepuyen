import { buildAtomFeed, getCapContext } from '@/lib/cap'
import { createPublicClient } from '@/lib/supabase/public'

export const runtime = 'nodejs'
export const revalidate = 60

const CAP_EMITTED_STATUSES = ['verified', 'active', 'contained', 'extinguished']
const LOOKBACK_DAYS = 7
const MAX_ENTRIES = 200

export async function GET() {
  const supabase = createPublicClient()
  const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('fire_reports')
    .select('*')
    .in('status', CAP_EMITTED_STATUSES)
    .gte('updated_at', since)
    .order('updated_at', { ascending: false })
    .limit(MAX_ENTRIES)

  if (error) {
    return new Response(`<!-- feed error: ${error.message} -->`, {
      status: 500,
      headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
    })
  }

  const xml = buildAtomFeed(data ?? [], getCapContext())

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=60, s-maxage=60',
    },
  })
}
