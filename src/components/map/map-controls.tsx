'use client';

import { useMapStore } from '@/stores/map-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { STATUS_COLORS } from '@/lib/mapbox';
import { Filter, RefreshCw, Truck, Users, Package } from 'lucide-react';
import type { FireReportStatus, ResourceType } from '@/types/database';

const ALL_STATUSES: FireReportStatus[] = [
  'pending',
  'verified',
  'active',
  'contained',
  'extinguished',
  'false_alarm',
];

const STATUS_LABELS: Record<FireReportStatus, string> = {
  pending: 'Pendiente',
  verified: 'Verificado',
  active: 'Activo',
  contained: 'Contenido',
  extinguished: 'Extinguido',
  false_alarm: 'Falsa alarma',
};

const RESOURCE_LABELS: Record<ResourceType, { label: string; icon: React.ReactNode }> = {
  water_truck: { label: 'Camiones cisterna', icon: <Truck className="h-4 w-4" /> },
  volunteer: { label: 'Voluntarios', icon: <Users className="h-4 w-4" /> },
  equipment: { label: 'Equipamiento', icon: <Package className="h-4 w-4" /> },
};

export function MapControls() {
  const { filters, setFilters, resetFilters, isFilterOpen, toggleFilter } = useMapStore();

  const toggleStatus = (status: FireReportStatus) => {
    const current = filters.statuses;
    const updated = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    setFilters({ statuses: updated });
  };

  const toggleResourceType = (type: ResourceType) => {
    const current = filters.resourceTypes;
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    setFilters({ resourceTypes: updated });
  };

  const toggleShowResources = () => {
    setFilters({ showResources: !filters.showResources });
  };

  return (
    <Sheet open={isFilterOpen} onOpenChange={toggleFilter}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="absolute top-4 left-4 z-10 bg-white shadow-md"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {filters.statuses.length < ALL_STATUSES.length && (
            <Badge variant="secondary" className="ml-2">
              {filters.statuses.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>Filtros del mapa</SheetTitle>
          <SheetDescription>
            Filtra los focos y recursos visibles en el mapa
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status filters */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Estado del foco</Label>
            <div className="flex flex-wrap gap-2">
              {ALL_STATUSES.map((status) => (
                <Badge
                  key={status}
                  variant={filters.statuses.includes(status) ? 'default' : 'outline'}
                  className="cursor-pointer transition-colors"
                  style={{
                    backgroundColor: filters.statuses.includes(status)
                      ? STATUS_COLORS[status]
                      : 'transparent',
                    borderColor: STATUS_COLORS[status],
                    color: filters.statuses.includes(status) ? 'white' : STATUS_COLORS[status],
                  }}
                  onClick={() => toggleStatus(status)}
                >
                  {STATUS_LABELS[status]}
                </Badge>
              ))}
            </div>
          </div>

          {/* Resources toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Mostrar recursos</Label>
              <Button
                variant={filters.showResources ? 'default' : 'outline'}
                size="sm"
                onClick={toggleShowResources}
              >
                {filters.showResources ? 'Visible' : 'Oculto'}
              </Button>
            </div>

            {filters.showResources && (
              <div className="flex flex-wrap gap-2">
                {(Object.keys(RESOURCE_LABELS) as ResourceType[]).map((type) => (
                  <Badge
                    key={type}
                    variant={filters.resourceTypes.includes(type) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleResourceType(type)}
                  >
                    {RESOURCE_LABELS[type].icon}
                    <span className="ml-1">{RESOURCE_LABELS[type].label}</span>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Leyenda</Label>
            <div className="space-y-2">
              {ALL_STATUSES.map((status) => (
                <div key={status} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[status] }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {STATUS_LABELS[status]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reset */}
          <Button variant="outline" className="w-full" onClick={resetFilters}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Restablecer filtros
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
