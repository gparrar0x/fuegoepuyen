# Igni — Roadmap

> Plan de acción bajo el frame OSS/bien común digital. Actualizado: 2026-04-23
> Referencias: `MARKET_RESEARCH.md`, `OSS_DEEP_DIVE.md`

---

## Principio rector

Igni es un **bien común digital open-source**. La comunidad (brigadas, vecinos, Defensa Civil) es el producto y el cliente al mismo tiempo. El éxito se mide en adopción comunitaria, confiabilidad operacional y replicabilidad regional — no en MAU ni ARR.

Tres reglas que ordenan todo lo que sigue:
1. **Comunidad antes que features.** Un feature sin brigada que lo use es deuda.
2. **Integrar antes que construir.** Si existe un proyecto OSS maduro que resuelve una capa, lo consumimos.
3. **Interoperabilidad por default.** Datos en formatos estándar (CAP, GeoJSON, FIRMS). Nada de lock-in.

---

## Estado actual (v0.1)

- [x] Mapa tiempo real con Mapbox (satellite-streets)
- [x] Ingesta NASA FIRMS cada 15min
- [x] Reportes comunitarios con verificación
- [x] Gestión recursos (camiones, voluntarios, equipo)
- [x] Dashboard operacional con FABs
- [x] Realtime subscriptions Supabase
- [x] RLS policies
- [x] Rebrand local `fuegoepuyen` → `igni` (código, GitHub repo, docs)

Pendiente del rebrand: Vercel project + dominio `igni.skyw.app` + Supabase project name (bloqueado por acceso cross-team).

---

## Cuatro tracks paralelos

Cada track avanza independiente, con su propio owner. La sincronización sucede en review semanal.

| Track | Pregunta que responde | Owner inicial |
|---|---|---|
| **1. Fundaciones OSS** | ¿Puede Igni sobrevivir sin Gonza? | Gonza |
| **2. Interop + Integraciones** | ¿Podemos hablar con el resto del ecosistema? | Kokoro |
| **3. Features core** | ¿Las brigadas pueden operar con esto en temporada? | Pixel |
| **4. Comunidad + Piloto** | ¿Quién lo usa en Epuyén esta temporada? | Gonza |

---

## Fase 1 — Fundaciones OSS (próximas 2-3 semanas)

Sin esto no hay release pública. No hay versión pública de un bien común sin gobernanza mínima.

| Entregable | Descripción | Esfuerzo | Bloquea a |
|---|---|---|---|
| `LICENSE` (AGPL-3.0) | Licencia que fuerza contribuciones upstream de gobiernos/municipios | 1h | Release pública |
| `CONTRIBUTING.md` | Cómo contribuir: issues, PRs, code of conduct | 4h | Onboarding de 2º maintainer |
| `GOVERNANCE.md` | Roles, proceso de decisión, sucesión | 6h | Bus factor mitigation |
| `DEPLOYMENT.md` | Cómo levantar una instancia desde cero | 1d | Replicabilidad regional |
| Open Collective | Fiscal host: Open Source Collective. Recibir donaciones sin crear fundación | 2h | Financiamiento |
| 2º maintainer | Persona con acceso de merge + deploy | 1-2 semanas | Todo lo demás |
| `CODE_OF_CONDUCT.md` | Contributor Covenant 2.1 | 30min | Onboarding |
| Datos bajo CC BY 4.0 | Compromiso escrito: los datos no dependen del código | 1h | Confianza comunitaria |

**Hito de fase:** primer release pública `v0.2.0` con licencia + governance + fiscal host activo.

---

## Fase 2 — Interop mínima (mes 1-2)

Lo que convierte a Igni de "app local" a "infraestructura".

| Entregable | Descripción | Esfuerzo | Dependencias |
|---|---|---|---|
| **CAP output** | `/api/alerts/cap.xml` emite focos verificados en Common Alerting Protocol | 2-3d | Ninguna |
| **etl-firms fork** | Pipeline FIRMS propio basado en TAK-NZ/etl-firms. Sink a Supabase. | 3-5d | Verificar licencia del repo |
| **GeoJSON export** | `/api/fires.geojson` para QGIS / otros sistemas | 1d | Ninguna |
| **FIRMS multi-país** | Extender ingesta más allá de Argentina (Chile, Uruguay, Bolivia) | 2d | etl-firms fork |
| **API docs pública** | OpenAPI spec + Swagger UI | 2d | Endpoints estabilizados |

**Hito de fase:** Igni emite CAP + consume FIRMS propio, no depende de la UI de NASA ni de terceros.

---

## Fase 3 — Piloto comunitario Epuyén (mes 2-3)

El feedback de una temporada de fuego vale más que 6 meses de dev en soledad.

| Entregable | Descripción |
|---|---|
| Contacto formal brigadas Epuyén + El Bolsón | Reunión presencial, no emails |
| 2-5 verificadores expertos onboarded | Acceso con rol `verifier` en DB |
| Deploy con dominio `igni.skyw.app` | Una instancia estable, SSL, uptime monitoring |
| Ritual semanal durante temporada | Review de reportes, falsos positivos, feature requests |
| Playbook operacional | Documento corto (2-3 pp) que la brigada imprime y pega en el cuartel |
| Métricas baseline | Nº reportes, % verificados en <1h, zonas cubiertas |

**Hito de fase:** una brigada real reporta que Igni les ayudó en al menos 1 evento operacional.

---

## Fase 4 — Alertas multi-canal (mes 3-4)

Lo que el análisis de mercado confirmó como must-have que Igni aún no tiene.

| Entregable | Vía | Esfuerzo |
|---|---|---|
| **PWA + Push** | Service worker, manifest, web push para focos cercanos | 2-3d |
| **Modo offline** | Queue reportes sin conexión, sync al reconectar | 3-4d |
| **WhatsApp alerts** | Twilio / WhatsApp Business API para zona suscrita | 4-5d |
| **SMS alerts** | Fallback para zonas sin smartphone. Twilio Argentina. | 2-3d |
| **Integración FireAlert** | Consumir su webhook o self-hostear. Decisión según licencia. | 3-5d |
| **Foto en reportes** | Upload a Supabase Storage desde móvil | 2d |

**Hito de fase:** alertas llegan por los 4 canales (push, WhatsApp, SMS, email) y hay modo offline funcional.

---

## Fase 5 — Replicabilidad + Federación (mes 4-6)

Lo que convierte a Igni de "una instancia en Patagonia" a "infraestructura replicable".

| Entregable | Descripción |
|---|---|
| Segunda instancia real | Otra provincia o municipio deploya Igni con `DEPLOYMENT.md`. Si no se puede reproducir, el DEPLOYMENT.md falló. |
| Catálogo público de instancias | Tipo `joinmastodon.org` pero para Igni |
| OpenEWS partnership | Contacto con open-ews.org, evaluar si Igni emite eventos a su broadcast layer |
| DPGA application | Registro en Digital Public Goods Alliance |
| NLnet grant application | Budget €15-30K para infra + dev de interop + outreach |
| Federation protocol | Definir cómo comparten focos verificados entre instancias (CAP como candidato) |

**Hito de fase:** hay al menos 2 instancias Igni activas en producción, operadas por equipos distintos, compartiendo datos opcionalmente.

---

## Features técnicos (backlog priorizado)

Features valiosos pero subordinados a los tracks de arriba. Se atacan cuando apoyan directamente un hito de fase.

### Mapa — Capas y Visualización

| Feature | Fase | Prioridad | Agente |
|---|---|---|---|
| **Layer switcher** (satélite/topo/dark) | 3 | Alta | Pixel |
| **Heatmap histórico** | 5 | Media | Pixel |
| **Clustering** de marcadores | 3 | Alta | Pixel |
| **Weather overlay** (viento, humedad, temp) | 4 | Alta | Kokoro + Pixel |
| **Terrain 3D** | Parked | Baja | — |
| **Time slider** (rango temporal) | 4 | Media | Pixel |

### Mapa — Análisis espacial

| Feature | Fase | Prioridad | Agente |
|---|---|---|---|
| **Fly to** (geocoding + autocomplete) | 3 | Alta | Pixel |
| **Isochrones** (5/10/15 min desde recurso) | 4 | Alta | Pixel + Kokoro |
| **Nearest resource** a foco | 4 | Alta | Kokoro |
| **Route to fire** | 4 | Alta | Kokoro + Pixel |
| **Buffer analysis** (focos cerca de poblaciones) | 5 | Media | Kokoro |
| **Measure tool** | 3 | Media | Pixel |
| **Draw tool** (zonas de riesgo) | 5 | Media | Pixel |

### Áreas de influencia

Cada entidad (recurso, cuartel, zona) tiene un **área de cobertura** visualizada.

| Entidad | Forma | Fase |
|---|---|---|
| Camión cisterna | 5-15km círculo | 4 |
| Voluntario | 2-5km círculo | 4 |
| Cuartel bomberos | Polígono jurisdiccional | 5 |
| Zona de riesgo | Polígono irregular | 5 |
| Foco activo | Círculo dinámico | 3 |

Cambios de DB necesarios:
```sql
ALTER TABLE resources ADD COLUMN coverage_radius_km DECIMAL(5,2) DEFAULT 10;

CREATE TABLE jurisdictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  geometry GEOMETRY(Polygon, 4326) NOT NULL,
  responsible_org TEXT,
  contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jurisdictions_geometry ON jurisdictions USING GIST(geometry);
```

---

## Parked / baja prioridad

Explícitamente fuera del roadmap 2026. Razones documentadas para evitar scope creep.

| Feature | Razón |
|---|---|
| **PyroNear + cámaras IoT** | Curiosidad técnica, no pedido comunitario. Costo hardware $500-800/nodo, mantenimiento operativo. Reabrir si una brigada lo pide y aporta presupuesto. |
| **Predicción de propagación** | Integrar con Wildfire Commons o modelos existentes cuando sea necesario. No entrenar modelo propio. |
| **App nativa (React Native)** | PWA primero. App nativa solo si PWA no alcanza operacionalmente. |
| **Twitter/X monitoring** | Fuera del frame OSS/comunidad. Puede venir de otro lado (brigadas ya están en WhatsApp). |
| **Gamificación (badges, karma)** | Anti-patrón en emergencias serias. Socava credibilidad de verificación. |
| **ODIN-fire integration** | Stack Rust + bus factor alto. Solo referencia de diseño. |

---

## Decisiones pendientes

Lista viva. Se resuelven en review semanal.

| Decisión | Opciones | Recomendación | Deadline |
|---|---|---|---|
| Licencia | MIT / AGPL-3 / dual | AGPL-3 (ver `MARKET_RESEARCH.md` §5) | Antes de Fase 1 cierre |
| Fiscal host | OSS Collective / Software Freedom Conservancy | OSS Collective para empezar | Fase 1 |
| Vercel team | Migrar a Skywalking / quedarse en personal | Migrar a Skywalking (alinea con multi-cuenta) | Con rebrand |
| Supabase project | Rename en dashboard (solo cosmético) | Hacer cuando haya tiempo, no bloquea nada | — |
| Proveedor SMS | Twilio / MessageBird / local | Twilio por cobertura Argentina | Fase 4 |
| FireAlert: fork o consume? | Fork AGPL / consume webhook / self-host | Decidir tras verificar licencia real | Fase 4 |

---

## Financiamiento

Proyección realista a 3 años. Detalle en `MARKET_RESEARCH.md` §3A.

| Año | Fuente | Monto estimado | Uso |
|---|---|---|---|
| 2026 (resto) | Open Collective + donaciones | ~$500-2000 USD | Infra Supabase/Vercel/Mapbox |
| 2026 Q4 | NLnet grant application | €15-30K | Infra + CAP integration + outreach |
| 2027 | Convenio municipio Epuyén/El Bolsón | $500-1000 USD/mes | Infra dedicada regional |
| 2027 Q2 | Sovereign Tech Fund application | €50K-200K | Mantenimiento + 2º maintainer full-time |
| 2028 | DPGA recognition + Sloan/MOSS | $50-150K | Expansión a otros países LATAM |

---

## Métricas de éxito (bajo frame OSS)

Lo que importa medir. Lo que **no** importa: MAU, session duration, engagement, ARR.

| Métrica | Target 6m | Target 12m |
|---|---|---|
| Brigadas activas usando Igni | 1 | 3-5 |
| Instancias auto-hospedadas por terceros | 0 | 1 |
| % focos verificados antes de 1h | baseline | >50% |
| Contribuidores externos al código | 0 | 3+ |
| Financiamiento anual (grants + donaciones) | $1K | $20K+ |
| Menciones en prensa técnica o civic-tech | 0 | 2-3 |
| Registro en DPGA | No | Sí |
| Tiempo para reproducir instancia (según DEPLOYMENT.md) | — | <2h |

---

## Notas técnicas (referencia rápida)

- **Mapbox GL JS** soporta todas las capas listadas nativamente
- **Turf.js** para cálculos geoespaciales client-side
- **PostGIS** ya habilitado en Supabase
- **Mapbox APIs** usados: Isochrone, Directions, Geocoding (tokens adicionales)
- **Weather**: OpenWeather / Windy / Tomorrow.io con free tier
- **FIRMS API**: gratuita, key requerida en `NASA_FIRMS_KEY`
- **CAP**: `oasis-open.org/committees/emergency` — spec v1.2

---

## Próxima acción concreta (esta semana)

1. Crear Linear project "Igni" (si no existe) + issues para cada entregable de Fase 1
2. Escribir `LICENSE` (AGPL-3.0) + commit al repo
3. Iniciar Open Collective con slug `igni` o `igni-fire`
4. Redactar primer email de contacto a brigada voluntarios Epuyén

Todo lo demás se deriva de esto.
