'use client';

import { useWeatherLayer } from '@/hooks/use-weather-layer';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Cloud, Thermometer, Wind, Droplets, Gauge, X } from 'lucide-react';
import type { WeatherLayerType } from '@/types/map-features';
import { WEATHER_LAYERS } from '@/types/map-features';

const LAYER_ICONS: Record<WeatherLayerType, React.ReactNode> = {
  temp_new: <Thermometer className="h-4 w-4" />,
  precipitation_new: <Droplets className="h-4 w-4" />,
  wind_new: <Wind className="h-4 w-4" />,
  clouds_new: <Cloud className="h-4 w-4" />,
  pressure_new: <Gauge className="h-4 w-4" />,
};

interface WeatherControlProps {
  map: mapboxgl.Map | null;
}

export function WeatherControl({ map }: WeatherControlProps) {
  const { isVisible, activeLayer, setLayer, isConfigured } = useWeatherLayer(map);

  if (!isConfigured) {
    return null;
  }

  return (
    <div
      className="absolute top-16 right-4 z-10"
      data-testid="weather-control"
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={isVisible ? 'default' : 'outline'}
            size="sm"
            className="bg-white shadow-md"
            data-testid="weather-toggle"
          >
            <Cloud className="h-4 w-4 mr-1" />
            {activeLayer ? WEATHER_LAYERS[activeLayer] : 'Clima'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {(Object.keys(WEATHER_LAYERS) as WeatherLayerType[]).map((layer) => (
            <DropdownMenuItem
              key={layer}
              onClick={() => setLayer(layer)}
              className="cursor-pointer"
              data-testid={`weather-layer-${layer}`}
            >
              <span className="mr-2">{LAYER_ICONS[layer]}</span>
              {WEATHER_LAYERS[layer]}
              {activeLayer === layer && (
                <span className="ml-auto text-primary">✓</span>
              )}
            </DropdownMenuItem>
          ))}
          {activeLayer && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setLayer(null)}
                className="cursor-pointer text-destructive"
                data-testid="weather-layer-off"
              >
                <X className="h-4 w-4 mr-2" />
                Desactivar
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
