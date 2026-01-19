'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useMapStore } from '@/stores/map-store';
import { useCreateFireReport } from '@/hooks/use-fire-reports';
import { useCreateResource } from '@/hooks/use-resources';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, X, Check, Loader2 } from 'lucide-react';
import type { ResourceType, VolunteerMetadata, WaterTruckMetadata, EquipmentMetadata } from '@/types/database';

const RESOURCE_ICONS: Record<ResourceType, string> = {
  water_truck: '🚒',
  volunteer: '👤',
  equipment: '⚒️',
};

const FireMap = dynamic(
  () => import('@/components/map/fire-map').then((mod) => mod.FireMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-slate-100 animate-pulse" /> }
);

interface ClickPosition {
  x: number;
  y: number;
  lng: number;
  lat: number;
}

const RESOURCE_OPTIONS: { type: ResourceType; label: string }[] = [
  { type: 'water_truck', label: 'Vehículo' },
  { type: 'volunteer', label: 'Persona' },
  { type: 'equipment', label: 'Equipamiento' },
];

export default function DashboardPage() {
  const { toast } = useToast();
  const createReport = useCreateFireReport();
  const createResource = useCreateResource();
  const popupRef = useRef<HTMLDivElement>(null);
  const resourcePopupRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

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
  } = useMapStore();

  // Fire report state
  const [clickPosition, setClickPosition] = useState<ClickPosition | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Resource state
  const [resourceClickPosition, setResourceClickPosition] = useState<ClickPosition | null>(null);
  const [pendingResourceType, setPendingResourceType] = useState<ResourceType | null>(null);

  // Type-specific metadata state
  const [volunteerData, setVolunteerData] = useState<VolunteerMetadata>({});
  const [vehicleData, setVehicleData] = useState<WaterTruckMetadata>({});
  const [equipmentData, setEquipmentData] = useState<EquipmentMetadata>({});

  // Close fire popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        handleCancel();
      }
    };

    if (clickPosition) {
      const timeout = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      return () => {
        clearTimeout(timeout);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [clickPosition]);

  // Close resource popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (resourcePopupRef.current && !resourcePopupRef.current.contains(e.target as Node)) {
        handleResourceCancel();
      }
    };

    if (resourceClickPosition) {
      const timeout = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      return () => {
        clearTimeout(timeout);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [resourceClickPosition]);

  const handleMapClick = (lngLat: { lng: number; lat: number }, point: { x: number; y: number }) => {
    // Handle fire report click
    if (isAddMode) {
      setClickPosition({
        x: point.x,
        y: point.y,
        lng: lngLat.lng,
        lat: lngLat.lat,
      });
      setAddMode(false);
      return;
    }

    // Handle resource click
    if (isAddResourceMode && selectedResourceType) {
      setPendingResourceType(selectedResourceType); // Save type before clearing
      setResourceClickPosition({
        x: point.x,
        y: point.y,
        lng: lngLat.lng,
        lat: lngLat.lat,
      });
      clearResourceMode();
      return;
    }
  };

  const handleCancel = () => {
    setClickPosition(null);
    setName('');
    setDescription('');
  };

  const handleSave = async () => {
    if (!clickPosition) return;

    try {
      await createReport.mutateAsync({
        latitude: clickPosition.lat,
        longitude: clickPosition.lng,
        description: name ? `${name}${description ? ': ' + description : ''}` : description || undefined,
      });

      toast({
        title: 'Foco reportado',
        description: 'El reporte fue enviado correctamente',
      });

      handleCancel();
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo guardar el reporte',
      });
    }
  };

  const handleResourceCancel = () => {
    setResourceClickPosition(null);
    setPendingResourceType(null);
    setVolunteerData({});
    setVehicleData({});
    setEquipmentData({});
  };

  const handleResourceSave = async () => {
    if (!resourceClickPosition || !pendingResourceType) return;

    // Build name and metadata based on resource type
    let resourceName = '';
    let metadata = {};

    if (pendingResourceType === 'volunteer') {
      resourceName = volunteerData.nombre_completo || 'Persona sin nombre';
      metadata = volunteerData;
    } else if (pendingResourceType === 'water_truck') {
      resourceName = vehicleData.patente || vehicleData.modelo || 'Vehículo sin nombre';
      metadata = vehicleData;
    } else if (pendingResourceType === 'equipment') {
      resourceName = equipmentData.nombre || 'Equipamiento sin nombre';
      metadata = equipmentData;
    }

    try {
      await createResource.mutateAsync({
        type: pendingResourceType,
        name: resourceName,
        latitude: resourceClickPosition.lat,
        longitude: resourceClickPosition.lng,
        metadata,
      });

      toast({
        title: 'Recurso agregado',
        description: 'El recurso fue posicionado correctamente',
      });

      handleResourceCancel();
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo guardar el recurso',
      });
    }
  };

  // Calculate popup position (keep it within viewport)
  const getPopupStyle = (position: ClickPosition | null) => {
    if (!position || !mapContainerRef.current) return {};

    const container = mapContainerRef.current;
    const popupWidth = 320;
    const popupHeight = 300;

    let left = position.x - popupWidth / 2;
    let top = position.y - popupHeight - 16;

    if (left < 8) left = 8;
    if (left + popupWidth > container.clientWidth - 8) {
      left = container.clientWidth - popupWidth - 8;
    }
    if (top < 8) {
      top = position.y + 16;
    }

    return {
      left: `${left}px`,
      top: `${top}px`,
    };
  };

  const handleFireFabClick = () => {
    if (isResourceMenuOpen) {
      toggleResourceMenu();
    }
    toggleAddMode();
  };

  const handleResourceFabClick = () => {
    if (isAddMode) {
      setAddMode(false);
    }
    toggleResourceMenu();
  };

  return (
    <div ref={mapContainerRef} className="absolute inset-0">
      <FireMap
        interactive={true}
        className={`w-full h-full ${isAddMode || isAddResourceMode ? 'cursor-crosshair' : ''}`}
        onMapClick={handleMapClick}
      />

      {/* FAB Buttons Container */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-3">
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
            {isAddMode ? (
              <X className="h-5 w-5" />
            ) : (
              <span className="text-lg">🔥</span>
            )}
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
            {isResourceMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <span className="text-lg">🚒</span>
            )}
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
              Toca en el mapa para posicionar {RESOURCE_OPTIONS.find(r => r.type === selectedResourceType)?.label.toLowerCase()}
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
            style={{ display: getPopupStyle(resourceClickPosition).top?.includes('-') ? 'none' : 'block' }}
          />

          <div className="p-3 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="text-base">{pendingResourceType && RESOURCE_ICONS[pendingResourceType]}</span>
              <span className="text-sm font-medium">Nuevo {RESOURCE_OPTIONS.find(r => r.type === pendingResourceType)?.label.toLowerCase()}</span>
            </div>

            {/* Volunteer (Persona) Fields */}
            {pendingResourceType === 'volunteer' && (
              <div className="space-y-2">
                <Input
                  placeholder="Nombre completo *"
                  value={volunteerData.nombre_completo || ''}
                  onChange={(e) => setVolunteerData({ ...volunteerData, nombre_completo: e.target.value })}
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
                  onChange={(e) => setVolunteerData({ ...volunteerData, edad: e.target.value ? parseInt(e.target.value) : undefined })}
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
                  onChange={(e) => setVehicleData({ ...vehicleData, patente: e.target.value.toUpperCase() })}
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
                <Input
                  placeholder="Propietario"
                  value={vehicleData.propietario || ''}
                  onChange={(e) => setVehicleData({ ...vehicleData, propietario: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-9"
                />
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
                  onChange={(e) => setEquipmentData({ ...equipmentData, descripcion: e.target.value })}
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
    </div>
  );
}
