'use client'

import { Check, Loader2, Pencil, X } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreateFireReport } from '@/hooks/use-fire-reports'
import {
  useCreateResource,
  useResource,
  useResources,
  useUpdateResource,
} from '@/hooks/use-resources'
import { useToast } from '@/hooks/use-toast'
import { useMapStore } from '@/stores/map-store'
import type {
  EquipmentMetadata,
  ResourceType,
  VolunteerMetadata,
  WaterTruckMetadata,
} from '@/types/database'

const RESOURCE_ICONS: Record<ResourceType, string> = {
  water_truck: '🚒',
  volunteer: '👤',
  equipment: '⚒️',
}

const FireMap = dynamic(() => import('@/components/map/fire-map').then((mod) => mod.FireMap), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-100 animate-pulse" />,
})

interface ClickPosition {
  x: number
  y: number
  lng: number
  lat: number
}

const RESOURCE_OPTIONS: { type: ResourceType; label: string }[] = [
  { type: 'water_truck', label: 'Vehículo' },
  { type: 'volunteer', label: 'Persona' },
  { type: 'equipment', label: 'Equipamiento' },
]

export default function DashboardPage() {
  const { toast } = useToast()
  const createReport = useCreateFireReport()
  const createResource = useCreateResource()
  const popupRef = useRef<HTMLDivElement>(null)
  const resourcePopupRef = useRef<HTMLDivElement>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  const {
    isAddMode,
    toggleAddMode,
    setAddMode,
    isResourceMenuOpen,
    isAddResourceMode,
    selectedResourceType,
    toggleResourceMenu,
    selectResourceType,
    clearResourceMode,
    selectedResourceId,
    setSelectedResourceId,
  } = useMapStore()

  // Fire report state
  const [clickPosition, setClickPosition] = useState<ClickPosition | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  // Resource state
  const [resourceClickPosition, setResourceClickPosition] = useState<ClickPosition | null>(null)
  const [pendingResourceType, setPendingResourceType] = useState<ResourceType | null>(null)

  // Type-specific metadata state
  const [volunteerData, setVolunteerData] = useState<VolunteerMetadata>({})
  const [vehicleData, setVehicleData] = useState<WaterTruckMetadata>({})
  const [equipmentData, setEquipmentData] = useState<EquipmentMetadata>({})

  // Resource detail/edit state
  const resourceDetailRef = useRef<HTMLDivElement>(null)
  const [isEditingResource, setIsEditingResource] = useState(false)
  const [editVolunteerData, setEditVolunteerData] = useState<VolunteerMetadata>({})
  const [editVehicleData, setEditVehicleData] = useState<WaterTruckMetadata>({})
  const [editEquipmentData, setEditEquipmentData] = useState<EquipmentMetadata>({})

  // Fetch selected resource
  const { data: selectedResource } = useResource(selectedResourceId)
  const updateResource = useUpdateResource()

  // Fetch volunteers for owner selection
  const { data: volunteers = [] } = useResources({ types: ['volunteer'] })

  // Close fire popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        handleCancel()
      }
    }

    if (clickPosition) {
      const timeout = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 100)
      return () => {
        clearTimeout(timeout)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [clickPosition, handleCancel])

  // Close resource popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (resourcePopupRef.current && !resourcePopupRef.current.contains(e.target as Node)) {
        handleResourceCancel()
      }
    }

    if (resourceClickPosition) {
      const timeout = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 100)
      return () => {
        clearTimeout(timeout)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [resourceClickPosition, handleResourceCancel])

  // Close resource detail popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (resourceDetailRef.current && !resourceDetailRef.current.contains(e.target as Node)) {
        handleCloseResourceDetail()
      }
    }

    if (selectedResourceId) {
      const timeout = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 100)
      return () => {
        clearTimeout(timeout)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [selectedResourceId, handleCloseResourceDetail])

  // Initialize edit data when resource is selected
  useEffect(() => {
    if (selectedResource) {
      const metadata = selectedResource.metadata || {}
      if (selectedResource.type === 'volunteer') {
        setEditVolunteerData(metadata as VolunteerMetadata)
      } else if (selectedResource.type === 'water_truck') {
        setEditVehicleData(metadata as WaterTruckMetadata)
      } else if (selectedResource.type === 'equipment') {
        setEditEquipmentData(metadata as EquipmentMetadata)
      }
    }
  }, [selectedResource])

  const handleMapClick = (
    lngLat: { lng: number; lat: number },
    point: { x: number; y: number },
  ) => {
    // Handle fire report click
    if (isAddMode) {
      setClickPosition({
        x: point.x,
        y: point.y,
        lng: lngLat.lng,
        lat: lngLat.lat,
      })
      setAddMode(false)
      return
    }

    // Handle resource click
    if (isAddResourceMode && selectedResourceType) {
      setPendingResourceType(selectedResourceType) // Save type before clearing
      setResourceClickPosition({
        x: point.x,
        y: point.y,
        lng: lngLat.lng,
        lat: lngLat.lat,
      })
      clearResourceMode()
      return
    }
  }

  const handleCancel = () => {
    setClickPosition(null)
    setName('')
    setDescription('')
  }

  const handleSave = async () => {
    if (!clickPosition) return

    try {
      await createReport.mutateAsync({
        latitude: clickPosition.lat,
        longitude: clickPosition.lng,
        description: name
          ? `${name}${description ? `: ${description}` : ''}`
          : description || undefined,
      })

      toast({
        title: 'Foco reportado',
        description: 'El reporte fue enviado correctamente',
      })

      handleCancel()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo guardar el reporte',
      })
    }
  }

  const handleResourceCancel = () => {
    setResourceClickPosition(null)
    setPendingResourceType(null)
    setVolunteerData({})
    setVehicleData({})
    setEquipmentData({})
  }

  const handleCloseResourceDetail = () => {
    setSelectedResourceId(null)
    setIsEditingResource(false)
    setEditVolunteerData({})
    setEditVehicleData({})
    setEditEquipmentData({})
  }

  const handleStartEditResource = () => {
    setIsEditingResource(true)
  }

  const handleCancelEditResource = () => {
    setIsEditingResource(false)
    // Reset to original values
    if (selectedResource) {
      const metadata = selectedResource.metadata || {}
      if (selectedResource.type === 'volunteer') {
        setEditVolunteerData(metadata as VolunteerMetadata)
      } else if (selectedResource.type === 'water_truck') {
        setEditVehicleData(metadata as WaterTruckMetadata)
      } else if (selectedResource.type === 'equipment') {
        setEditEquipmentData(metadata as EquipmentMetadata)
      }
    }
  }

  const handleSaveResourceEdit = async () => {
    if (!selectedResource) return

    let resourceName = selectedResource.name
    let metadata = {}

    if (selectedResource.type === 'volunteer') {
      resourceName = editVolunteerData.nombre_completo || selectedResource.name
      metadata = editVolunteerData
    } else if (selectedResource.type === 'water_truck') {
      resourceName = editVehicleData.patente || editVehicleData.modelo || selectedResource.name
      metadata = editVehicleData
    } else if (selectedResource.type === 'equipment') {
      resourceName = editEquipmentData.nombre || selectedResource.name
      metadata = editEquipmentData
    }

    try {
      await updateResource.mutateAsync({
        id: selectedResource.id,
        name: resourceName,
        metadata,
      })

      toast({
        title: 'Recurso actualizado',
        description: 'Los cambios fueron guardados correctamente',
      })

      setIsEditingResource(false)
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron guardar los cambios',
      })
    }
  }

  const handleResourceSave = async () => {
    if (!resourceClickPosition || !pendingResourceType) return

    // Build name and metadata based on resource type
    let resourceName = ''
    let metadata = {}

    if (pendingResourceType === 'volunteer') {
      resourceName = volunteerData.nombre_completo || 'Persona sin nombre'
      metadata = volunteerData
    } else if (pendingResourceType === 'water_truck') {
      resourceName = vehicleData.patente || vehicleData.modelo || 'Vehículo sin nombre'
      metadata = vehicleData
    } else if (pendingResourceType === 'equipment') {
      resourceName = equipmentData.nombre || 'Equipamiento sin nombre'
      metadata = equipmentData
    }

    try {
      await createResource.mutateAsync({
        type: pendingResourceType,
        name: resourceName,
        latitude: resourceClickPosition.lat,
        longitude: resourceClickPosition.lng,
        metadata,
      })

      toast({
        title: 'Recurso agregado',
        description: 'El recurso fue posicionado correctamente',
      })

      handleResourceCancel()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo guardar el recurso',
      })
    }
  }

  // Calculate popup position (keep it within viewport)
  const getPopupStyle = (position: ClickPosition | null) => {
    if (!position || !mapContainerRef.current) return {}

    const container = mapContainerRef.current
    const popupWidth = 320
    const popupHeight = 300

    let left = position.x - popupWidth / 2
    let top = position.y - popupHeight - 16

    if (left < 8) left = 8
    if (left + popupWidth > container.clientWidth - 8) {
      left = container.clientWidth - popupWidth - 8
    }
    if (top < 8) {
      top = position.y + 16
    }

    return {
      left: `${left}px`,
      top: `${top}px`,
    }
  }

  const handleFireFabClick = () => {
    if (isResourceMenuOpen) {
      toggleResourceMenu()
    }
    toggleAddMode()
  }

  const handleResourceFabClick = () => {
    if (isAddMode) {
      setAddMode(false)
    }
    toggleResourceMenu()
  }

  return (
    <div ref={mapContainerRef} className="absolute inset-0">
      <FireMap
        interactive={true}
        className={`w-full h-full ${isAddMode || isAddResourceMode ? 'cursor-crosshair' : ''}`}
        onMapClick={handleMapClick}
      />

      {/* FAB Buttons Container - below search bar */}
      <div className="absolute top-[60px] left-4 z-10 flex flex-col gap-3">
        {/* Fire FAB */}
        <div className="relative">
          <Button
            size="icon"
            onClick={handleFireFabClick}
            className={`h-12 w-12 rounded-full p-0 transition-all border-2 aspect-square ${
              isAddMode
                ? 'bg-red-600 hover:bg-red-700 border-red-400 rotate-45 shadow-[0_4px_14px_rgba(239,68,68,0.4)]'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-600 shadow-[0_4px_14px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]'
            }`}
            data-testid="add-fire-fab"
          >
            {isAddMode ? <X className="h-5 w-5" /> : <span className="text-lg">🔥</span>}
          </Button>
          {isAddMode && (
            <div className="absolute top-1/2 -translate-y-1/2 left-full ml-3 bg-slate-800 text-white text-sm px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg border border-slate-600">
              Toca en el mapa para marcar foco
            </div>
          )}
        </div>

        {/* Resource FAB */}
        <div className="relative">
          <Button
            size="icon"
            onClick={handleResourceFabClick}
            className={`h-12 w-12 rounded-full p-0 transition-all border-2 aspect-square ${
              isResourceMenuOpen || isAddResourceMode
                ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-400 shadow-[0_4px_14px_rgba(16,185,129,0.4)]'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-600 shadow-[0_4px_14px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]'
            }`}
            data-testid="add-resource-fab"
          >
            {isResourceMenuOpen ? <X className="h-5 w-5" /> : <span className="text-lg">🚒</span>}
          </Button>

          {/* Resource Type Submenu */}
          {isResourceMenuOpen && (
            <div className="absolute top-1/2 -translate-y-1/2 left-full ml-3 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden">
              <div className="flex gap-1 p-2">
                {RESOURCE_OPTIONS.map(({ type, label }) => (
                  <Button
                    key={type}
                    size="icon"
                    onClick={() => selectResourceType(type)}
                    className="h-10 w-10 rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-500 text-lg"
                    title={label}
                  >
                    {RESOURCE_ICONS[type]}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Resource Mode Tooltip */}
          {isAddResourceMode && selectedResourceType && (
            <div className="absolute top-1/2 -translate-y-1/2 left-full ml-3 bg-slate-800 text-white text-sm px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg border border-slate-600 flex items-center gap-2">
              <span className="text-base">{RESOURCE_ICONS[selectedResourceType]}</span>
              Toca en el mapa para posicionar{' '}
              {RESOURCE_OPTIONS.find((r) => r.type === selectedResourceType)?.label.toLowerCase()}
            </div>
          )}
        </div>
      </div>

      {/* Fire Report Popup */}
      {clickPosition && (
        <div
          ref={popupRef}
          className="absolute z-20 w-[280px] bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden"
          style={getPopupStyle(clickPosition)}
        >
          <div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-800 border-r border-b border-slate-600 rotate-45"
            style={{ display: getPopupStyle(clickPosition).top?.includes('-') ? 'none' : 'block' }}
          />

          <div className="p-3 space-y-3">
            <div className="flex items-center gap-2 text-orange-400">
              <span>🔥</span>
              <span className="text-sm font-medium">Nuevo foco</span>
            </div>
            <Input
              placeholder="Nombre (opcional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-9"
              autoFocus
            />
            <Textarea
              placeholder="Descripción (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 min-h-[60px] resize-none"
              rows={2}
            />
            <div className="flex justify-end gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCancel}
                className="h-9 w-9 rounded-full text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                onClick={handleSave}
                disabled={createReport.isPending}
                className="h-9 w-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {createReport.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Resource Popup */}
      {resourceClickPosition && (
        <div
          ref={resourcePopupRef}
          className="absolute z-20 w-[320px] bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden max-h-[80vh] overflow-y-auto"
          style={getPopupStyle(resourceClickPosition)}
        >
          <div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-800 border-r border-b border-slate-600 rotate-45"
            style={{
              display: getPopupStyle(resourceClickPosition).top?.includes('-') ? 'none' : 'block',
            }}
          />

          <div className="p-3 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="text-base">
                {pendingResourceType && RESOURCE_ICONS[pendingResourceType]}
              </span>
              <span className="text-sm font-medium">
                Nuevo{' '}
                {RESOURCE_OPTIONS.find((r) => r.type === pendingResourceType)?.label.toLowerCase()}
              </span>
            </div>

            {/* Volunteer (Persona) Fields */}
            {pendingResourceType === 'volunteer' && (
              <div className="space-y-2">
                <Input
                  placeholder="Nombre completo *"
                  value={volunteerData.nombre_completo || ''}
                  onChange={(e) =>
                    setVolunteerData({ ...volunteerData, nombre_completo: e.target.value })
                  }
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-9"
                  autoFocus
                />
                <Input
                  placeholder="DNI"
                  value={volunteerData.dni || ''}
                  onChange={(e) => setVolunteerData({ ...volunteerData, dni: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-9"
                />
                <Input
                  type="number"
                  placeholder="Edad"
                  value={volunteerData.edad || ''}
                  onChange={(e) =>
                    setVolunteerData({
                      ...volunteerData,
                      edad: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    })
                  }
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-9"
                />
                <Input
                  type="tel"
                  placeholder="Teléfono"
                  value={volunteerData.telefono || ''}
                  onChange={(e) => setVolunteerData({ ...volunteerData, telefono: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-9"
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={volunteerData.email || ''}
                  onChange={(e) => setVolunteerData({ ...volunteerData, email: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-9"
                />
              </div>
            )}

            {/* Vehicle (Vehículo) Fields */}
            {pendingResourceType === 'water_truck' && (
              <div className="space-y-2">
                <Input
                  placeholder="Patente *"
                  value={vehicleData.patente || ''}
                  onChange={(e) =>
                    setVehicleData({ ...vehicleData, patente: e.target.value.toUpperCase() })
                  }
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-9 uppercase"
                  autoFocus
                />
                <Input
                  placeholder="Modelo"
                  value={vehicleData.modelo || ''}
                  onChange={(e) => setVehicleData({ ...vehicleData, modelo: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-9"
                />
                <Input
                  placeholder="Color"
                  value={vehicleData.color || ''}
                  onChange={(e) => setVehicleData({ ...vehicleData, color: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-9"
                />
                <Select
                  value={vehicleData.propietario || ''}
                  onValueChange={(value) => setVehicleData({ ...vehicleData, propietario: value })}
                >
                  <SelectTrigger
                    className="bg-slate-700 border-slate-600 text-white h-9"
                    data-testid="resource-create-propietario"
                  >
                    <SelectValue placeholder="Propietario" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {volunteers.map((v) => (
                      <SelectItem
                        key={v.id}
                        value={v.id}
                        className="text-white focus:bg-slate-700 focus:text-white"
                        data-testid={`resource-create-propietario-option-${v.id}`}
                      >
                        {(v.metadata as VolunteerMetadata).nombre_completo || v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Equipment (Equipamiento) Fields */}
            {pendingResourceType === 'equipment' && (
              <div className="space-y-2">
                <Input
                  placeholder="Nombre *"
                  value={equipmentData.nombre || ''}
                  onChange={(e) => setEquipmentData({ ...equipmentData, nombre: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-9"
                  autoFocus
                />
                <Textarea
                  placeholder="Descripción"
                  value={equipmentData.descripcion || ''}
                  onChange={(e) =>
                    setEquipmentData({ ...equipmentData, descripcion: e.target.value })
                  }
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 min-h-[60px] resize-none"
                  rows={2}
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleResourceCancel}
                className="h-9 w-9 rounded-full text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                onClick={handleResourceSave}
                disabled={createResource.isPending}
                className="h-9 w-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {createResource.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Resource Detail/Edit Popup */}
      {selectedResource && (
        <div
          ref={resourceDetailRef}
          className="absolute top-4 right-14 z-20 w-[320px] bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden"
          data-testid="resource-detail-popup"
        >
          <div className="p-3 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="text-base">{RESOURCE_ICONS[selectedResource.type]}</span>
                <span className="text-sm font-medium capitalize" data-testid="resource-detail-type">
                  {RESOURCE_OPTIONS.find((r) => r.type === selectedResource.type)?.label}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {!isEditingResource && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleStartEditResource}
                    className="h-7 w-7 text-slate-400 hover:text-white hover:bg-slate-700"
                    data-testid="resource-detail-edit-btn"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCloseResourceDetail}
                  className="h-7 w-7 text-slate-400 hover:text-white hover:bg-slate-700"
                  data-testid="resource-detail-close-btn"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Volunteer (Persona) Fields */}
            {selectedResource.type === 'volunteer' && (
              <div className="space-y-2">
                {isEditingResource ? (
                  <>
                    <Input
                      placeholder="Nombre completo *"
                      value={editVolunteerData.nombre_completo || ''}
                      onChange={(e) =>
                        setEditVolunteerData({
                          ...editVolunteerData,
                          nombre_completo: e.target.value,
                        })
                      }
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-9"
                      autoFocus
                    />
                    <Input
                      placeholder="DNI"
                      value={editVolunteerData.dni || ''}
                      onChange={(e) =>
                        setEditVolunteerData({ ...editVolunteerData, dni: e.target.value })
                      }
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-9"
                    />
                    <Input
                      type="number"
                      placeholder="Edad"
                      value={editVolunteerData.edad || ''}
                      onChange={(e) =>
                        setEditVolunteerData({
                          ...editVolunteerData,
                          edad: e.target.value ? parseInt(e.target.value, 10) : undefined,
                        })
                      }
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-9"
                    />
                    <Input
                      type="tel"
                      placeholder="Teléfono"
                      value={editVolunteerData.telefono || ''}
                      onChange={(e) =>
                        setEditVolunteerData({ ...editVolunteerData, telefono: e.target.value })
                      }
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-9"
                    />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={editVolunteerData.email || ''}
                      onChange={(e) =>
                        setEditVolunteerData({ ...editVolunteerData, email: e.target.value })
                      }
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-9"
                    />
                  </>
                ) : (
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nombre</span>
                      <span className="text-white">
                        {(selectedResource.metadata as VolunteerMetadata).nombre_completo || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">DNI</span>
                      <span className="text-white">
                        {(selectedResource.metadata as VolunteerMetadata).dni || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Edad</span>
                      <span className="text-white">
                        {(selectedResource.metadata as VolunteerMetadata).edad || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Teléfono</span>
                      <span className="text-white">
                        {(selectedResource.metadata as VolunteerMetadata).telefono || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Email</span>
                      <span className="text-white">
                        {(selectedResource.metadata as VolunteerMetadata).email || '-'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Vehicle (Vehículo) Fields */}
            {selectedResource.type === 'water_truck' && (
              <div className="space-y-2" data-testid="resource-detail-vehicle-fields">
                {isEditingResource ? (
                  <>
                    <Input
                      placeholder="Patente *"
                      value={editVehicleData.patente || ''}
                      onChange={(e) =>
                        setEditVehicleData({
                          ...editVehicleData,
                          patente: e.target.value.toUpperCase(),
                        })
                      }
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-9 uppercase"
                      autoFocus
                      data-testid="resource-edit-patente"
                    />
                    <Input
                      placeholder="Modelo"
                      value={editVehicleData.modelo || ''}
                      onChange={(e) =>
                        setEditVehicleData({ ...editVehicleData, modelo: e.target.value })
                      }
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-9"
                      data-testid="resource-edit-modelo"
                    />
                    <Input
                      placeholder="Color"
                      value={editVehicleData.color || ''}
                      onChange={(e) =>
                        setEditVehicleData({ ...editVehicleData, color: e.target.value })
                      }
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-9"
                      data-testid="resource-edit-color"
                    />
                    <Select
                      value={editVehicleData.propietario || ''}
                      onValueChange={(value) =>
                        setEditVehicleData({ ...editVehicleData, propietario: value })
                      }
                    >
                      <SelectTrigger
                        className="bg-slate-700 border-slate-600 text-white h-9"
                        data-testid="resource-edit-propietario"
                      >
                        <SelectValue placeholder="Propietario" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        {volunteers.map((v) => (
                          <SelectItem
                            key={v.id}
                            value={v.id}
                            className="text-white focus:bg-slate-700 focus:text-white"
                            data-testid={`resource-edit-propietario-option-${v.id}`}
                          >
                            {(v.metadata as VolunteerMetadata).nombre_completo || v.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                ) : (
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Patente</span>
                      <span className="text-white font-mono">
                        {(selectedResource.metadata as WaterTruckMetadata).patente || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Modelo</span>
                      <span className="text-white">
                        {(selectedResource.metadata as WaterTruckMetadata).modelo || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Color</span>
                      <span className="text-white">
                        {(selectedResource.metadata as WaterTruckMetadata).color || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Propietario</span>
                      <span className="text-white">
                        {(() => {
                          const ownerId = (selectedResource.metadata as WaterTruckMetadata)
                            .propietario
                          if (!ownerId) return '-'
                          const owner = volunteers.find((v) => v.id === ownerId)
                          return owner
                            ? (owner.metadata as VolunteerMetadata).nombre_completo || owner.name
                            : '-'
                        })()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Equipment (Equipamiento) Fields */}
            {selectedResource.type === 'equipment' && (
              <div className="space-y-2">
                {isEditingResource ? (
                  <>
                    <Input
                      placeholder="Nombre *"
                      value={editEquipmentData.nombre || ''}
                      onChange={(e) =>
                        setEditEquipmentData({ ...editEquipmentData, nombre: e.target.value })
                      }
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-9"
                      autoFocus
                    />
                    <Textarea
                      placeholder="Descripción"
                      value={editEquipmentData.descripcion || ''}
                      onChange={(e) =>
                        setEditEquipmentData({ ...editEquipmentData, descripcion: e.target.value })
                      }
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 min-h-[60px] resize-none"
                      rows={2}
                    />
                  </>
                ) : (
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nombre</span>
                      <span className="text-white">
                        {(selectedResource.metadata as EquipmentMetadata).nombre || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Descripción</span>
                      <p className="text-white mt-0.5">
                        {(selectedResource.metadata as EquipmentMetadata).descripcion || '-'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Status badge */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-700">
              <span className="text-xs text-slate-400">Estado</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedResource.status === 'available'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : selectedResource.status === 'deployed'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-slate-500/20 text-slate-400'
                }`}
                data-testid="resource-detail-status"
              >
                {selectedResource.status === 'available'
                  ? 'Disponible'
                  : selectedResource.status === 'deployed'
                    ? 'Desplegado'
                    : 'Offline'}
              </span>
            </div>

            {/* Edit mode buttons */}
            {isEditingResource && (
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCancelEditResource}
                  className="h-9 w-9 rounded-full text-slate-400 hover:text-white hover:bg-slate-700"
                  data-testid="resource-detail-cancel-btn"
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  onClick={handleSaveResourceEdit}
                  disabled={updateResource.isPending}
                  className="h-9 w-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  data-testid="resource-detail-save-btn"
                >
                  {updateResource.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
