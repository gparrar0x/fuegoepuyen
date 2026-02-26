import { create } from 'zustand'
import type {
  FireIntensity,
  FireReportStatus,
  ResourceStatus,
  ResourceType,
} from '@/types/database'
import type { GeocoderResult, MeasurePoint, WeatherLayerType } from '@/types/map-features'

interface MapFilters {
  statuses: FireReportStatus[]
  intensities: FireIntensity[]
  resourceTypes: ResourceType[]
  resourceStatuses: ResourceStatus[]
  showResources: boolean
  dateRange: {
    from: Date | null
    to: Date | null
  }
}

interface MapState {
  // View state
  center: [number, number]
  zoom: number

  // Selection
  selectedFireId: string | null
  selectedResourceId: string | null

  // Filters
  filters: MapFilters

  // UI state
  isFilterOpen: boolean
  isReportFormOpen: boolean
  reportLocation: { lat: number; lng: number } | null
  isAddMode: boolean
  isResourceMenuOpen: boolean
  isAddResourceMode: boolean
  selectedResourceType: ResourceType | null

  // Geocoder
  geocoderQuery: string
  geocoderResults: GeocoderResult[]
  isGeocoderOpen: boolean

  // Measure
  isMeasureMode: boolean
  measurePoints: MeasurePoint[]
  totalDistance: number

  // Weather
  weatherLayerVisible: boolean
  activeWeatherLayer: WeatherLayerType | null

  // Isochrone
  isochroneVisible: boolean
  isochroneResourceId: string | null
  isochroneData: GeoJSON.FeatureCollection | null

  // Actions
  setCenter: (center: [number, number]) => void
  setZoom: (zoom: number) => void
  setSelectedFireId: (id: string | null) => void
  setSelectedResourceId: (id: string | null) => void
  setFilters: (filters: Partial<MapFilters>) => void
  resetFilters: () => void
  toggleFilter: () => void
  openReportForm: (location: { lat: number; lng: number }) => void
  closeReportForm: () => void
  toggleAddMode: () => void
  setAddMode: (active: boolean) => void
  toggleResourceMenu: () => void
  selectResourceType: (type: ResourceType) => void
  clearResourceMode: () => void

  // Geocoder actions
  setGeocoderQuery: (query: string) => void
  setGeocoderResults: (results: GeocoderResult[]) => void
  setGeocoderOpen: (open: boolean) => void
  clearGeocoder: () => void

  // Measure actions
  toggleMeasureMode: () => void
  addMeasurePoint: (point: MeasurePoint) => void
  setTotalDistance: (distance: number) => void
  clearMeasure: () => void

  // Weather actions
  setWeatherLayer: (layer: WeatherLayerType | null) => void
  toggleWeatherVisibility: () => void

  // Isochrone actions
  setIsochroneResource: (resourceId: string | null) => void
  setIsochroneData: (data: GeoJSON.FeatureCollection | null) => void
  toggleIsochroneVisibility: () => void
}

const defaultFilters: MapFilters = {
  statuses: ['pending', 'verified', 'active', 'contained'],
  intensities: ['low', 'medium', 'high', 'extreme'],
  resourceTypes: ['water_truck', 'volunteer', 'equipment'],
  resourceStatuses: ['available', 'deployed'],
  showResources: true,
  dateRange: {
    from: null,
    to: null,
  },
}

export const useMapStore = create<MapState>((set) => ({
  // Initial view centered on Epuyén, Chubut (Patagonia)
  center: [-71.37, -42.23],
  zoom: 10,

  selectedFireId: null,
  selectedResourceId: null,

  filters: defaultFilters,

  isFilterOpen: false,
  isReportFormOpen: false,
  reportLocation: null,
  isAddMode: false,
  isResourceMenuOpen: false,
  isAddResourceMode: false,
  selectedResourceType: null,

  // Geocoder initial state
  geocoderQuery: '',
  geocoderResults: [],
  isGeocoderOpen: false,

  // Measure initial state
  isMeasureMode: false,
  measurePoints: [],
  totalDistance: 0,

  // Weather initial state
  weatherLayerVisible: false,
  activeWeatherLayer: null,

  // Isochrone initial state
  isochroneVisible: false,
  isochroneResourceId: null,
  isochroneData: null,

  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  setSelectedFireId: (id) => set({ selectedFireId: id, selectedResourceId: null }),
  setSelectedResourceId: (id) => set({ selectedResourceId: id, selectedFireId: null }),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  resetFilters: () => set({ filters: defaultFilters }),

  toggleFilter: () => set((state) => ({ isFilterOpen: !state.isFilterOpen })),

  openReportForm: (location) =>
    set({
      isReportFormOpen: true,
      reportLocation: location,
    }),

  closeReportForm: () =>
    set({
      isReportFormOpen: false,
      reportLocation: null,
    }),

  toggleAddMode: () => set((state) => ({ isAddMode: !state.isAddMode })),
  setAddMode: (active) => set({ isAddMode: active }),
  toggleResourceMenu: () =>
    set((state) => ({
      isResourceMenuOpen: !state.isResourceMenuOpen,
      isAddMode: false, // Close fire add mode
    })),
  selectResourceType: (type) =>
    set({
      selectedResourceType: type,
      isResourceMenuOpen: false,
      isAddResourceMode: true,
      isAddMode: false,
    }),
  clearResourceMode: () =>
    set({
      isAddResourceMode: false,
      selectedResourceType: null,
      isResourceMenuOpen: false,
    }),

  // Geocoder actions
  setGeocoderQuery: (query) => set({ geocoderQuery: query }),
  setGeocoderResults: (results) => set({ geocoderResults: results }),
  setGeocoderOpen: (open) => set({ isGeocoderOpen: open }),
  clearGeocoder: () =>
    set({
      geocoderQuery: '',
      geocoderResults: [],
      isGeocoderOpen: false,
    }),

  // Measure actions
  toggleMeasureMode: () =>
    set((state) => ({
      isMeasureMode: !state.isMeasureMode,
      measurePoints: state.isMeasureMode ? [] : state.measurePoints,
      totalDistance: state.isMeasureMode ? 0 : state.totalDistance,
    })),
  addMeasurePoint: (point) =>
    set((state) => ({
      measurePoints: [...state.measurePoints, point],
    })),
  setTotalDistance: (distance) => set({ totalDistance: distance }),
  clearMeasure: () =>
    set({
      measurePoints: [],
      totalDistance: 0,
    }),

  // Weather actions
  setWeatherLayer: (layer) =>
    set({
      activeWeatherLayer: layer,
      weatherLayerVisible: layer !== null,
    }),
  toggleWeatherVisibility: () =>
    set((state) => ({
      weatherLayerVisible: !state.weatherLayerVisible,
    })),

  // Isochrone actions
  setIsochroneResource: (resourceId) => set({ isochroneResourceId: resourceId }),
  setIsochroneData: (data) => set({ isochroneData: data }),
  toggleIsochroneVisibility: () =>
    set((state) => ({
      isochroneVisible: !state.isochroneVisible,
    })),
}))
