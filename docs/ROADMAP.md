# Fuego Alerta - Roadmap de Features

> Documento de referencia para evolución del producto

---

## Estado Actual (v0.1)

- [x] Mapa tiempo real con Mapbox (satellite-streets)
- [x] Ingesta NASA FIRMS cada 15min
- [x] Reportes comunitarios con verificación
- [x] Gestión recursos (camiones, voluntarios, equipo)
- [x] Dashboard operacional con FABs
- [x] Realtime subscriptions Supabase
- [x] RLS policies

---

## Quick Wins (1-2 días c/u)

| Feature | Descripción | Impacto | Agente |
|---------|-------------|---------|--------|
| PWA + Push | Service worker, manifest, notificaciones push para focos cercanos | Alto | Pixel |
| Modo offline | Queue reportes sin conexión, sync al reconectar | Alto | Pixel |
| Foto en reportes | Upload imagen desde cámara/galería a Supabase Storage | Alto | Kokoro + Pixel |
| Compartir alerta | Botón share para redes sociales/WhatsApp con preview | Medio | Pixel |
| Filtro temporal | Slider para ver focos por rango de fechas | Medio | Pixel |

---

## Medium Effort (3-5 días)

| Feature | Descripción | Impacto | Agente |
|---------|-------------|---------|--------|
| Weather overlay | Capa de viento, humedad, temp (OpenWeather/Windy API) | Alto | Kokoro + Pixel |
| Asignación recursos→focos | Vincular recurso a foco activo, tracking de respuesta | Alto | Pixel + Kokoro |
| WhatsApp bot | Recibir reportes vía WA, notificar por zona | Alto | Flux |
| Analytics dashboard | Histórico, heatmap zonas riesgo, tendencias | Medio | Pixel + Kokoro |
| Gamificación | Badges, karma, leaderboard verificadores | Medio | Pixel + Kokoro |
| Áreas de influencia | Radio de cobertura por recurso, zonas jurisdiccionales | Alto | Pixel + Kokoro |

---

## Bigger Bets (1+ semana)

| Feature | Descripción | Impacto | Agente |
|---------|-------------|---------|--------|
| Predicción propagación | Modelo con viento + vegetación + topografía | Alto | Kokoro |
| Twitter/X monitoring | Detectar reportes tempranos en redes | Medio | Flux |
| Rutas evacuación | Calcular y mostrar rutas seguras desde punto | Alto | Kokoro + Pixel |
| App nativa | React Native/Expo para mejor UX móvil | Medio | Pixel |
| Isochrones | Áreas alcanzables en X minutos desde recurso | Alto | Kokoro + Pixel |

---

## Áreas de Influencia (Detalle)

### Concepto
Cada entidad (recurso, cuartel, zona) tiene un **área de cobertura** visualizada en el mapa.

### Tipos de Áreas

| Entidad | Radio/Forma | Color | Uso |
|---------|-------------|-------|-----|
| Camión cisterna | 5-15km círculo | Azul semitransparente | Cobertura de respuesta |
| Voluntario | 2-5km círculo | Verde semitransparente | Área de movilización |
| Cuartel bomberos | Polígono jurisdiccional | Naranja borde | Responsabilidad territorial |
| Zona de riesgo | Polígono irregular | Rojo semitransparente | Vegetación seca, histórico |
| Foco activo | Círculo dinámico | Rojo gradiente | Radio de peligro estimado |

### Implementación Técnica

```typescript
// Mapbox GL JS - Circle layer para recursos
map.addSource('resource-coverage', {
  type: 'geojson',
  data: resourcesGeoJSON
});

map.addLayer({
  id: 'coverage-circles',
  type: 'circle',
  source: 'resource-coverage',
  paint: {
    'circle-radius': ['get', 'coverageRadius'], // km → pixels
    'circle-color': ['get', 'color'],
    'circle-opacity': 0.2,
    'circle-stroke-width': 2,
    'circle-stroke-color': ['get', 'color']
  }
});

// Turf.js para polígonos de jurisdicción
import * as turf from '@turf/turf';
const buffer = turf.buffer(point, radius, { units: 'kilometers' });
```

### Cambios en DB

```sql
-- Agregar a resources
ALTER TABLE resources ADD COLUMN coverage_radius_km DECIMAL(5,2) DEFAULT 10;

-- Nueva tabla para jurisdicciones
CREATE TABLE jurisdictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'fire_station', 'municipality', 'province'
  geometry GEOMETRY(Polygon, 4326) NOT NULL,
  responsible_org TEXT,
  contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jurisdictions_geometry ON jurisdictions USING GIST(geometry);
```

---

## Funciones del Mapa (Nuevas)

### Capas y Visualización

| Feature | Descripción | Prioridad |
|---------|-------------|-----------|
| **Layer switcher** | Toggle: satélite, topográfico, streets, dark | Alta |
| **Heatmap de focos** | Densidad de focos históricos | Media |
| **Clustering** | Agrupar marcadores cuando hay muchos | Alta |
| **Terrain 3D** | Elevación para entender propagación | Media |
| **Weather layer** | Viento (flechas), humedad, temp | Alta |

### Herramientas de Interacción

| Feature | Descripción | Prioridad |
|---------|-------------|-----------|
| **Measure tool** | Medir distancia y área | Media |
| **Draw tool** | Dibujar polígonos de zona de riesgo | Media |
| **Time slider** | Ver focos por rango temporal | Alta |
| **Fly to** | Búsqueda de ubicación con autocomplete | Alta |
| **Fullscreen** | Modo pantalla completa | Baja |

### Análisis Espacial

| Feature | Descripción | Prioridad |
|---------|-------------|-----------|
| **Isochrones** | Áreas alcanzables en 5/10/15 min | Alta |
| **Nearest resource** | Calcular recurso más cercano a foco | Alta |
| **Route to fire** | Ruta óptima desde recurso a foco | Alta |
| **Buffer analysis** | Focos dentro de X km de poblaciones | Media |
| **Overlap detection** | Focos en múltiples jurisdicciones | Baja |

### Implementación Sugerida

```typescript
// Layer switcher con Mapbox
const STYLES = {
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  outdoors: 'mapbox://styles/mapbox/outdoors-v12',
  dark: 'mapbox://styles/mapbox/dark-v11',
  streets: 'mapbox://styles/mapbox/streets-v12'
};

// Heatmap layer
map.addLayer({
  id: 'fire-heat',
  type: 'heatmap',
  source: 'fires',
  paint: {
    'heatmap-weight': ['interpolate', ['linear'], ['get', 'confidence_score'], 0, 0, 100, 1],
    'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 15, 3],
    'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 15, 20],
    'heatmap-color': [
      'interpolate', ['linear'], ['heatmap-density'],
      0, 'rgba(0,0,0,0)',
      0.2, 'rgb(255,237,160)',
      0.4, 'rgb(254,178,76)',
      0.6, 'rgb(253,141,60)',
      0.8, 'rgb(240,59,32)',
      1, 'rgb(189,0,38)'
    ]
  }
});

// Isochrones con Mapbox API
const isochroneUrl = `https://api.mapbox.com/isochrone/v1/mapbox/driving/${lng},${lat}?contours_minutes=5,10,15&polygons=true&access_token=${token}`;

// Clustering
map.addSource('fires-clustered', {
  type: 'geojson',
  data: firesGeoJSON,
  cluster: true,
  clusterMaxZoom: 14,
  clusterRadius: 50
});
```

---

## Priorización Actual

### Próximas Features (Priorizadas)

| Feature | Descripción | Complejidad | Agente |
|---------|-------------|-------------|--------|
| **Fly to** | Búsqueda de ubicación con geocoding y autocomplete Mapbox | Baja | Pixel |
| **Isochrones** | Áreas alcanzables en 5/10/15 min desde recurso seleccionado | Media | Pixel + Kokoro |
| **Weather overlay** | Capa de viento (flechas), humedad, temperatura | Media | Kokoro + Pixel |
| **Measure tool** | Medir distancia entre puntos en el mapa | Baja | Pixel |

### Detalle Técnico

#### Fly to (Geocoding)
```typescript
// Mapbox Geocoder control
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

map.addControl(
  new MapboxGeocoder({
    accessToken: MAPBOX_TOKEN,
    mapboxgl: mapboxgl,
    placeholder: 'Buscar ubicación...',
    countries: 'ar', // Solo Argentina
    bbox: [-73, -55, -53, -21], // Bounds Argentina
    language: 'es'
  }),
  'top-left'
);
```

#### Isochrones
```typescript
// Mapbox Isochrone API
const getIsochrone = async (lng: number, lat: number, minutes: number[]) => {
  const url = `https://api.mapbox.com/isochrone/v1/mapbox/driving/${lng},${lat}?contours_minutes=${minutes.join(',')}&polygons=true&access_token=${MAPBOX_TOKEN}`;
  const res = await fetch(url);
  return res.json(); // GeoJSON FeatureCollection
};

// Colores por tiempo
const ISOCHRONE_COLORS = {
  5: '#00ff00',   // Verde - 5 min
  10: '#ffff00',  // Amarillo - 10 min
  15: '#ff0000'   // Rojo - 15 min
};
```

#### Weather Overlay
```typescript
// OpenWeather Tile Layer
const WEATHER_TILES = {
  wind: 'https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${OWM_KEY}',
  temp: 'https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OWM_KEY}',
  clouds: 'https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${OWM_KEY}'
};

map.addSource('weather', {
  type: 'raster',
  tiles: [WEATHER_TILES.wind],
  tileSize: 256
});

map.addLayer({
  id: 'weather-layer',
  type: 'raster',
  source: 'weather',
  paint: { 'raster-opacity': 0.6 }
});
```

#### Measure Tool
```typescript
// Turf.js para distancia
import { distance, lineString } from '@turf/turf';

const measureDistance = (points: [number, number][]) => {
  if (points.length < 2) return 0;
  const line = lineString(points);
  return distance(points[0], points[points.length - 1], { units: 'kilometers' });
};

// UI: click para agregar puntos, doble-click para terminar
```

### Backlog (Futuro)

1. Clustering de marcadores
2. Layer switcher (satélite/topo/dark)
3. Áreas de influencia para recursos
4. Ruta recurso → foco
5. Heatmap histórico
6. Time slider
7. Draw tool para zonas
8. Terrain 3D

---

## Notas Técnicas

- **Mapbox GL JS** soporta todo lo listado nativamente
- **Turf.js** para cálculos geoespaciales client-side
- **PostGIS** ya habilitado en Supabase para queries espaciales
- **Mapbox APIs**: Isochrone, Directions, Geocoding (requieren tokens adicionales)
- **Weather**: OpenWeather, Windy, Tomorrow.io tienen APIs gratis tier

---

*Última actualización: 2025-01-18*
