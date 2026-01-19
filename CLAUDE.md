# Fuego Epuyén

> Sistema de monitoreo y reporte de incendios forestales - Epuyén, Chubut, Patagonia Argentina

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **UI:** Tailwind CSS + shadcn/ui
- **State:** Zustand (map-store)
- **DB:** Supabase (Postgres + Realtime + Auth)
- **Maps:** Mapbox GL JS (satellite-streets-v12)
- **Package manager:** pnpm

## Estructura

```
src/
├── app/
│   ├── (public)/        # Mapa público, reportar
│   └── (dashboard)/     # Panel de control (sin auth requerido)
├── components/
│   ├── map/             # FireMap, MapControls
│   ├── forms/           # ReportFireForm
│   └── ui/              # shadcn components
├── hooks/               # use-fire-reports, use-resources
├── stores/              # map-store (Zustand)
├── lib/
│   ├── supabase/        # client, server, admin
│   └── mapbox.ts        # config, colores, estilos
└── types/               # database.ts
```

## Base de datos

**Tablas principales:**
- `fire_reports` - Focos de fuego (lat, lng, status, intensity, source)
- `resources` - Camiones, voluntarios, equipamiento
- `verifications` - Votos de verificación de reportes
- `profiles` - Perfiles de usuario extendidos

**Estados de foco:** `pending` → `verified` → `active` → `contained` → `extinguished` | `false_alarm`

**Intensidades:** `low`, `medium`, `high`, `extreme`

## Configuración

Variables requeridas en `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=
```

## Mapa

- **Centro inicial:** Epuyén, Chubut (-71.37, -42.23)
- **Zoom inicial:** 10
- **Estilo:** satellite-streets-v12

Los marcadores de fuego usan tamaño según intensidad y color según estado.

## Paleta de colores

Tema "Patagónico":
- **Primary:** Azul glaciar (#0F4C75)
- **Accent:** Verde bosque (#2D5A3D)
- **Destructive:** Naranja tierra (#C2410C)
- **Alertas:** Ámbar (#D97706)

## Comandos

```bash
pnpm dev          # Dev server (default: 3001)
pnpm build        # Build producción
pnpm lint         # ESLint
```

## Convenciones

- Componentes client-side: `'use client'` al inicio
- Hooks de datos: `use-*.ts` con React Query
- Supabase client: siempre verificar null antes de usar
- Mapbox: dynamic import con `ssr: false`
- IDs de test: `data-testid` en elementos interactivos

## Prioridades actuales

1. Visualización de focos por tamaño/intensidad en mapa
2. Ubicación de recursos en tiempo real
3. Dashboard operativo sin fricción (sin login)
