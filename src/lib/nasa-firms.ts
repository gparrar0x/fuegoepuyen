// NASA FIRMS API integration
// Get your free API key at: https://firms.modaps.eosdis.nasa.gov/api/area/

const FIRMS_BASE_URL = 'https://firms.modaps.eosdis.nasa.gov/api/area/csv';

// Argentina bounding box (approximate)
export const ARGENTINA_BBOX = {
  west: -73.5,
  south: -55.0,
  east: -53.5,
  north: -21.5,
};

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

export function parseCSV(csv: string): FIRMSHotspot[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',');
  const hotspots: FIRMSHotspot[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length !== headers.length) continue;

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = values[idx].trim();
    });

    hotspots.push({
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      brightness: parseFloat(row.brightness || row.bright_ti4 || '0'),
      scan: parseFloat(row.scan || '0'),
      track: parseFloat(row.track || '0'),
      acq_date: row.acq_date,
      acq_time: row.acq_time,
      satellite: row.satellite || 'VIIRS',
      confidence: mapConfidence(row.confidence),
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

export function confidenceToIntensity(conf: 'low' | 'nominal' | 'high'): 'low' | 'medium' | 'high' {
  switch (conf) {
    case 'high': return 'high';
    case 'nominal': return 'medium';
    case 'low': return 'low';
  }
}

export async function fetchFIRMSData(days: number = 1): Promise<FIRMSHotspot[]> {
  const apiKey = process.env.NASA_FIRMS_KEY;
  if (!apiKey) {
    console.error('NASA_FIRMS_KEY not configured');
    return [];
  }

  const { west, south, east, north } = ARGENTINA_BBOX;
  // VIIRS_SNPP_NRT = VIIRS S-NPP Near Real-Time
  const url = `${FIRMS_BASE_URL}/${apiKey}/VIIRS_SNPP_NRT/${west},${south},${east},${north}/${days}`;

  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'text/csv' },
      next: { revalidate: 900 }, // 15 min cache
    });

    if (!response.ok) {
      throw new Error(`FIRMS API error: ${response.status}`);
    }

    const csv = await response.text();
    return parseCSV(csv);
  } catch (error) {
    console.error('Error fetching FIRMS data:', error);
    return [];
  }
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

// Check if hotspot is too close to existing reports (deduplication)
export function isDuplicate(
  hotspot: FIRMSHotspot,
  existingReports: { latitude: number; longitude: number }[],
  thresholdKm: number = 1
): boolean {
  return existingReports.some(report =>
    haversineDistance(
      hotspot.latitude, hotspot.longitude,
      report.latitude, report.longitude
    ) < thresholdKm
  );
}
