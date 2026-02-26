'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Camera, Loader2, MapPin } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCreateFireReport } from '@/hooks/use-fire-reports'
import { useToast } from '@/hooks/use-toast'

const reportSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  description: z.string().max(500).optional(),
})

type ReportFormData = z.infer<typeof reportSchema>

interface ReportFireFormProps {
  initialLocation?: { lat: number; lng: number }
  onSuccess?: () => void
  onCancel?: () => void
}

export function ReportFireForm({ initialLocation, onSuccess, onCancel }: ReportFireFormProps) {
  const [isLocating, setIsLocating] = useState(false)
  const { toast } = useToast()
  const createReport = useCreateFireReport()

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      latitude: initialLocation?.lat || 0,
      longitude: initialLocation?.lng || 0,
      description: '',
    },
  })

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Tu navegador no soporta geolocalización',
      })
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setValue('latitude', position.coords.latitude)
        form.setValue('longitude', position.coords.longitude)
        setIsLocating(false)
        toast({
          title: 'Ubicación obtenida',
          description: 'Se ha detectado tu ubicación actual',
        })
      },
      (error) => {
        setIsLocating(false)
        toast({
          variant: 'destructive',
          title: 'Error de ubicación',
          description: error.message,
        })
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const onSubmit = async (data: ReportFormData) => {
    try {
      await createReport.mutateAsync({
        latitude: data.latitude,
        longitude: data.longitude,
        description: data.description,
      })

      toast({
        title: 'Reporte enviado',
        description: 'Gracias por reportar. Tu reporte será revisado.',
      })

      onSuccess?.()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo enviar el reporte. Intenta de nuevo.',
      })
    }
  }

  const lat = form.watch('latitude')
  const lng = form.watch('longitude')
  const hasLocation = lat !== 0 && lng !== 0

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          Reportar foco de fuego
        </CardTitle>
        <CardDescription>
          Indica la ubicación del fuego para alertar a los equipos de emergencia
        </CardDescription>
      </CardHeader>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Location */}
          <div className="space-y-2">
            <Label>Ubicación</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={getCurrentLocation}
                disabled={isLocating}
              >
                {isLocating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4 mr-2" />
                )}
                {isLocating ? 'Obteniendo...' : 'Usar mi ubicación'}
              </Button>
            </div>

            {hasLocation && (
              <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                📍 {lat.toFixed(6)}, {lng.toFixed(6)}
              </div>
            )}

            {!hasLocation && !initialLocation && (
              <p className="text-sm text-muted-foreground">
                O haz clic en el mapa para seleccionar la ubicación
              </p>
            )}
          </div>

          {/* Manual coordinates (collapsible) */}
          <details className="group">
            <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
              Ingresar coordenadas manualmente
            </summary>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <Label htmlFor="latitude" className="text-xs">
                  Latitud
                </Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  {...form.register('latitude', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="longitude" className="text-xs">
                  Longitud
                </Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  {...form.register('longitude', { valueAsNumber: true })}
                />
              </div>
            </div>
          </details>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Descripción <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe lo que ves: tamaño aproximado, dirección del viento, etc."
              {...form.register('description')}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          {/* Future: Image upload */}
          <div className="space-y-2 opacity-50">
            <Label className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Foto <span className="text-muted-foreground">(próximamente)</span>
            </Label>
            <Input type="file" accept="image/*" disabled />
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            className="flex-1 bg-amber-700 hover:bg-amber-800"
            disabled={!hasLocation || createReport.isPending}
          >
            {createReport.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <AlertTriangle className="h-4 w-4 mr-2" />
            )}
            Enviar reporte
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
