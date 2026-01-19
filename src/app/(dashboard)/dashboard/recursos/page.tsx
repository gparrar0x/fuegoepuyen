'use client';

import { useState } from 'react';
import { useResources, useCreateResource, useUpdateResource } from '@/hooks/use-resources';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2 } from 'lucide-react';
import type { ResourceType, ResourceStatus, Resource, VolunteerMetadata, WaterTruckMetadata, EquipmentMetadata } from '@/types/database';

const TYPE_OPTIONS: { value: ResourceType; label: string; emoji: string }[] = [
  { value: 'water_truck', label: 'Vehículos', emoji: '🚒' },
  { value: 'volunteer', label: 'Personas', emoji: '👤' },
  { value: 'equipment', label: 'Equipamiento', emoji: '⚒️' },
];

const STATUS_OPTIONS: { value: ResourceStatus; label: string; color: string }[] = [
  { value: 'available', label: 'Disponible', color: 'bg-green-500' },
  { value: 'deployed', label: 'Desplegado', color: 'bg-blue-500' },
  { value: 'offline', label: 'Offline', color: 'bg-gray-400' },
];

export default function RecursosPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newResourceType, setNewResourceType] = useState<ResourceType>('water_truck');
  const [volunteerData, setVolunteerData] = useState<VolunteerMetadata>({});
  const [vehicleData, setVehicleData] = useState<WaterTruckMetadata & { capacity?: string }>({});
  const [equipmentData, setEquipmentData] = useState<EquipmentMetadata>({});
  const { toast } = useToast();

  const { data: resources = [], isLoading } = useResources();

  // Group resources by type
  const vehiculos = resources.filter((r) => r.type === 'water_truck');
  const personas = resources.filter((r) => r.type === 'volunteer');
  const equipamiento = resources.filter((r) => r.type === 'equipment');

  const createResource = useCreateResource();
  const updateResource = useUpdateResource();

  const resetForm = () => {
    setNewResourceType('water_truck');
    setVolunteerData({});
    setVehicleData({});
    setEquipmentData({});
  };

  const handleCreate = async () => {
    let resourceName = '';
    let metadata: VolunteerMetadata | WaterTruckMetadata | EquipmentMetadata = {};
    let capacity: number | undefined;
    let contactPhone: string | undefined;

    if (newResourceType === 'volunteer') {
      if (!volunteerData.nombre_completo) {
        toast({ variant: 'destructive', title: 'Error', description: 'El nombre completo es obligatorio' });
        return;
      }
      resourceName = volunteerData.nombre_completo;
      metadata = volunteerData;
      contactPhone = volunteerData.telefono;
    } else if (newResourceType === 'water_truck') {
      if (!vehicleData.patente) {
        toast({ variant: 'destructive', title: 'Error', description: 'La patente es obligatoria' });
        return;
      }
      resourceName = vehicleData.patente;
      const { capacity: cap, ...vehicleMeta } = vehicleData;
      metadata = vehicleMeta;
      capacity = cap ? parseInt(cap) : undefined;
    } else if (newResourceType === 'equipment') {
      if (!equipmentData.nombre) {
        toast({ variant: 'destructive', title: 'Error', description: 'El nombre es obligatorio' });
        return;
      }
      resourceName = equipmentData.nombre;
      metadata = equipmentData;
    }

    try {
      await createResource.mutateAsync({
        type: newResourceType,
        name: resourceName,
        capacity,
        contact_phone: contactPhone,
        metadata,
      });

      toast({
        title: 'Recurso creado',
        description: 'El recurso se ha registrado correctamente',
      });

      resetForm();
      setIsCreateOpen(false);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo crear el recurso',
      });
    }
  };

  const handleStatusChange = async (resourceId: string, newStatus: ResourceStatus) => {
    try {
      await updateResource.mutateAsync({
        id: resourceId,
        status: newStatus,
        assigned_to: newStatus === 'available' ? null : undefined,
      });
      toast({
        title: 'Estado actualizado',
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar el estado',
      });
    }
  };

  const getStatusBadge = (status: ResourceStatus) => {
    const option = STATUS_OPTIONS.find((s) => s.value === status);
    return (
      <Badge variant="secondary" className={`${option?.color} text-white`}>
        {option?.label}
      </Badge>
    );
  };

  const renderStatusSelect = (resource: Resource) => (
    <Select
      value={resource.status}
      onValueChange={(v) => handleStatusChange(resource.id, v as ResourceStatus)}
    >
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de recursos</h1>
          <p className="text-muted-foreground">
            Administra vehículos, personas y equipamiento
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Agregar recurso
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Agregar nuevo recurso</DialogTitle>
                <DialogDescription>
                  Registra un nuevo vehículo, persona o equipamiento
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>Tipo</Label>
                  <Select
                    value={newResourceType}
                    onValueChange={(v) => setNewResourceType(v as ResourceType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <span>{option.emoji}</span>
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Vehículo fields */}
                {newResourceType === 'water_truck' && (
                  <>
                    <div>
                      <Label>Patente *</Label>
                      <Input
                        value={vehicleData.patente || ''}
                        onChange={(e) => setVehicleData({ ...vehicleData, patente: e.target.value })}
                        placeholder="ABC 123"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Modelo</Label>
                        <Input
                          value={vehicleData.modelo || ''}
                          onChange={(e) => setVehicleData({ ...vehicleData, modelo: e.target.value })}
                          placeholder="Ford F-100"
                        />
                      </div>
                      <div>
                        <Label>Color</Label>
                        <Input
                          value={vehicleData.color || ''}
                          onChange={(e) => setVehicleData({ ...vehicleData, color: e.target.value })}
                          placeholder="Rojo"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Propietario</Label>
                        <Input
                          value={vehicleData.propietario || ''}
                          onChange={(e) => setVehicleData({ ...vehicleData, propietario: e.target.value })}
                          placeholder="Juan Pérez"
                        />
                      </div>
                      <div>
                        <Label>Capacidad (L)</Label>
                        <Input
                          type="number"
                          value={vehicleData.capacity || ''}
                          onChange={(e) => setVehicleData({ ...vehicleData, capacity: e.target.value })}
                          placeholder="10000"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Persona fields */}
                {newResourceType === 'volunteer' && (
                  <>
                    <div>
                      <Label>Nombre completo *</Label>
                      <Input
                        value={volunteerData.nombre_completo || ''}
                        onChange={(e) => setVolunteerData({ ...volunteerData, nombre_completo: e.target.value })}
                        placeholder="Juan Pérez"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>DNI</Label>
                        <Input
                          value={volunteerData.dni || ''}
                          onChange={(e) => setVolunteerData({ ...volunteerData, dni: e.target.value })}
                          placeholder="12345678"
                        />
                      </div>
                      <div>
                        <Label>Edad</Label>
                        <Input
                          type="number"
                          value={volunteerData.edad || ''}
                          onChange={(e) => setVolunteerData({ ...volunteerData, edad: e.target.value ? parseInt(e.target.value) : undefined })}
                          placeholder="35"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Teléfono</Label>
                        <Input
                          value={volunteerData.telefono || ''}
                          onChange={(e) => setVolunteerData({ ...volunteerData, telefono: e.target.value })}
                          placeholder="+54 11 1234-5678"
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={volunteerData.email || ''}
                          onChange={(e) => setVolunteerData({ ...volunteerData, email: e.target.value })}
                          placeholder="juan@email.com"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Equipamiento fields */}
                {newResourceType === 'equipment' && (
                  <>
                    <div>
                      <Label>Nombre *</Label>
                      <Input
                        value={equipmentData.nombre || ''}
                        onChange={(e) => setEquipmentData({ ...equipmentData, nombre: e.target.value })}
                        placeholder="Motosierra"
                      />
                    </div>
                    <div>
                      <Label>Descripción</Label>
                      <Input
                        value={equipmentData.descripcion || ''}
                        onChange={(e) => setEquipmentData({ ...equipmentData, descripcion: e.target.value })}
                        placeholder="Stihl MS 250"
                      />
                    </div>
                  </>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => { resetForm(); setIsCreateOpen(false); }}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate} disabled={createResource.isPending}>
                  {createResource.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Crear recurso
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {TYPE_OPTIONS.map((type) => {
          const count = resources.filter((r) => r.type === type.value).length;
          const available = resources.filter((r) => r.type === type.value && r.status === 'available').length;
          return (
            <Card key={type.value}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{type.label}</CardTitle>
                <span className="text-2xl">{type.emoji}</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">
                  {available} disponibles
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Vehículos Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🚒</span> Vehículos ({vehiculos.length})
              </CardTitle>
              <CardDescription>
                Camiones cisterna y vehículos de apoyo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vehiculos.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No hay vehículos registrados
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patente</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Propietario</TableHead>
                      <TableHead>Capacidad</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehiculos.map((resource) => {
                      const meta = resource.metadata as WaterTruckMetadata;
                      return (
                        <TableRow key={resource.id}>
                          <TableCell className="font-medium">{meta?.patente || resource.name}</TableCell>
                          <TableCell>{meta?.modelo || '-'}</TableCell>
                          <TableCell>{meta?.color || '-'}</TableCell>
                          <TableCell>{meta?.propietario || '-'}</TableCell>
                          <TableCell>
                            {resource.capacity ? `${resource.capacity.toLocaleString()}L` : '-'}
                          </TableCell>
                          <TableCell>{getStatusBadge(resource.status)}</TableCell>
                          <TableCell>{renderStatusSelect(resource)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Personas Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">👤</span> Personas ({personas.length})
              </CardTitle>
              <CardDescription>
                Voluntarios y personal de apoyo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {personas.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No hay personas registradas
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre completo</TableHead>
                      <TableHead>DNI</TableHead>
                      <TableHead>Edad</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {personas.map((resource) => {
                      const meta = resource.metadata as VolunteerMetadata;
                      return (
                        <TableRow key={resource.id}>
                          <TableCell className="font-medium">{meta?.nombre_completo || resource.name}</TableCell>
                          <TableCell>{meta?.dni || '-'}</TableCell>
                          <TableCell>{meta?.edad || '-'}</TableCell>
                          <TableCell>{meta?.telefono || resource.contact_phone || '-'}</TableCell>
                          <TableCell>{meta?.email || '-'}</TableCell>
                          <TableCell>{getStatusBadge(resource.status)}</TableCell>
                          <TableCell>{renderStatusSelect(resource)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Equipamiento Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">⚒️</span> Equipamiento ({equipamiento.length})
              </CardTitle>
              <CardDescription>
                Herramientas y equipos de emergencia
              </CardDescription>
            </CardHeader>
            <CardContent>
              {equipamiento.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No hay equipamiento registrado
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {equipamiento.map((resource) => {
                      const meta = resource.metadata as EquipmentMetadata;
                      return (
                        <TableRow key={resource.id}>
                          <TableCell className="font-medium">{meta?.nombre || resource.name}</TableCell>
                          <TableCell>{meta?.descripcion || '-'}</TableCell>
                          <TableCell>{getStatusBadge(resource.status)}</TableCell>
                          <TableCell>{renderStatusSelect(resource)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
