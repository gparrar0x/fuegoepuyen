// Measure utilities using Turf.js

import { distance, lineString, length } from '@turf/turf';
import type { MeasurePoint } from '@/types/map-features';

/**
 * Calculate distance between two points in kilometers
 */
export function calculateDistance(
  from: MeasurePoint,
  to: MeasurePoint
): number {
  return distance(
    [from.lng, from.lat],
    [to.lng, to.lat],
    { units: 'kilometers' }
  );
}

/**
 * Calculate total distance of a path in kilometers
 */
export function calculateTotalDistance(points: MeasurePoint[]): number {
  if (points.length < 2) return 0;

  const coords = points.map((p) => [p.lng, p.lat] as [number, number]);
  const line = lineString(coords);

  return length(line, { units: 'kilometers' });
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(2)} km`;
}

/**
 * Create GeoJSON LineString from measure points
 */
export function createMeasureLine(
  points: MeasurePoint[]
): GeoJSON.Feature<GeoJSON.LineString> | null {
  if (points.length < 2) return null;

  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: points.map((p) => [p.lng, p.lat]),
    },
  };
}

/**
 * Create GeoJSON points for measure markers
 */
export function createMeasurePoints(
  points: MeasurePoint[]
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: points.map((p, i) => ({
      type: 'Feature',
      properties: { index: i },
      geometry: {
        type: 'Point',
        coordinates: [p.lng, p.lat],
      },
    })),
  };
}
