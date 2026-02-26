'use client'

import type mapboxgl from 'mapbox-gl'
import { useCallback, useEffect, useRef } from 'react'
import { getWeatherTileUrl, isWeatherApiConfigured } from '@/lib/openweather-tiles'
import { useMapStore } from '@/stores/map-store'
import type { WeatherLayerType } from '@/types/map-features'

const WEATHER_SOURCE_ID = 'weather-source'
const WEATHER_LAYER_ID = 'weather-layer'

export function useWeatherLayer(map: mapboxgl.Map | null) {
  const { weatherLayerVisible, activeWeatherLayer, setWeatherLayer } = useMapStore()

  const currentLayerRef = useRef<WeatherLayerType | null>(null)

  // Add or update weather layer
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return
    if (!isWeatherApiConfigured()) return

    const cleanup = () => {
      if (map.getLayer(WEATHER_LAYER_ID)) {
        map.removeLayer(WEATHER_LAYER_ID)
      }
      if (map.getSource(WEATHER_SOURCE_ID)) {
        map.removeSource(WEATHER_SOURCE_ID)
      }
      currentLayerRef.current = null
    }

    // Remove layer if not visible or no layer selected
    if (!weatherLayerVisible || !activeWeatherLayer) {
      cleanup()
      return
    }

    // Skip if same layer already added
    if (currentLayerRef.current === activeWeatherLayer) {
      return
    }

    // Remove existing before adding new
    cleanup()

    try {
      // Add new source and layer
      map.addSource(WEATHER_SOURCE_ID, {
        type: 'raster',
        tiles: [getWeatherTileUrl(activeWeatherLayer)],
        tileSize: 256,
      })

      // Insert below markers (before any symbol layers)
      const firstSymbolLayer = map.getStyle()?.layers?.find((l) => l.type === 'symbol')?.id

      map.addLayer(
        {
          id: WEATHER_LAYER_ID,
          type: 'raster',
          source: WEATHER_SOURCE_ID,
          paint: {
            'raster-opacity': 0.6,
            'raster-fade-duration': 300,
          },
        },
        firstSymbolLayer,
      )

      currentLayerRef.current = activeWeatherLayer
    } catch (error) {
      console.error('Failed to add weather layer:', error)
    }

    return () => {
      // Cleanup on unmount or dependency change
    }
  }, [map, weatherLayerVisible, activeWeatherLayer])

  const setLayer = useCallback(
    (layer: WeatherLayerType | null) => {
      setWeatherLayer(layer)
    },
    [setWeatherLayer],
  )

  return {
    isVisible: weatherLayerVisible,
    activeLayer: activeWeatherLayer,
    setLayer,
    isConfigured: isWeatherApiConfigured(),
  }
}
