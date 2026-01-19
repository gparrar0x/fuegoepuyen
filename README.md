# Fuego Alerta Argentina

Sistema de gestión de incendios forestales con crowdsourcing para Argentina.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Estilos**: Tailwind CSS + shadcn/ui
- **Mapa**: Mapbox GL JS
- **Estado**: Zustand + React Query
- **Backend**: Supabase (Auth, DB, Realtime)
- **Deploy**: Vercel

## Setup

1. Clonar y configurar variables de entorno:

```bash
cp .env.local.example .env.local
```

2. Completar las variables en `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`: URL de tu proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon key de Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (solo para cron)
- `NEXT_PUBLIC_MAPBOX_TOKEN`: Token de Mapbox (crear en mapbox.com)
- `NASA_FIRMS_KEY`: API key de NASA FIRMS (gratis en https://firms.modaps.eosdis.nasa.gov/api/area/)

3. Aplicar migrations en Supabase:

Copia el contenido de `supabase/migrations/001_initial_schema.sql` y ejecuta en el SQL Editor de Supabase.

4. Instalar dependencias y ejecutar:

```bash
pnpm install
pnpm dev
```

## Estructura

```
src/
├── app/
│   ├── (public)/           # Rutas públicas (mapa, reportar)
│   ├── (dashboard)/        # Dashboard admin
│   └── api/                # API routes (cron, auth)
├── components/
│   ├── map/               # Componentes del mapa
│   ├── forms/             # Formularios
│   ├── dashboard/         # Componentes del dashboard
│   └── ui/                # shadcn/ui components
├── hooks/                 # React Query hooks
├── lib/                   # Utilities (Supabase, NASA FIRMS)
├── stores/               # Zustand stores
└── types/                # TypeScript types
```

## Features

- Mapa en tiempo real con focos de fuego
- Crowdsourcing de reportes
- Ingesta automática de NASA FIRMS (cada 15min)
- Dashboard de gestión para admins
- Sistema de verificación con upvotes
- Gestión de recursos (camiones, voluntarios)

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/fuego-alerta)

Configurar las variables de entorno en Vercel y el cron job se activará automáticamente.
