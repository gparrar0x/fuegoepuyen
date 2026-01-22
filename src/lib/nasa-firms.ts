// NASA FIRMS API integration
// Get your free API key at: https://firms.modaps.eosdis.nasa.gov/api/area/

import Papa from 'papaparse';

const FIRMS_BASE_URL = 'https://firms.modaps.eosdis.nasa.gov/api/area/csv';

// Argentina bounding box (approximate)
export const ARGENTINA_BBOX = {
  west: -73.5,
  south: -55.0,
  east: -53.5,
  north: -21.5,
};

// Coordinate validation ranges
const VALID_LATITUDE_RANGE = { min: -90, max: 90 };
const VALID_LONGITUDE_RANGE = { min: -180, max: 180 };

export interface FIRMSHotspot {
  latitude: number;
  longitude: number;
  brightness: number;
  scan: number;
  track: number;
  acq_date: string;
  acq_time: string;
  satellite: string;
  confidence: 'low' | 'nominal' | 'high';
  version: string;
  bright_t31: number;
  frp: number;
  daynight: 'D' | 'N';
}

// Raw NASA FIRMS CSV row structure
interface FIRMSRawRow {
  latitude?: string;
  longitude?: string;
  brightness?: string;
  bright_ti4?: string;
  scan?: string;
  track?: string;
  acq_date?: string;
  acq_time?: string;
  satellite?: string;
  confidence?: string;
  version?: string;
  bright_t31?: string;
  frp?: string;
  daynight?: string;
}

export class FIRMSError extends Error {
  constructor(
    message: string,
    public code: 'NO_API_KEY' | 'API_ERROR' | 'PARSE_ERROR' | 'VALIDATION_ERROR',
    public statusCode?: number
  ) {
    super(message);
    this.name = 'FIRMSError';
  }
}

function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= VALID_LATITUDE_RANGE.min &&
    lat <= VALID_LATITUDE_RANGE.max &&
    lng >= VALID_LONGITUDE_RANGE.min &&
    lng <= VALID_LONGITUDE_RANGE.max
  );
}

function isWithinArgentina(lat: number, lng: number): boolean {
  return (
    lat >= ARGENTINA_BBOX.south &&
    lat <= ARGENTINA_BBOX.north &&
    lng >= ARGENTINA_BBOX.west &&
    lng <= ARGENTINA_BBOX.east
  );
}

export function parseCSV(csv: string): FIRMSHotspot[] {
  const result = Papa.parse<FIRMSRawRow>(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase(),
  });

  if (result.errors.length > 0) {
    console.warn('[FIRMS] CSV parse warnings:', result.errors.slice(0, 5));
  }

  const hotspots: FIRMSHotspot[] = [];

  for (const row of result.data) {
    const lat = parseFloat(row.latitude || '');
    const lng = parseFloat(row.longitude || '');

    // Validate coordinates
    if (!isValidCoordinate(lat, lng)) {
      console.warn('[FIRMS] Invalid coordinates, skipping row:', { lat, lng });
      continue;
    }

    // Skip hotspots outside Argentina bbox
    if (!isWithinArgentina(lat, lng)) {
      continue;
    }

    hotspots.push({
      latitude: lat,
      longitude: lng,
      brightness: parseFloat(row.brightness || row.bright_ti4 || '0'),
      scan: parseFloat(row.scan || '0'),
      track: parseFloat(row.track || '0'),
      acq_date: row.acq_date || '',
      acq_time: row.acq_time || '',
      satellite: row.satellite || 'VIIRS',
      confidence: mapConfidence(row.confidence || ''),
      version: row.version || '',
      bright_t31: parseFloat(row.bright_t31 || '0'),
      frp: parseFloat(row.frp || '0'),
      daynight: (row.daynight as 'D' | 'N') || 'D',
    });
  }

  return hotspots;
}

function mapConfidence(conf: string): 'low' | 'nominal' | 'high' {
  const c = conf?.toLowerCase();
  if (c === 'h' || c === 'high') return 'high';
  if (c === 'l' || c === 'low') return 'low';
  return 'nominal';
}

export function confidenceToIntensity(conf: 'low' | 'nominal' | 'high', frp?: number): 'low' | 'medium' | 'high' | 'extreme' {
  // Use FRP (Fire Radiative Power) for extreme classification if available
  if (frp && frp > 100) return 'extreme';

  switch (conf) {
    case 'high': return 'high';
    case 'nominal': return 'medium';
    case 'low': return 'low';
  }
}

export async function fetchFIRMSData(days: number = 1): Promise<FIRMSHotspot[]> {
  const apiKey = process.env.NASA_FIRMS_KEY;

  if (!apiKey) {
    throw new FIRMSError(
      'NASA_FIRMS_KEY environment variable not configured. Get your free key at https://firms.modaps.eosdis.nasa.gov/api/area/',
      'NO_API_KEY'
    );
  }

  const { west, south, east, north } = ARGENTINA_BBOX;
  // VIIRS_SNPP_NRT = VIIRS S-NPP Near Real-Time
  const url = `${FIRMS_BASE_URL}/${apiKey}/VIIRS_SNPP_NRT/${west},${south},${east},${north}/${days}`;

  const response = await fetch(url, {
    headers: { 'Accept': 'text/csv' },
    next: { revalidate: 900 }, // 15 min cache
  });

  if (!response.ok) {
    throw new FIRMSError(
      `FIRMS API returned ${response.status}: ${response.statusText}`,
      'API_ERROR',
      response.status
    );
  }

  const csv = await response.text();

  if (!csv || csv.trim().length === 0) {
    console.log('[FIRMS] Empty response from API');
    return [];
  }

  const hotspots = parseCSV(csv);
  console.log(`[FIRMS] Parsed ${hotspots.length} valid hotspots from ${csv.split('\n').length - 1} rows`);

  return hotspots;
}

// Calculate distance between two points (Haversine formula)
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Generate unique source ID for deduplication
// Using 3 decimal places (~111m precision) to match 500m proximity threshold
export function generateSourceId(hotspot: FIRMSHotspot): string {
  return `${hotspot.acq_date}_${hotspot.acq_time}_${hotspot.latitude.toFixed(3)}_${hotspot.longitude.toFixed(3)}`;
}

// Parse detection date from NASA FIRMS format
export function parseDetectionDate(hotspot: FIRMSHotspot): string {
  // acq_date format: "2026-01-17", acq_time format: "0142" (HHMM)
  const time = hotspot.acq_time.padStart(4, '0');
  const hours = time.slice(0, 2);
  const minutes = time.slice(2, 4);
  return `${hotspot.acq_date}T${hours}:${minutes}:00Z`;
}

// Generate description for fire report
export function generateDescription(hotspot: FIRMSHotspot): string {
  const parts = [
    `Detectado por NASA FIRMS (${hotspot.satellite})`,
    `Confianza: ${hotspot.confidence}`,
    `FRP: ${hotspot.frp.toFixed(1)} MW`,
    `Fecha: ${hotspot.acq_date} ${hotspot.acq_time}`,
    hotspot.daynight === 'D' ? 'Día' : 'Noche',
  ];
  return parts.join(' | ');
}

// Check if hotspot is too close to existing reports (deduplication)
// Reduced threshold to 500m for better accuracy
export function isDuplicate(
  hotspot: FIRMSHotspot,
  existingReports: { latitude: number; longitude: number }[],
  thresholdKm: number = 0.5
): boolean {
  return existingReports.some(report =>
    haversineDistance(
      hotspot.latitude, hotspot.longitude,
      report.latitude, report.longitude
    ) < thresholdKm
  );
}
