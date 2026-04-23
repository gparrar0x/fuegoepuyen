# Deployment — Cómo levantar tu propia instancia de Igni

Esta guía te lleva de cero a una instancia funcional en <2 horas. Está pensada para que cualquier brigada, municipio, o grupo regional pueda desplegar Igni sin depender del equipo original.

Si algo en esta guía no te funciona, abrí un issue. Un `DEPLOYMENT.md` que no se puede reproducir es un bug.

---

## Requisitos previos

- Cuenta de **GitHub** (para clonar el repo)
- Cuenta de **Supabase** — plan gratuito alcanza para una región chica ([supabase.com](https://supabase.com))
- Cuenta de **Vercel** o equivalente (Netlify, Railway, VPS propio con Docker)
- **Mapbox** account — plan gratuito: 50k cargas de mapa/mes ([mapbox.com](https://mapbox.com))
- **NASA FIRMS API key** — gratuita ([firms.modaps.eosdis.nasa.gov/api/area/](https://firms.modaps.eosdis.nasa.gov/api/area/))
- Un editor de texto y familiaridad con línea de comandos
- Node.js 20+ y `pnpm` 10+ instalados localmente

Tiempo estimado: 1-2 horas si todo va bien, 3-4 si es la primera vez con Supabase.

---

## 1. Clonar el repo

```bash
git clone https://github.com/gparrar0x/igni.git
cd igni
pnpm install
```

---

## 2. Configurar Supabase

### 2.1 Crear proyecto

1. Ir a [supabase.com/dashboard](https://supabase.com/dashboard) y crear un proyecto nuevo
2. Elegir región cercana a tus usuarios (para LATAM: `sa-east-1` São Paulo)
3. Guardar la password de la DB en un lugar seguro
4. Esperar ~2 minutos a que termine el provisioning

### 2.2 Copiar credenciales

En el dashboard del proyecto, ir a **Settings → API**:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (nunca expongas esto públicamente)

### 2.3 Aplicar migrations

Las migrations están en `supabase/migrations/`. Hay dos formas de aplicarlas:

**Opción A — SQL Editor (más simple):**

1. En el dashboard de Supabase, ir a **SQL Editor**
2. Abrir cada archivo `.sql` de `supabase/migrations/` en orden:
   - `001_initial_schema.sql`
   - `002_allow_public_resource_creation.sql`
   - `003_resource_metadata.sql`
   - `004_optimize_rls_auth_uid.sql`
3. Copiar el contenido de cada uno, pegarlo en el SQL Editor, y ejecutar (`Run`)

**Opción B — Supabase CLI (automatizable):**

```bash
# Instalar CLI si no lo tenés
brew install supabase/tap/supabase  # macOS
# o seguir docs de supabase.com/docs/guides/cli/getting-started

# Link al proyecto
supabase link --project-ref TU_PROJECT_REF

# Push migrations
supabase db push
```

### 2.4 Verificar tablas

En el dashboard, ir a **Table Editor**. Deberías ver:
- `fire_reports`
- `resources`
- `verifications`
- `profiles`
- `jurisdictions` (si aplicaste esa migration)

Si falta alguna, revisar logs del SQL Editor para errores.

---

## 3. Obtener token de Mapbox

1. Ir a [account.mapbox.com](https://account.mapbox.com) → **Tokens**
2. Crear un token público nuevo con scope `styles:read` y `fonts:read`
3. Guardarlo como `NEXT_PUBLIC_MAPBOX_TOKEN`

**Opcional — restringir el token:** agregarle restricciones de URL para prevenir uso indebido si se filtra.

---

## 4. Obtener API key de NASA FIRMS

1. Ir a [firms.modaps.eosdis.nasa.gov/api/area/](https://firms.modaps.eosdis.nasa.gov/api/area/)
2. Registrar email → te llega la key por correo
3. Guardarla como `NASA_FIRMS_KEY`

Sin esta key no hay ingesta automática de focos satelitales. La app funciona sin ella pero perdés la capa más importante de datos.

---

## 5. Configurar variables de entorno locales

```bash
cp .env.local.example .env.local
```

Editar `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ...

# NASA FIRMS
NASA_FIRMS_KEY=TU_FIRMS_KEY

# Cron secret (genera uno random)
CRON_SECRET=usa-openssl-rand-hex-32-aqui
```

Para generar `CRON_SECRET`:
```bash
openssl rand -hex 32
```

---

## 6. Correr localmente

```bash
pnpm dev
```

Abrir [localhost:3000](http://localhost:3000) — deberías ver el mapa.

Si no ves el mapa:
- Verificar que `NEXT_PUBLIC_MAPBOX_TOKEN` esté correcto
- Chequear la consola del navegador por errores
- Verificar que Supabase esté accesible (Settings → API → Project URL funciona en el navegador)

---

## 7. Desplegar a producción

### 7.1 Vercel (recomendado para empezar)

```bash
# Instalar CLI si no la tenés
pnpm add -g vercel

# Desde el directorio del proyecto
vercel

# Seguir las preguntas, linkear a tu cuenta y proyecto
```

En el dashboard de Vercel:
1. **Settings → Environment Variables** — agregar todas las variables de `.env.local`
2. **Settings → Domains** — agregar tu dominio custom si tenés uno
3. El cron job de ingesta FIRMS se activa automáticamente vía `vercel.json`

### 7.2 Self-hosting con Docker (en progreso)

TODO: `Dockerfile` y `docker-compose.yml` pendientes para la Fase 5 del roadmap. Si tu región no puede usar Vercel, abrí un issue y priorizamos esta parte.

---

## 8. Configurar geografía regional

Por default la app está centrada en Epuyén, Chubut, Patagonia Argentina. Para adaptarla a tu región, editar:

- `src/lib/mapbox.ts` — centro inicial del mapa, bounds, zoom
- `src/app/layout.tsx` — metadata (title, description, keywords)
- `src/lib/firms.ts` (si existe) — área geográfica para la query FIRMS

Cambios mínimos sugeridos para una región nueva:
```typescript
// src/lib/mapbox.ts
export const MAP_CENTER: [number, number] = [TU_LNG, TU_LAT]
export const MAP_ZOOM = 10
export const MAP_BOUNDS: [[number, number], [number, number]] = [
  [SW_LNG, SW_LAT],
  [NE_LNG, NE_LAT],
]
```

---

## 9. Monitoreo y operación

### Health check

Endpoint: `GET /api/health` — devuelve 200 si la app responde y Supabase es alcanzable.

### Logs

- **Vercel:** dashboard → proyecto → Logs
- **Supabase:** dashboard → Logs (Auth, Database, API, Realtime)

### Cron de ingesta FIRMS

Corre cada 15 min vía `vercel.json`. Para testear manualmente:

```bash
curl -H "Authorization: Bearer TU_CRON_SECRET" https://TU_DOMINIO/api/cron/ingest-firms
```

### Alertas de uptime

Recomendado: [UptimeRobot](https://uptimerobot.com) (gratis) monitoreando `/api/health` cada 5 min. Si la instancia es operacional en temporada de fuego, considerá un servicio pago con SLA.

---

## 10. Backup y recuperación

### Backup de datos

Supabase plan gratuito: backup diario automático, retención 7 días. Para mayor retención:

```bash
# Dump manual
pg_dump "postgresql://postgres:PASSWORD@HOST:5432/postgres" > backup-$(date +%Y%m%d).sql
```

Programar un cron semanal que suba el dump a S3/Storage de tu preferencia.

### Restauración

```bash
psql "postgresql://postgres:PASSWORD@HOST:5432/postgres" < backup.sql
```

---

## 11. Seguridad mínima

Antes de abrir la instancia al público:

- [ ] RLS policies activas en todas las tablas (las migrations las configuran)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` solo en variables de entorno, nunca en código cliente
- [ ] `CRON_SECRET` seteado y usado por el endpoint de cron
- [ ] Mapbox token con restricciones de URL en producción
- [ ] HTTPS forzado (Vercel lo hace automático)
- [ ] Rate limiting en endpoints de reporte (TODO — issue abierto)

---

## 12. Federación con otras instancias (futuro)

Cuando esté implementado el CAP output (Fase 2 del roadmap), podrás:

- Exponer `/api/alerts/cap.xml` para que otras instancias o sistemas gubernamentales consuman tus focos verificados
- Consumir feeds CAP de instancias vecinas para mostrar focos cross-región en tu mapa

Documentación específica de federación vendrá en `FEDERATION.md` cuando llegue ese hito.

---

## Registrar tu instancia

Cuando tengas una instancia de Igni funcionando en producción, sumá tu despliegue al catálogo público. Abrí un PR al repo principal agregando una línea a `INSTANCES.md`:

```markdown
| Región | URL | Operador | Contacto |
|--------|-----|----------|----------|
| Epuyén, Chubut, AR | https://igni.skyw.app | Brigada Epuyén | ... |
```

Esto permite que otros proyectos, instituciones y la prensa puedan descubrir qué instancias están activas.

---

## Problemas comunes

**`Error: Invalid Supabase URL`**
→ Revisar que la URL en `.env.local` sea exactamente como aparece en el dashboard de Supabase, sin espacios ni slashes extra.

**El mapa no carga pero no hay errores en consola**
→ Verificar que `NEXT_PUBLIC_MAPBOX_TOKEN` empiece con `pk.` (es token público).

**Ingesta FIRMS no trae focos**
→ Confirmar la key con una query directa:
```bash
curl "https://firms.modaps.eosdis.nasa.gov/api/area/csv/TU_KEY/VIIRS_SNPP_NRT/-72,-43,-71,-42/1"
```
Si devuelve datos, revisá los logs del cron. Si no, la key está mal.

**Build falla con `Module not found`**
→ Borrar `.next` y `node_modules`, reinstalar:
```bash
rm -rf .next node_modules
pnpm install
pnpm build
```

---

## Ayuda

- **Issues:** https://github.com/gparrar0x/igni/issues
- **Discusión:** GitHub Discussions (cuando se active)
- **Conducta:** conduct@skywalking.dev

---

*Última actualización: 2026-04-23 · Si esta guía te funcionó, abrí un issue confirmándolo. Si no, abrí uno diciendo dónde se rompió.*
