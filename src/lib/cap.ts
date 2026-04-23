/**
 * CAP (Common Alerting Protocol) v1.2 output helpers.
 *
 * Spec: https://docs.oasis-open.org/emergency/cap/v1.2/CAP-v1.2-os.html
 * Igni emits CAP so that government systems, emergency broadcasters and
 * federated Igni instances can consume verified wildfire alerts without
 * custom integration.
 */

import type { Database } from '@/types/database'

type FireReport = Database['public']['Tables']['fire_reports']['Row']

export type CapUrgency = 'Immediate' | 'Expected' | 'Future' | 'Past' | 'Unknown'
export type CapSeverity = 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown'
export type CapCertainty = 'Observed' | 'Likely' | 'Possible' | 'Unlikely' | 'Unknown'
export type CapMsgType = 'Alert' | 'Update' | 'Cancel'

export interface CapContext {
  sender: string
  senderName: string
  baseUrl: string
  language?: string
}

const XML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
}

function xmlEscape(value: string | null | undefined): string {
  if (value == null) return ''
  return String(value).replace(/[&<>"']/g, (c) => XML_ESCAPE_MAP[c] ?? c)
}

function formatCapTimestamp(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().replace('Z', '+00:00')
}

export function mapStatusToUrgency(status: string): CapUrgency {
  switch (status) {
    case 'active':
      return 'Immediate'
    case 'pending':
    case 'verified':
      return 'Expected'
    case 'contained':
      return 'Future'
    case 'extinguished':
    case 'false_alarm':
      return 'Past'
    default:
      return 'Unknown'
  }
}

export function mapIntensityToSeverity(intensity: string | null): CapSeverity {
  switch (intensity) {
    case 'extreme':
      return 'Extreme'
    case 'high':
      return 'Severe'
    case 'medium':
      return 'Moderate'
    case 'low':
      return 'Minor'
    default:
      return 'Unknown'
  }
}

export function mapStatusToCertainty(status: string): CapCertainty {
  switch (status) {
    case 'pending':
      return 'Possible'
    case 'verified':
    case 'active':
    case 'contained':
    case 'extinguished':
      return 'Observed'
    case 'false_alarm':
      return 'Unlikely'
    default:
      return 'Unknown'
  }
}

export function mapStatusToMsgType(status: string): CapMsgType {
  if (status === 'false_alarm' || status === 'extinguished') return 'Cancel'
  return 'Alert'
}

export function radiusForIntensityKm(intensity: string | null): number {
  switch (intensity) {
    case 'extreme':
      return 10
    case 'high':
      return 5
    case 'medium':
      return 2.5
    case 'low':
      return 1
    default:
      return 2
  }
}

/**
 * Build a single <alert> CAP 1.2 XML document for a fire report.
 */
export function buildCapAlert(report: FireReport, ctx: CapContext): string {
  const id = `igni.${report.id}`
  const sent = formatCapTimestamp(report.updated_at ?? report.created_at ?? new Date())
  const msgType = mapStatusToMsgType(report.status)
  const urgency = mapStatusToUrgency(report.status)
  const severity = mapIntensityToSeverity(report.intensity)
  const certainty = mapStatusToCertainty(report.status)
  const radiusKm = radiusForIntensityKm(report.intensity)
  const lang = ctx.language ?? 'es-AR'

  const headline =
    report.status === 'false_alarm'
      ? `Falso reporte descartado (${report.latitude.toFixed(3)}, ${report.longitude.toFixed(3)})`
      : `Foco de incendio ${humanStatus(report.status)} — ${report.latitude.toFixed(3)}, ${report.longitude.toFixed(3)}`

  const description = report.description?.trim() || 'Sin descripción adicional.'

  return `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>${xmlEscape(id)}</identifier>
  <sender>${xmlEscape(ctx.sender)}</sender>
  <sent>${xmlEscape(sent)}</sent>
  <status>Actual</status>
  <msgType>${msgType}</msgType>
  <source>${xmlEscape(ctx.senderName)}</source>
  <scope>Public</scope>
  <info>
    <language>${xmlEscape(lang)}</language>
    <category>Fire</category>
    <event>Wildfire</event>
    <urgency>${urgency}</urgency>
    <severity>${severity}</severity>
    <certainty>${certainty}</certainty>
    <senderName>${xmlEscape(ctx.senderName)}</senderName>
    <headline>${xmlEscape(headline)}</headline>
    <description>${xmlEscape(description)}</description>
    <web>${xmlEscape(`${ctx.baseUrl}/`)}</web>
    <parameter>
      <valueName>source</valueName>
      <value>${xmlEscape(report.source)}</value>
    </parameter>
    <parameter>
      <valueName>status</valueName>
      <value>${xmlEscape(report.status)}</value>
    </parameter>
    <parameter>
      <valueName>intensity</valueName>
      <value>${xmlEscape(report.intensity ?? 'unknown')}</value>
    </parameter>
    <parameter>
      <valueName>confidence_score</valueName>
      <value>${xmlEscape(String(report.confidence_score ?? 0))}</value>
    </parameter>
    <area>
      <areaDesc>${xmlEscape(`Área de influencia estimada (${radiusKm} km)`)}</areaDesc>
      <circle>${report.latitude},${report.longitude} ${radiusKm}</circle>
    </area>
  </info>
</alert>`
}

/**
 * Build an Atom 1.0 feed listing recent alerts.
 * Each entry links to the per-alert CAP XML via a rel="alternate" link.
 */
export function buildAtomFeed(reports: FireReport[], ctx: CapContext): string {
  const updated = reports[0]?.updated_at
    ? formatCapTimestamp(reports[0].updated_at)
    : formatCapTimestamp(new Date())

  const entries = reports
    .map((r) => {
      const entryUrl = `${ctx.baseUrl}/api/alerts/cap/${r.id}`
      const id = `urn:igni:fire:${r.id}`
      const title = `Foco ${humanStatus(r.status)} — ${r.latitude.toFixed(3)}, ${r.longitude.toFixed(3)}`
      const summary =
        r.description?.trim() ||
        `Severidad ${mapIntensityToSeverity(r.intensity).toLowerCase()}, certeza ${mapStatusToCertainty(r.status).toLowerCase()}.`
      return `  <entry>
    <id>${xmlEscape(id)}</id>
    <title>${xmlEscape(title)}</title>
    <updated>${xmlEscape(formatCapTimestamp(r.updated_at ?? r.created_at ?? new Date()))}</updated>
    <link rel="alternate" type="application/xml" href="${xmlEscape(entryUrl)}"/>
    <summary>${xmlEscape(summary)}</summary>
    <category term="${xmlEscape(r.status)}"/>
  </entry>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${xmlEscape(`${ctx.baseUrl}/api/alerts/cap.atom`)}</id>
  <title>Igni — Alertas CAP</title>
  <subtitle>Focos de incendio verificados (CAP 1.2)</subtitle>
  <updated>${xmlEscape(updated)}</updated>
  <author>
    <name>${xmlEscape(ctx.senderName)}</name>
  </author>
  <link rel="self" href="${xmlEscape(`${ctx.baseUrl}/api/alerts/cap.atom`)}"/>
  <link rel="alternate" type="text/html" href="${xmlEscape(ctx.baseUrl)}"/>
${entries}
</feed>`
}

function humanStatus(status: string): string {
  switch (status) {
    case 'pending':
      return 'pendiente'
    case 'verified':
      return 'verificado'
    case 'active':
      return 'activo'
    case 'contained':
      return 'contenido'
    case 'extinguished':
      return 'extinguido'
    case 'false_alarm':
      return 'falsa alarma'
    default:
      return status
  }
}

export function getCapContext(): CapContext {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://igni.skyw.app'
  return {
    sender: process.env.CAP_SENDER || 'igni@skyw.app',
    senderName: process.env.CAP_SENDER_NAME || 'Igni',
    baseUrl,
    language: process.env.CAP_LANGUAGE || 'es-AR',
  }
}
