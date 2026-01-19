// Map Features Types

// Geocoder
export interface GeocoderResult {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
  text: string;
  place_type: string[];
}

// Measure
export interface MeasurePoint {
  lng: number;
  lat: number;
}

// Weather
export type WeatherLayerType =
  | 'temp_new'
  | 'precipitation_new'
  | 'wind_new'
  | 'clouds_new'
  | 'pressure_new';

export const WEATHER_LAYERS: Record<WeatherLayerType, string> = {
  temp_new: 'Temperatura',
  precipitation_new: 'Precipitaciones',
  wind_new: 'Viento',
  clouds_new: 'Nubes',
  pressure_new: 'Presion',
};

// Isochrone
export type IsochroneProfile = 'driving' | 'walking' | 'cycling';

export interface IsochroneParams {
  lng: number;
  lat: number;
  profile: IsochroneProfile;
  minutes: number[];
}

export const ISOCHRONE_COLORS = [
  'rgba(255, 99, 71, 0.3)',   // 5 min - tomato
  'rgba(255, 165, 0, 0.3)',   // 10 min - orange
  'rgba(255, 215, 0, 0.3)',   // 15 min - gold
];

export const ISOCHRONE_STROKE_COLORS = [
  'rgba(255, 99, 71, 0.8)',
  'rgba(255, 165, 0, 0.8)',
  'rgba(255, 215, 0, 0.8)',
];
