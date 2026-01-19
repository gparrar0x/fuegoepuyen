// Mapbox Geocoder API helper

import { MAPBOX_TOKEN } from './mapbox';
import type { GeocoderResult } from '@/types/map-features';

const GEOCODER_API = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

interface MapboxGeocoderResponse {
  features: Array<{
    id: string;
    place_name: string;
    center: [number, number];
    text: string;
    place_type: string[];
  }>;
}

export async function searchPlaces(
  query: string,
  options: {
    proximity?: [number, number]; // [lng, lat]
    country?: string;
    limit?: number;
  } = {}
): Promise<GeocoderResult[]> {
  if (!query.trim() || !MAPBOX_TOKEN) {
    return [];
  }

  const params = new URLSearchParams({
    access_token: MAPBOX_TOKEN,
    limit: String(options.limit || 5),
    language: 'es',
  });

  if (options.proximity) {
    params.set('proximity', options.proximity.join(','));
  }

  if (options.country) {
    params.set('country', options.country);
  }

  try {
    const response = await fetch(
      `${GEOCODER_API}/${encodeURIComponent(query)}.json?${params}`
    );

    if (!response.ok) {
      throw new Error('Geocoder API error');
    }

    const data: MapboxGeocoderResponse = await response.json();

    return data.features.map((f) => ({
      id: f.id,
      place_name: f.place_name,
      center: f.center,
      text: f.text,
      place_type: f.place_type,
    }));
  } catch (error) {
    console.error('Geocoder search failed:', error);
    return [];
  }
}
