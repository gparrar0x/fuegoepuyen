'use client'

import { useCallback, useEffect } from 'react'
import { calculateTotalDistance, createMeasureLine, createMeasurePoints } from '@/lib/measure-utils'
import { useMapStore } from '@/stores/map-store'

export function useMeasure() {
  const {
    isMeasureMode,
    measurePoints,
    totalDistance,
    toggleMeasureMode,
    addMeasurePoint,
    setTotalDistance,
    clearMeasure,
  } = useMapStore()

  // Recalculate distance when points change
  useEffect(() => {
    const distance = calculateTotalDistance(measurePoints)
    setTotalDistance(distance)
  }, [measurePoints, setTotalDistance])

  const handleMapClick = useCallback(
    (lngLat: { lng: number; lat: number }) => {
      if (!isMeasureMode) return
      addMeasurePoint({ lng: lngLat.lng, lat: lngLat.lat })
    },
    [isMeasureMode, addMeasurePoint],
  )

  const getLineGeoJSON = useCallback(() => {
    return createMeasureLine(measurePoints)
  }, [measurePoints])

  const getPointsGeoJSON = useCallback(() => {
    return createMeasurePoints(measurePoints)
  }, [measurePoints])

  const removeLastPoint = useCallback(() => {
    if (measurePoints.length === 0) return
    // Create new array without last point
    const newPoints = measurePoints.slice(0, -1)
    // We need to reset and re-add points
    clearMeasure()
    newPoints.forEach((p) => addMeasurePoint(p))
  }, [measurePoints, clearMeasure, addMeasurePoint])

  return {
    isActive: isMeasureMode,
    points: measurePoints,
    totalDistance,
    toggle: toggleMeasureMode,
    handleMapClick,
    getLineGeoJSON,
    getPointsGeoJSON,
    removeLastPoint,
    clear: clearMeasure,
  }
}
