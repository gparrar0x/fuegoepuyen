'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ReportFireForm } from '@/components/forms/report-fire-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, MapPin } from 'lucide-react';

// Dynamic import for map (no SSR)
const FireMap = dynamic(
  () => import('@/components/map/fire-map').then((mod) => mod.FireMap),
  { ssr: false, loading: () => <MapSkeleton /> }
);

function MapSkeleton() {
  return (
    <div className="w-full h-full min-h-[300px] bg-gray-100 animate-pulse flex items-center justify-center rounded-lg">
      <p className="text-muted-foreground">Cargando mapa...</p>
    </div>
  );
}

export default function ReportarPage() {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleMapClick = (lngLat: { lng: number; lat: number }) => {
    setSelectedLocation({ lat: lngLat.lat, lng: lngLat.lng });
  };

  const handleSuccess = () => {
    router.push('/');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <AlertTriangle className="h-8 w-8 text-orange-500" />
            Reportar foco de fuego
          </h1>
          <p className="text-muted-foreground mt-2">
            Ayuda a detectar incendios forestales reportando lo que ves
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Map for location selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Selecciona la ubicación
              </CardTitle>
              <CardDescription>
                Haz clic en el mapa para marcar dónde está el foco de fuego
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] rounded-lg overflow-hidden border">
                <FireMap onMapClick={handleMapClick} className="h-full" />
              </div>
              {selectedLocation && (
                <p className="text-sm text-muted-foreground mt-2">
                  📍 Ubicación seleccionada: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Report form */}
          <ReportFireForm
            initialLocation={selectedLocation || undefined}
            onSuccess={handleSuccess}
          />
        </div>

        {/* Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Consejos para un buen reporte</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-orange-500">•</span>
                <span>Asegúrate de que la ubicación sea lo más precisa posible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500">•</span>
                <span>Describe el tamaño aproximado del fuego (pequeño, mediano, grande)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500">•</span>
                <span>Indica si hay humo visible y su dirección</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500">•</span>
                <span>Menciona si hay estructuras o personas cerca</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500">•</span>
                <span>
                  <strong>En caso de emergencia, llama al 100 (Bomberos) o 911</strong>
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
