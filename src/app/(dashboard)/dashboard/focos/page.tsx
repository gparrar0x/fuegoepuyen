'use client';

import { useState } from 'react';
import { useFireReports, useUpdateFireReport } from '@/hooks/use-fire-reports';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Flame, MapPin, CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react';
import type { FireReport, FireReportStatus } from '@/types/database';

const STATUS_OPTIONS: { value: FireReportStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pendiente', color: 'bg-yellow-500' },
  { value: 'verified', label: 'Verificado', color: 'bg-orange-400' },
  { value: 'active', label: 'Activo', color: 'bg-red-500' },
  { value: 'contained', label: 'Contenido', color: 'bg-orange-500' },
  { value: 'extinguished', label: 'Extinguido', color: 'bg-green-500' },
  { value: 'false_alarm', label: 'Falsa alarma', color: 'bg-gray-400' },
];

export default function FocosPage() {
  const [statusFilter, setStatusFilter] = useState<FireReportStatus | 'all'>('all');
  const [selectedReport, setSelectedReport] = useState<FireReport | null>(null);
  const { toast } = useToast();

  const { data: fireReports = [], isLoading } = useFireReports({
    statuses: statusFilter === 'all' ? undefined : [statusFilter],
  });

  const updateReport = useUpdateFireReport();

  const handleStatusChange = async (reportId: string, newStatus: FireReportStatus) => {
    try {
      await updateReport.mutateAsync({
        id: reportId,
        status: newStatus,
        verified_at: ['verified', 'active', 'contained', 'extinguished'].includes(newStatus)
          ? new Date().toISOString()
          : undefined,
      });
      toast({
        title: 'Estado actualizado',
        description: `El foco ahora está: ${STATUS_OPTIONS.find(s => s.value === newStatus)?.label}`,
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar el estado',
      });
    }
  };

  const getStatusBadge = (status: FireReportStatus) => {
    const option = STATUS_OPTIONS.find((s) => s.value === status);
    return (
      <Badge variant="secondary" className={`${option?.color} text-white`}>
        {option?.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de focos</h1>
          <p className="text-muted-foreground">
            Administra y verifica los reportes de focos de fuego
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as FireReportStatus | 'all')}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-amber-600" />
            Focos de fuego ({fireReports.length})
          </CardTitle>
          <CardDescription>
            Haz clic en un foco para ver detalles y cambiar su estado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : fireReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay focos registrados con este filtro
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estado</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Fuente</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fireReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{report.source}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={report.confidence_score >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {report.confidence_score > 0 && '+'}
                        {report.confidence_score}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(report.created_at).toLocaleString('es-AR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedReport(report)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {report.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleStatusChange(report.id, 'verified')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleStatusChange(report.id, 'false_alarm')}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Detalle del foco
            </DialogTitle>
            <DialogDescription>
              Información completa y opciones de gestión
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estado</p>
                  <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fuente</p>
                  <Badge variant="outline" className="mt-1">{selectedReport.source}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ubicación</p>
                  <p className="font-mono text-sm mt-1">
                    {selectedReport.latitude.toFixed(6)}, {selectedReport.longitude.toFixed(6)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Score de confianza</p>
                  <p className="mt-1 font-semibold">
                    {selectedReport.confidence_score > 0 && '+'}
                    {selectedReport.confidence_score}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Descripción</p>
                  <p className="mt-1 text-sm">
                    {selectedReport.description || 'Sin descripción'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Cambiar estado</p>
                <Select
                  value={selectedReport.status}
                  onValueChange={(v) => handleStatusChange(selectedReport.id, v as FireReportStatus)}
                >
                  <SelectTrigger>
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
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReport(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
