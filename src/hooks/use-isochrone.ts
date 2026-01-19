'use client';

import { useCallback, useEffect, useRef } from 'react';
import type mapboxgl from 'mapbox-gl';
import { useMapStore } from '@/stores/map-store';
import {
  fetchIsochrone,
  getIsochroneFillLayerConfig,
  getIsochroneLineLayerConfig,
} from '@/lib/mapbox-isochrone';
import type { IsochroneProfile } from '@/types/map-features';

const ISOCHRONE_SOURCE_ID = 'isochrone-source';
const ISOCHRONE_FILL_LAYER_ID = 'isochrone-fill';
const ISOCHRONE_LINE_LAYER_ID = 'isochrone-line';

export function useIsochrone(map: mapboxgl.Map | null) {
  const {
    isochroneVisible,
    isochroneResourceId,
    isochroneData,
    setIsochroneResource,
    setIsochroneData,
    toggleIsochroneVisibility,
  } = useMapStore();

  const isLoadingRef = useRef(false);

  // Fetch isochrone data when resource changes
  const fetchForResource = useCallback(
    async (
      lng: number,
      lat: number,
      profile: IsochroneProfile = 'driving',
      minutes: number[] = [5, 10, 15]
    ) => {
      if (isLoadingRef.current) return;

      isLoadingRef.current = true;
      try {
        const data = await fetchIsochrone(lng, lat, profile, minutes);
        setIsochroneData(data);
      } finally {
        isLoadingRef.current = false;
      }
    },
    [setIsochroneData]
  );

  // Add/remove isochrone layers
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;

    const cleanup = () => {
      if (map.getLayer(ISOCHRONE_LINE_LAYER_ID)) {
        map.removeLayer(ISOCHRONE_LINE_LAYER_ID);
      }
      if (map.getLayer(ISOCHRONE_FILL_LAYER_ID)) {
        map.removeLayer(ISOCHRONE_FILL_LAYER_ID);
      }
      if (map.getSource(ISOCHRONE_SOURCE_ID)) {
        map.removeSource(ISOCHRONE_SOURCE_ID);
      }
    };

    // Remove if not visible or no data
    if (!isochroneVisible || !isochroneData) {
      cleanup();
      return;
    }

    cleanup();

    try {
      // Add source
      map.addSource(ISOCHRONE_SOURCE_ID, {
        type: 'geojson',
        data: isochroneData,
      });

      // Find first symbol layer to insert below
      const firstSymbolLayer = map.getStyle()?.layers?.find(
        (l) => l.type === 'symbol'
      )?.id;

      // Add fill layer
      map.addLayer(getIsochroneFillLayerConfig(), firstSymbolLayer);

      // Add line layer
      map.addLayer(getIsochroneLineLayerConfig(), firstSymbolLayer);
    } catch (error) {
      console.error('Failed to add isochrone layers:', error);
    }
  }, [map, isochroneVisible, isochroneData]);

  const showForLocation = useCallback(
    (
      resourceId: string,
      lng: number,
      lat: number,
      profile: IsochroneProfile = 'driving'
    ) => {
      setIsochroneResource(resourceId);
      fetchForResource(lng, lat, profile);
    },
    [setIsochroneResource, fetchForResource]
  );

  const hide = useCallback(() => {
    setIsochroneResource(null);
    setIsochroneData(null);
  }, [setIsochroneResource, setIsochroneData]);

  return {
    isVisible: isochroneVisible,
    resourceId: isochroneResourceId,
    data: isochroneData,
    showForLocation,
    hide,
    toggle: toggleIsochroneVisibility,
    isLoading: isLoadingRef.current,
  };
}
