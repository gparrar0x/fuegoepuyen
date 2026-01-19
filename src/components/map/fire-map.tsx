'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapStore } from '@/stores/map-store';
import { useFireReports } from '@/hooks/use-fire-reports';
import { useResources } from '@/hooks/use-resources';
import { useMeasure } from '@/hooks/use-measure';
import { useWeatherLayer } from '@/hooks/use-weather-layer';
import { useIsochrone } from '@/hooks/use-isochrone';
import {
  MAPBOX_TOKEN,
  MAP_STYLE,
  STATUS_COLORS,
  INTENSITY_SIZES,
  RESOURCE_COLORS,
} from '@/lib/mapbox';
import { GeocoderSearch } from './geocoder-search';
import { WeatherControl } from './weather-control';
import { MeasureTool } from './measure-tool';
import type { FireReport, Resource, ResourceType } from '@/types/database';

const MEASURE_LINE_ID = 'measure-line';
const MEASURE_POINTS_ID = 'measure-points';
const MEASURE_SOURCE_ID = 'measure-source';
const MEASURE_POINTS_SOURCE_ID = 'measure-points-source';

const RESOURCE_ICONS: Record<ResourceType, string> = {
  water_truck: '🚒',
  volunteer: '👤',
  equipment: '⚒️',
};

interface FireMapProps {
  interactive?: boolean;
  onMapClick?: (lngLat: { lng: number; lat: number }, point: { x: number; y: number }) => void;
  className?: string;
}

export function FireMap({ interactive = true, onMapClick, className = '' }: FireMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const onMapClickRef = useRef(onMapClick);
  const prevCenterRef = useRef<[number, number] | null>(null);

  // Keep callback ref updated
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  const {
    center,
    zoom,
    filters,
    isMeasureMode,
    setCenter,
    setZoom,
    setSelectedFireId,
    setSelectedResourceId,
  } = useMapStore();

  // Measure hook
  const measure = useMeasure();

  // Weather and Isochrone hooks (pass map instance)
  useWeatherLayer(mapInstance);
  useIsochrone(mapInstance);

  const { data: fireReports = [] } = useFireReports({
    statuses: filters.statuses,
  });

  const { data: resources = [] } = useResources({
    types: filters.resourceTypes,
    statuses: filters.resourceStatuses,
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    if (!MAPBOX_TOKEN) {
      console.error('Mapbox token not configured');
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: center,
      zoom: zoom,
      interactive,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      'top-right'
    );

    map.current.on('load', () => {
      setMapLoaded(true);
      setMapInstance(map.current);
    });

    map.current.on('moveend', () => {
      if (map.current) {
        const c = map.current.getCenter();
        setCenter([c.lng, c.lat]);
        setZoom(map.current.getZoom());
      }
    });

    // Always register click handler, use ref to get current callback
    map.current.on('click', (e) => {
      // Handle measure mode clicks
      const measureMode = useMapStore.getState().isMeasureMode;
      if (measureMode) {
        useMapStore.getState().addMeasurePoint({ lng: e.lngLat.lng, lat: e.lngLat.lat });
        return;
      }

      if (onMapClickRef.current) {
        onMapClickRef.current(
          { lng: e.lngLat.lng, lat: e.lngLat.lat },
          { x: e.point.x, y: e.point.y }
        );
      }
    });

    // ResizeObserver to handle sidebar collapse/expand
    const resizeObserver = new ResizeObserver(() => {
      if (map.current) {
        map.current.resize();
      }
    });

    if (mapContainer.current) {
      resizeObserver.observe(mapContainer.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Clear existing markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }, []);

  // Add fire report markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    clearMarkers();

    // Fire report markers
    fireReports.forEach((report: FireReport) => {
      const el = document.createElement('div');
      const size = INTENSITY_SIZES[report.intensity || 'medium'];
      const color = STATUS_COLORS[report.status];
      const isNasa = report.source === 'nasa_firms';

      el.className = 'fire-marker';
      el.style.cursor = 'pointer';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';

      if (isNasa) {
        // NASA FIRMS marker - active (<24h) vs inactive (>24h)
        const detectedAt = report.detected_at ? new Date(report.detected_at) : new Date(report.created_at);
        const now = new Date();
        const hoursSinceDetection = (now.getTime() - detectedAt.getTime()) / (1000 * 60 * 60);
        const isActive = hoursSinceDetection <= 24;

        const nasaSize = Math.max(size + 8, 28);
        el.style.width = `${nasaSize}px`;
        el.style.height = `${nasaSize}px`;

        if (isActive) {
          // Active: Fire emoji with NASA badge
          el.innerHTML = `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
              <span style="font-size: ${nasaSize * 0.8}px; line-height: 1; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.4));">🔥</span>
              <span style="
                position: absolute;
                bottom: -2px;
                right: -4px;
                font-size: 9px;
                font-weight: bold;
                color: white;
                background: #0B3D91;
                padding: 1px 3px;
                border-radius: 3px;
                border: 1px solid white;
                line-height: 1;
                box-shadow: 0 1px 2px rgba(0,0,0,0.3);
              ">NASA</span>
            </div>
          `;
        } else {
          // Inactive: desaturated fire (no opacity reduction)
          el.innerHTML = `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; filter: grayscale(90%) saturate(30%);">
              <span style="font-size: ${nasaSize * 0.8}px; line-height: 1; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3));">🔥</span>
              <span style="
                position: absolute;
                bottom: -2px;
                right: -4px;
                font-size: 9px;
                font-weight: bold;
                color: #9CA3AF;
                background: #6B7280;
                padding: 1px 3px;
                border-radius: 3px;
                border: 1px solid #9CA3AF;
                line-height: 1;
              ">NASA</span>
            </div>
          `;
        }
      } else {
        // Community report marker - fire emoji only
        const communitySize = Math.max(size + 8, 28);
        el.style.width = `${communitySize}px`;
        el.style.height = `${communitySize}px`;
        el.style.borderRadius = '50%';
        el.style.fontSize = `${communitySize * 0.8}px`;
        el.style.lineHeight = '1';
        el.innerHTML = `<span style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.4));">🔥</span>`;
      }


      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([report.longitude, report.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 15 }).setHTML(`
            <div class="p-2">
              <strong class="text-sm">${report.status.toUpperCase()}</strong>
              <p class="text-xs text-gray-600">${report.source}</p>
              ${report.description ? `<p class="text-xs mt-1">${report.description}</p>` : ''}
              <p class="text-xs text-gray-500 mt-1">
                Score: ${report.confidence_score}
              </p>
            </div>
          `)
        )
        .addTo(map.current!);

      el.addEventListener('click', () => {
        setSelectedFireId(report.id);
      });

      markersRef.current.push(marker);
    });

    // Resource markers (if enabled)
    if (filters.showResources) {
      resources.forEach((resource: Resource) => {
        if (!resource.latitude || !resource.longitude) return;

        const el = document.createElement('div');
        const color = RESOURCE_COLORS[resource.status];
        const icon = RESOURCE_ICONS[resource.type as ResourceType] || '📍';

        el.className = 'resource-marker';
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.fontSize = '20px';
        el.style.backgroundColor = 'white';
        el.style.borderRadius = '50%';
        el.style.border = `3px solid ${color}`;
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';
        el.textContent = icon;

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([resource.longitude, resource.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 15 }).setHTML(`
              <div class="p-2">
                <strong class="text-sm">${resource.name}</strong>
                <p class="text-xs text-gray-600">${resource.type} - ${resource.status}</p>
                ${resource.capacity ? `<p class="text-xs">Capacidad: ${resource.capacity}L</p>` : ''}
              </div>
            `)
          )
          .addTo(map.current!);

        el.addEventListener('click', () => {
          setSelectedResourceId(resource.id);
        });

        markersRef.current.push(marker);
      });
    }
  }, [fireReports, resources, mapLoaded, filters.showResources, clearMarkers, setSelectedFireId, setSelectedResourceId]);

  // Fly to center when changed by geocoder
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Skip if this is the initial mount
    if (!prevCenterRef.current) {
      prevCenterRef.current = center;
      return;
    }

    // Only fly if center actually changed (geocoder selection)
    const [prevLng, prevLat] = prevCenterRef.current;
    const [newLng, newLat] = center;
    const moved = Math.abs(prevLng - newLng) > 0.001 || Math.abs(prevLat - newLat) > 0.001;

    if (moved) {
      map.current.flyTo({
        center: center,
        zoom: zoom,
        duration: 1500,
      });
    }

    prevCenterRef.current = center;
  }, [center, zoom, mapLoaded]);

  // Render measure line and points
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const lineGeoJSON = measure.getLineGeoJSON();
    const pointsGeoJSON = measure.getPointsGeoJSON();

    // Update or add line source/layer
    if (map.current.getSource(MEASURE_SOURCE_ID)) {
      (map.current.getSource(MEASURE_SOURCE_ID) as mapboxgl.GeoJSONSource).setData(
        lineGeoJSON || { type: 'FeatureCollection', features: [] }
      );
    } else if (lineGeoJSON) {
      map.current.addSource(MEASURE_SOURCE_ID, {
        type: 'geojson',
        data: lineGeoJSON,
      });

      map.current.addLayer({
        id: MEASURE_LINE_ID,
        type: 'line',
        source: MEASURE_SOURCE_ID,
        paint: {
          'line-color': '#3B82F6',
          'line-width': 3,
          'line-dasharray': [2, 1],
        },
      });
    }

    // Update or add points source/layer
    if (map.current.getSource(MEASURE_POINTS_SOURCE_ID)) {
      (map.current.getSource(MEASURE_POINTS_SOURCE_ID) as mapboxgl.GeoJSONSource).setData(
        pointsGeoJSON
      );
    } else if (pointsGeoJSON.features.length > 0) {
      map.current.addSource(MEASURE_POINTS_SOURCE_ID, {
        type: 'geojson',
        data: pointsGeoJSON,
      });

      map.current.addLayer({
        id: MEASURE_POINTS_ID,
        type: 'circle',
        source: MEASURE_POINTS_SOURCE_ID,
        paint: {
          'circle-radius': 6,
          'circle-color': '#3B82F6',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });
    }
  }, [measure.points, mapLoaded]);

  // Update cursor for measure mode
  useEffect(() => {
    if (!mapContainer.current) return;

    if (isMeasureMode) {
      mapContainer.current.classList.add('cursor-crosshair');
    } else {
      mapContainer.current.classList.remove('cursor-crosshair');
    }
  }, [isMeasureMode]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full min-h-[400px]" />

      {/* Geocoder Search */}
      <GeocoderSearch />

      {/* Weather Control */}
      <WeatherControl map={mapInstance} />

      {/* Measure Tool */}
      <MeasureTool />

      <style jsx global>{`
        .mapboxgl-popup-content {
          border-radius: 8px;
          padding: 0;
          min-width: 150px;
        }
        .mapboxgl-popup-close-button {
          font-size: 18px;
          width: 24px;
          height: 24px;
          line-height: 24px;
          text-align: center;
          padding: 0;
          top: 4px;
          right: 4px;
          color: #6b7280;
        }
        .mapboxgl-popup-close-button:hover {
          background-color: #f3f4f6;
          border-radius: 4px;
          color: #374151;
        }
        .cursor-crosshair .mapboxgl-canvas {
          cursor: crosshair !important;
        }
      `}</style>
    </div>
  );
}
