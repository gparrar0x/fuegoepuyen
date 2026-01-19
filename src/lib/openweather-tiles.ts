// OpenWeather tile configuration

import type { WeatherLayerType } from '@/types/map-features';

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const TILE_URL = 'https://tile.openweathermap.org/map';

/**
 * Get tile URL for a weather layer type
 */
export function getWeatherTileUrl(layer: WeatherLayerType): string {
  if (!OPENWEATHER_API_KEY) {
    console.warn('OpenWeather API key not configured');
    return '';
  }

  return `${TILE_URL}/${layer}/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`;
}

/**
 * Weather layer source configuration for Mapbox
 */
export function getWeatherLayerSource(layer: WeatherLayerType): mapboxgl.RasterSourceSpecification {
  return {
    type: 'raster',
    tiles: [getWeatherTileUrl(layer)],
    tileSize: 256,
    attribution: '&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>',
  };
}

/**
 * Weather layer configuration for Mapbox
 */
export function getWeatherLayerConfig(): mapboxgl.RasterLayerSpecification {
  return {
    id: 'weather-layer',
    type: 'raster',
    source: 'weather-source',
    paint: {
      'raster-opacity': 0.6,
      'raster-fade-duration': 300,
    },
  };
}

/**
 * Check if OpenWeather API is configured
 */
export function isWeatherApiConfigured(): boolean {
  return Boolean(OPENWEATHER_API_KEY);
}
