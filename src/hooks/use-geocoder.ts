'use client'

import { useCallback, useRef } from 'react'
import { searchPlaces } from '@/lib/mapbox-geocoder'
import { useMapStore } from '@/stores/map-store'
import type { GeocoderResult } from '@/types/map-features'

const DEBOUNCE_MS = 300

export function useGeocoder() {
  const {
    geocoderQuery,
    geocoderResults,
    isGeocoderOpen,
    center,
    setGeocoderQuery,
    setGeocoderResults,
    setGeocoderOpen,
    clearGeocoder,
    setCenter,
    setZoom,
  } = useMapStore()

  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const search = useCallback(
    async (query: string) => {
      setGeocoderQuery(query)

      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      if (!query.trim()) {
        setGeocoderResults([])
        return
      }

      debounceRef.current = setTimeout(async () => {
        const results = await searchPlaces(query, {
          proximity: center as [number, number],
          country: 'ar', // Argentina
          limit: 5,
        })
        setGeocoderResults(results)
        setGeocoderOpen(true)
      }, DEBOUNCE_MS)
    },
    [center, setGeocoderQuery, setGeocoderResults, setGeocoderOpen],
  )

  const selectResult = useCallback(
    (result: GeocoderResult) => {
      setCenter(result.center)
      setZoom(14) // Zoom in when selecting a place
      clearGeocoder()
    },
    [setCenter, setZoom, clearGeocoder],
  )

  const flyTo = useCallback(
    (lng: number, lat: number, zoom = 14) => {
      setCenter([lng, lat])
      setZoom(zoom)
    },
    [setCenter, setZoom],
  )

  return {
    query: geocoderQuery,
    results: geocoderResults,
    isOpen: isGeocoderOpen,
    search,
    selectResult,
    flyTo,
    close: () => setGeocoderOpen(false),
    clear: clearGeocoder,
  }
}
