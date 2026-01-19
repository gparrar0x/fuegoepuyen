// Mapbox Isochrone API helper

import { MAPBOX_TOKEN } from './mapbox';
import type { IsochroneProfile } from '@/types/map-features';

const ISOCHRONE_API = 'https://api.mapbox.com/isochrone/v1/mapbox';

interface IsochroneResponse {
  features: GeoJSON.Feature<GeoJSON.Polygon>[];
  type: 'FeatureCollection';
}

/**
 * Fetch isochrone polygons from Mapbox API
 */
export async function fetchIsochrone(
  lng: number,
  lat: number,
  profile: IsochroneProfile = 'driving',
  minutes: number[] = [5, 10, 15]
): Promise<GeoJSON.FeatureCollection | null> {
  if (!MAPBOX_TOKEN) {
    console.error('Mapbox token not configured');
    return null;
  }

  const params = new URLSearchParams({
    contours_minutes: minutes.join(','),
    polygons: 'true',
    access_token: MAPBOX_TOKEN,
  });

  try {
    const response = await fetch(
      `${ISOCHRONE_API}/${profile}/${lng},${lat}?${params}`
    );

    if (!response.ok) {
      throw new Error(`Isochrone API error: ${response.status}`);
    }

    const data: IsochroneResponse = await response.json();

    // Add colors to features for styling
    const features = data.features.map((feature, index) => ({
      ...feature,
      properties: {
        ...feature.properties,
        colorIndex: index,
        minutes: minutes[index],
      },
    }));

    return {
      type: 'FeatureCollection',
      features,
    };
  } catch (error) {
    console.error('Isochrone fetch failed:', error);
    return null;
  }
}

/**
 * Create layer configuration for isochrone polygons
 */
export function getIsochroneFillLayerConfig(): mapboxgl.FillLayerSpecification {
  return {
    id: 'isochrone-fill',
    type: 'fill',
    source: 'isochrone-source',
    paint: {
      'fill-color': [
        'match',
        ['get', 'colorIndex'],
        0, 'rgba(255, 99, 71, 0.3)',   // 5 min
        1, 'rgba(255, 165, 0, 0.3)',   // 10 min
        2, 'rgba(255, 215, 0, 0.3)',   // 15 min
        'rgba(128, 128, 128, 0.3)',
      ],
      'fill-opacity': 0.6,
    },
  };
}

/**
 * Create layer configuration for isochrone outlines
 */
export function getIsochroneLineLayerConfig(): mapboxgl.LineLayerSpecification {
  return {
    id: 'isochrone-line',
    type: 'line',
    source: 'isochrone-source',
    paint: {
      'line-color': [
        'match',
        ['get', 'colorIndex'],
        0, 'rgba(255, 99, 71, 0.8)',
        1, 'rgba(255, 165, 0, 0.8)',
        2, 'rgba(255, 215, 0, 0.8)',
        'rgba(128, 128, 128, 0.8)',
      ],
      'line-width': 2,
    },
  };
}
