// Mapbox configuration

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

// Argentina center coordinates
export const ARGENTINA_CENTER: [number, number] = [-64.0, -34.6]
export const DEFAULT_ZOOM = 5

// Map style
export const MAP_STYLE = 'mapbox://styles/mapbox/satellite-streets-v12'

// Status colors for fire reports
export const STATUS_COLORS: Record<string, string> = {
  pending: '#FCD34D', // yellow-400
  verified: '#FB923C', // orange-400
  active: '#EF4444', // red-500
  contained: '#F97316', // orange-500
  extinguished: '#22C55E', // green-500
  false_alarm: '#9CA3AF', // gray-400
}

// Intensity sizes for markers
export const INTENSITY_SIZES: Record<string, number> = {
  low: 12,
  medium: 16,
  high: 20,
  extreme: 24,
}

// Resource type icons
export const RESOURCE_ICONS: Record<string, string> = {
  water_truck: 'fire-station',
  volunteer: 'marker',
  equipment: 'hardware',
}

export const RESOURCE_COLORS: Record<string, string> = {
  available: '#22C55E', // green
  deployed: '#3B82F6', // blue
  offline: '#6B7280', // gray
}

// Isochrone colors (5, 10, 15 minute ranges)
export const ISOCHRONE_FILL_COLORS = [
  'rgba(255, 99, 71, 0.3)', // 5 min - tomato
  'rgba(255, 165, 0, 0.3)', // 10 min - orange
  'rgba(255, 215, 0, 0.3)', // 15 min - gold
]

export const ISOCHRONE_STROKE_COLORS = [
  'rgba(255, 99, 71, 0.8)', // 5 min
  'rgba(255, 165, 0, 0.8)', // 10 min
  'rgba(255, 215, 0, 0.8)', // 15 min
]
