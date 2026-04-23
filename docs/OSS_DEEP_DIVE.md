# Igni — OSS Deep Dive: 7 Proyectos Wildfire

> Documento: Oraculo (Deep Dive) | 2026-04-22
> Propósito: análisis individual de los 7 proyectos OSS wildfire identificados en MARKET_RESEARCH.md §2B. Para cada proyecto: qué es, cómo está técnicamente, cómo se integra con Igni, qué riesgos tiene. El objetivo no es reemplazar ninguno sino identificar cuáles conviene consumir como dependencia, federar o estudiar como referencia.

---

## Tabla resumen (skim rápido)

| Proyecto | Categoría integración | Esfuerzo | Riesgo | Prioridad |
|----------|----------------------|----------|--------|-----------|
| **FireAlert** (Plant-for-the-Planet) | Consumir / fork parcial | Bajo | Bajo | **#1 — MVP** |
| **TAK-NZ/etl-firms** | Consumir directamente | Trivial | Medio | **#2 — MVP** |
| **PyroNear** | Federación futura / referencia ahora | Medio | Bajo | **#3 — post-MVP** |
| **OpenEWS** | Federación / integración de alertas | Medio | Bajo | **#4 — post-MVP** |
| **Wildfire Commons** | Membership / datasets | Bajo | Bajo | **#5 — estratégico** |
| **bcgov/wps** | Referencia arquitectural | Alto | Bajo | **#6 — largo plazo** |
| **ODIN-fire** | Referencia de diseño | Alto | Medio | **#7 — opcional** |

---

## 1. PyroNear

**Repo:** [github.com/pyronear](https://github.com/pyronear) — múltiples repos: `pyro-api`, `pyro-engine`, `pyro-platform`

### Overview

Qué hace: sistema end-to-end de detección temprana de incendios. Cámaras fijas en puntos altos capturan imágenes cada N segundos. Un modelo ML local (edge) analiza humo/llamas. Si hay detección, envía imágenes + alerta a `pyro-api` (REST API centralizada). La API conecta con una plataforma de supervisión para bomberos.

- **Inputs:** imágenes de cámaras, coordenadas GPS de dispositivos
- **Outputs:** alertas con imagen, timestamp, coordenadas; dashboard de supervisión
- **Componentes:** `pyro-engine` (ML en edge), `pyro-api` (FastAPI + PostgreSQL), `pyro-platform` (frontend Dash)
- **Stack:** Python 3, FastAPI, PostgreSQL, Docker, MinIO (S3-compatible), Torch/Ultralytics (YOLO-family para detección)
- **Licencia:** Apache 2.0 — [verificado en repo pyro-api](https://github.com/pyronear/pyro-api)
- **Estado 2026:** activo. Última actividad mencionada: abril 2026. `pyro-envdev` tenía 160 commits (abr 2024), `pyro-platform` 210 commits (dic 2023). Sin métricas exactas de frecuencia 2026 disponibles públicamente, pero el proyecto sigue siendo referenciado activamente.

### Gobernanza y sostenibilidad

- **Quién mantiene:** NGO francesa Pyronear. No gubernamental. Equipo distribuido, bienvenidos contribuidores voluntarios.
- **Funding:** grants europeos, fundaciones ambientales. No VC. No revenue.
- **Bus factor:** medio-bajo. No es un solo desarrollador, pero la NGO es pequeña. Documentación activa sugiere esfuerzo de reducir bus factor.
- **Governance:** no hay GOVERNANCE.md documentado públicamente. Organización en GitHub con múltiples repos y contributors indica estructura mínima.
- **Comunidad:** GitHub issues, posiblemente Discord (no confirmado públicamente).

### APIs, datos y protocolos

- **API pública:** `pyro-api` expone REST API. Endpoints para dispositivos, alertas, usuarios. Documentación generada con FastAPI (OpenAPI automático).
- **Formatos:** JSON nativo, imágenes JPEG/PNG como evidencia
- **Datasets:** tienen `pyro-risks` (repo de datasets de riesgo de incendio) — datos abiertos
- **Estándares:** FIRMS no está integrado directamente (son cámaras, no satelital). Sin CAP documentado.

### Fit con Igni

- **Categoría:** federación futura. Hoy: referencia y estudio de arquitectura edge.
- **Caso de uso concreto:** Igni podría integrar pyro-api como fuente adicional de detección si brigadas en Patagonia instalan cámaras PyroNear. El workflow: cámara PyroNear detecta → `pyro-api` → webhook → Igni crea `fire_report` con source=`pyronear`.
- **Costo de integración:** medio. Requiere un adaptador que consuma la API de PyroNear y traduzca alertas al schema de Igni (`fire_reports`). No es trivial porque sus modelos de datos son distintos.
- **Overlap funcional:** PyroNear hace detección (cámaras + ML). Igni hace reporte ciudadano + coordinación de recursos. Son complementarios, no solapados.
- **Blockers técnicos:** ninguno de licencia (Apache 2.0 compatible con todo). Stack incompatible con Igni (Python vs Next.js) pero solo importa para la integración de API, no para el core.

### Contacto y entrada

- **Cómo contactar:** GitHub issues en cualquier repo del org `pyronear`. Email de la NGO en pyronear.org.
- **Primer contacto sugerido:** abrir un issue en `pyro-api` con título "Integration with community-based fire reporting systems in Latin America — interest in webhook/API federation". Explicar qué es Igni, que es OSS Apache 2.0 compatible, y preguntar si tienen webhook para nuevas alertas.
- **Qué ofrecer:** caso de uso Patagonia (zona con alta actividad de incendios y baja cobertura de cámaras profesionales), testing en condiciones climáticas distintas a Francia, traducción de docs al español.

### Riesgos

- **Dependencia:** Apache 2.0 es estable. Riesgo de que la NGO pierda funding y el proyecto decaiga.
- **Señales de alerta:** ninguna clara. El proyecto sigue activo en 2026 según múltiples referencias. La ausencia de GOVERNANCE.md formal es el único riesgo estructural visible.
- **Dirección técnica:** orientados a cámaras físicas + edge ML, no a datos satelitales. Si Igni evoluciona hacia cámaras, hay sinergia. Si Igni se queda solo en FIRMS, la integración es menor.

---

## 2. ODIN-fire

**Repo:** [github.com/NASAWorldWind/ODIN-fire](https://github.com/NASAWorldWind/ODIN-fire) / organización alternativa `ODIN-fire` en GitHub
**Web:** [odin-fire.org](https://odin-fire.org)
**Contacto:** info@odin-fire.org

### Overview

Qué hace: framework de integración multi-fuente para situational awareness en incendios forestales. No es una app de usuario final: es un toolkit para construir aplicaciones web especializadas (por stakeholder o escenario). Combina datos meteorológicos, sensores terrestres/aéreos/satelitales, modelos de simulación de propagación, y los despliega en un globo 3D (CesiumJS).

- **Inputs:** datos GIS multi-fuente (weather feeds, sensores, FIRMS, simulaciones de propagación)
- **Outputs:** visualización en globo 3D CesiumJS, datos integrados exportables
- **Componentes:** servidor ODIN (Rust), cliente web (JavaScript + CesiumJS), conectores por tipo de fuente
- **Stack:** Rust (backend/servidor de datos), JavaScript + CesiumJS (frontend 3D), OpenLayers para mapas 2D
- **Licencia:** Apache 2.0 — [verificado vía fuentes NASA](https://github.com/NASAWorldWind/ODIN-fire)
- **Estado 2026:** activo pero más lento. Última referencia pública confirmada: julio 2024. Se menciona en presentación de Cesium DevCon 2025. Desarrollo de demostración para huracanes planificado 2025-2027. Bus factor observable: Peter C. Mehlitz (NASA Ames) aparece como figura central en todas las publicaciones.

### Gobernanza y sostenibilidad

- **Quién mantiene:** grupo de empleados y ex-empleados de NASA Ames Research Center. Figuras: Peter C. Mehlitz, Sequoia R. Andrade, Dr. Guillaume P. Brat.
- **Funding:** NASA (indirecto). Proyecto académico/investigación. Sin revenue.
- **Bus factor:** alto. Parece fuertemente dependiente de Mehlitz y un grupo pequeño de NASA Ames. La organización GitHub no lista miembros públicamente.
- **Governance:** no documentada. Es un proyecto de investigación NASA, no un proyecto comunitario con gobernanza abierta.
- **Comunidad:** email (info@odin-fire.org), GitHub issues. Sin Discord ni foro activo detectado.

### APIs, datos y protocolos

- **APIs:** el servidor ODIN expone endpoints para servir datos integrados, pero no está documentado como API pública para terceros. Diseñado para ser consumido por sus propios clientes web.
- **Formatos:** GeoJSON, formatos GIS estándar. CesiumJS CZML para visualización 3D.
- **Datasets:** no genera datasets propios; consume fuentes existentes (FIRMS, NWS weather, etc.)
- **Estándares:** orientado a GIS (OGC, GeoJSON). CAP no mencionado.

### Fit con Igni

- **Categoría:** referencia de diseño arquitectural. No integración directa.
- **Caso de uso concreto:** la arquitectura de ODIN-fire (servidor Rust + conectores por fuente + visualización) es el blueprint más sofisticado disponible para "integrar N fuentes heterogéneas de wildfire". Igni puede estudiar su diseño de conectores cuando necesite ir más allá de FIRMS.
- **Costo de integración:** alto. Rust es incompatible con el stack de Igni (Next.js). Integrar ODIN-fire como dependencia requeriría ejecutar un servidor Rust separado y consumir sus APIs. Sobrecarga operacional significativa para el tamaño actual de Igni.
- **Overlap funcional:** ODIN-fire hace integración de datos y visualización 3D profesional. Igni hace mapa 2D + reportes ciudadanos. Igni no necesita visualización 3D en el MVP.
- **Blockers técnicos:** stack Rust incompatible, proyecto con alto bus factor, orientado a usuarios profesionales (primeros respondedores, agencias), no a ciudadanos. Licencia OK.

### Contacto y entrada

- **Cómo contactar:** info@odin-fire.org o GitHub issues.
- **Primer contacto sugerido:** email a info@odin-fire.org presentando Igni como proyecto ciudadano OSS en Patagonia, preguntando si tienen conectores de datos que Igni podría consumir via API o si hay documentación de los formatos que exportan.
- **Qué ofrecer:** caso de uso Patagonia como validación de su framework en contexto Sudamérica + volcanes + vientos patagónicos (zona de alta complejidad meteorológica).

### Riesgos

- **Dependencia:** alta. Bus factor de NASA + proyecto de investigación sin gobernanza comunitaria. Puede descontinuarse si los investigadores clave se van.
- **Señales de alerta:** el repo fue originalmente bajo `NASAWorldWind` (org que ya no es el org principal). Frecuencia de commits decreciente. No recomendado como dependencia técnica.

---

## 3. bcgov/wps

**Repo:** [github.com/bcgov/wps](https://github.com/bcgov/wps)
**Operado por:** BC Wildfire Service (BCWS), gobierno de British Columbia, Canadá

### Overview

Qué hace: sistema de predicción y soporte de decisiones para el servicio de bomberos de BC. Operacional en producción. Incluye modelos de predicción de comportamiento de fuego, datos meteorológicos de estaciones BCWS, índices de peligro (FWI — Fire Weather Index), y un dashboard para la Unidad de Servicios Predictivos.

- **Inputs:** datos meteorológicos de estaciones BCWS, datos de satélite, FWI
- **Outputs:** predicciones de comportamiento de fuego, índices de riesgo, dashboard operacional
- **Componentes:** API Python (backend), frontend React/TypeScript, base de datos PostgreSQL + PostGIS
- **Stack:** Python 56%, TypeScript 40%, Shell, Java (tests), PostgreSQL + PostGIS, Docker. Frontend React, API expuesta en `localhost:8080`.
- **Licencia:** Apache 2.0 — [verificado en repo](https://github.com/bcgov/wps)
- **Estado 2026:** muy activo. GitHub issue de sprint report fechado julio 2025. BC Wildfire Service invirtiendo activamente en 2025-2026 en mejoras de cámaras y predicción. Proyecto con presupuesto gubernamental real.

### Gobernanza y sostenibilidad

- **Quién mantiene:** BC Wildfire Service + Predictive Services Unit (PSU). Colaboradores de Thompson Rivers University (co-ops), BCWS staff, estudiantes académicos.
- **Funding:** presupuesto del gobierno de British Columbia. No es un proyecto de voluntarios — es software operacional gubernamental.
- **Bus factor:** bajo. Equipo distribuido, financiamiento estructural. El gobierno de BC no cierra el proyecto porque un developer se vaya.
- **Governance:** gubernamental. No hay GOVERNANCE.md de comunidad OSS, pero hay estructura institucional fuerte. Contribuciones externas bienvenidas bajo Apache 2.0.
- **Comunidad:** GitHub issues. No hay Discord. Contacto via repositorio o BCWS directamente.

### APIs, datos y protocolos

- **API pública:** la API Python corre en `localhost:8080` (documentación interna). No hay evidencia de API pública externa documentada para terceros. Es un sistema interno que fue abierto como OSS, no diseñado como plataforma para terceros.
- **Formatos:** GeoJSON, CSV para datos meteorológicos. PostGIS para geoespacial.
- **Datasets:** `bcgov/wps-research` tiene datasets de investigación asociados. Datos meteorológicos de estaciones BCWS pueden estar disponibles.
- **Estándares:** OGC (PostGIS), formatos meteorológicos estándar. CAP no mencionado.

### Fit con Igni

- **Categoría:** referencia arquitectural + fuente de datos a futuro.
- **Caso de uso concreto:** la arquitectura de bcgov/wps es el blueprint de cómo un gobierno construye un sistema wildfire OSS operacional. Igni puede aprender de su estructura (Python API + React frontend + PostGIS). A futuro, si Igni establece relación con un organismo gubernamental argentino, bcgov/wps es la prueba de concepto de que "el gobierno puede operar un sistema OSS wildfire".
- **Costo de integración:** alto como dependencia técnica. Está diseñado para BC, con modelos de comportamiento de fuego calibrados para esa región, datos de estaciones BCWS, y FWI adaptado. Reutilizar el código requiere adaptación significativa.
- **Overlap funcional:** bcgov/wps hace predicción de comportamiento y meteorología. Igni hace reporte ciudadano y coordinación. Son distintos, pero eventualmente Igni podría querer integrar FWI (índice de peligro) como capa de contexto.
- **Blockers técnicos:** no diseñado para consumo externo como API. Datos son de BC, no de Patagonia. Para obtener valor hay que o (a) deployar una instancia propia adaptada, o (b) estudiar el código sin ejecutarlo.

### Contacto y entrada

- **Cómo contactar:** GitHub issues en `bcgov/wps`. BCWS Predictive Services Unit via gobierno BC.
- **Primer contacto sugerido:** abrir issue "Interest in replicating WPS model for Patagonia, Argentina — questions about data dependencies and portability". Preguntar qué fuentes de datos son específicas de BC y cuáles son reemplazables con datos locales.
- **Qué ofrecer:** feedback como implementador en otra región, potencial caso de estudio de "WPS architecture replication in LATAM".

### Riesgos

- **Dependencia:** bajo riesgo de que el proyecto muera (gobierno lo usa en producción). Riesgo de que el código evolucione hacia necesidades específicas de BC y se aleje de ser genérico.
- **Señales de alerta:** ninguna. Es el proyecto más saludable de los 7 en términos de sostenibilidad institucional.

---

## 4. FireAlert

**Repo:** [github.com/Plant-for-the-Planet-org/FireAlert](https://github.com/Plant-for-the-Planet-org/FireAlert)
**Org:** [plant-for-the-planet.org](https://www.plant-for-the-planet.org)

### Overview

Qué hace: sistema de alertas de incendio basado en datos FIRMS (NASA). Procesa "GeoEvents" (anomalías de calor detectadas por MODIS/VIIRS), los cruza con áreas geográficas registradas por usuarios, y envía notificaciones multi-canal.

- **Inputs:** datos FIRMS/NASA (MODIS, VIIRS), zonas geográficas definidas por usuarios (polígonos)
- **Outputs:** alertas via SMS, email, WhatsApp, webhooks, push notifications móviles
- **Componentes:** web app (Next.js), mobile app (React Native), backend API, workers de procesamiento FIRMS
- **Stack:** Next.js (web), React Native (móvil), Yarn workspaces (monorepo), Prisma (ORM), PostgreSQL. Lanzado junio 2023.
- **Licencia:** no confirmada explícitamente en los resultados de búsqueda. El repo es público en GitHub. **Pendiente de verificar en el repo directamente.** (Inferido como OSS dado que está en organización pública)
- **Estado 2026:** activo. Plant-for-the-Planet tiene presencia en COP 30 (nov 2025). La app está en Google Play Store y App Store. Sin datos de commits recientes verificados directamente.

### Gobernanza y sostenibilidad

- **Quién mantiene:** Plant-for-the-Planet, movimiento global de restauración de bosques (fundado por Félix Finkbeiner, Alemania/México). Organización establecida, no un hobby project.
- **Funding:** donaciones, corporate partnerships, y financiamiento de proyectos de reforestación. Sustentable institucionalmente.
- **Bus factor:** bajo. Organización con equipo técnico dedicado.
- **Governance:** organización established con estructura legal en múltiples países. Sin GOVERNANCE.md de comunidad OSS detectado.
- **Comunidad:** GitHub, plataforma propia (plant-for-the-planet.org). SSO integrado.

### APIs, datos y protocolos

- **API pública:** soporta webhooks (mencionado explícitamente como canal de notificación). Esto es clave: Igni puede recibir un webhook de FireAlert cuando hay un GeoEvent en Patagonia.
- **Formatos:** GeoJSON para zonas geográficas. JSON para alertas. Webhooks HTTP.
- **Datasets:** consume FIRMS directamente (NASA). No genera datasets propios de incendios.
- **Estándares:** FIRMS. Sin mención de CAP.

### Fit con Igni

- **Categoría:** consumir directamente o fork parcial. Es el proyecto con más overlap funcional directo con lo que Igni quiere construir en la capa de alertas.
- **Caso de uso concreto:** Igni puede registrar las zonas de interés de Patagonia en FireAlert y recibir webhooks cuando FIRMS detecte calor anómalo. Estos webhooks crean automáticamente `fire_reports` en Igni con `source='firms_firealert'` y `status='pending'` (esperando verificación ciudadana). Costo de integración: escribir un webhook handler en la API de Igni. Trivial.
- **Alternativamente:** fork del componente de procesamiento FIRMS de FireAlert para tener control local del pipeline (si Igni quiere procesar FIRMS directamente sin depender de FireAlert como servicio externo).
- **Costo de integración:** trivial para webhook consumer. Bajo-medio para fork del pipeline FIRMS.
- **Overlap funcional:** FireAlert hace alertas basadas en FIRMS + notificaciones. Igni hace eso más reportes ciudadanos + recursos + dashboard operacional. FireAlert es un subconjunto de Igni.
- **Blockers técnicos:** ninguno. Stack compatible (Next.js, React). Licencia pendiente de verificar pero organización pública y orientada a bien común. Si la licencia es permisiva (MIT/Apache), el fork es directo.

### Contacto y entrada

- **Cómo contactar:** GitHub issues en `Plant-for-the-Planet-org/FireAlert`. Email de la organización en plant-for-the-planet.org.
- **Primer contacto sugerido:** abrir issue "FireAlert integration for community wildfire monitoring in Patagonia, Argentina — interest in webhook API and potential collaboration". Mencionar que Igni es OSS orientado a brigadas y comunidades sin cobertura profesional (alineado con la misión de Plant-for-the-Planet de proteger bosques).
- **Qué ofrecer:** caso de uso Patagonia (bosques de lenga, ñire, ciprés — ecosistemas de alto valor en zonas con poca infraestructura), feedback de uso en contexto hispanohablante, posible traducción de la app/docs.

### Riesgos

- **Dependencia:** si FireAlert como servicio externo desaparece, el webhook deja de funcionar. Mitigación: tener el pipeline FIRMS propio (via etl-firms, ver #7).
- **Señales de alerta:** licencia no verificada. Verificar antes de fork.

---

## 5. OpenEWS

**Repo:** [github.com/open-ews/open-ews](https://github.com/open-ews/open-ews)
**Web:** [open-ews.org](https://open-ews.org)
**Mantenido por:** Chatterbox Solutions (creadores de Somleng)

### Overview

Qué hace: plataforma open-source de diseminación de alertas de emergencia. Permite a gobiernos, ONGs y comunidades enviar alertas críticas a poblaciones vulnerables antes de desastres. Es un sistema de distribución, no de detección.

- **Inputs:** alertas generadas por operadores humanos o sistemas externos (via API)
- **Outputs:** notificaciones masivas via llamadas de voz (Somleng/Twilio), SMS, otros canales
- **Componentes:** plataforma web de administración, API REST, integración con Somleng (telefonía OSS)
- **Stack:** no confirmado en detalle. Chatterbox Solutions usa Ruby on Rails en Somleng. OpenEWS probablemente similar.
- **Licencia:** MIT — [verificado vía Digital Public Goods Alliance](https://digitalpublicgoods.net)
- **Estado 2026:** activo. Certificado como Digital Public Good (DPG) el 22 junio 2025 (expira junio 2026). En uso por agencias nacionales en 4 países a marzo 2026. Copyright 2025 Somleng.

### Gobernanza y sostenibilidad

- **Quién mantiene:** Chatterbox Solutions — empresa con producto comercial (Somleng). OpenEWS es el componente OSS de su stack.
- **Funding:** ingresos de Somleng (modelo comercial), UNICEF Venture Fund (mencionado en fuentes), grants de agencias internacionales.
- **Bus factor:** medio. Depende de Chatterbox Solutions como empresa. Si la empresa pivota, el proyecto puede decaer. Pero hay estructura comercial que da más estabilidad que un proyecto de voluntarios.
- **Governance:** no hay steering committee público documentado. Gobernanza efectiva via Chatterbox.
- **Comunidad:** GitHub, site open-ews.org. Sin Discord detectado.

### APIs, datos y protocolos

- **API pública:** API REST documentada (diseño API-first mencionado explícitamente). Permite enviar alertas desde sistemas externos. Esta es la integración clave para Igni.
- **Formatos:** JSON. CAP mencionado como compatible via integración (API-first permite conectar con sistemas CAP externos como FEMA IPAWS).
- **Datasets:** no genera datasets. Es un sistema de distribución.
- **Estándares:** orientado a Early Warning Systems estándares de ONU. Interoperable con CAP via API.

### Fit con Igni

- **Categoría:** federación / integración de alertas. OpenEWS hace lo que Igni no quiere construir: la diseminación masiva de alertas via voz y SMS a escala gubernamental.
- **Caso de uso concreto:** cuando Igni verifica un incendio activo (status `verified` o `active` en `fire_reports`), puede llamar la API de OpenEWS para disparar una alerta masiva a las comunidades registradas en el área (llamadas de voz automáticas, SMS). Esto es especialmente valioso para llegar a adultos mayores o personas sin smartphone en zonas rurales de Patagonia.
- **Costo de integración:** medio. Requiere deployar una instancia de OpenEWS (o usar el servicio hosteado si existe), configurar zonas de cobertura en Patagonia, y escribir el conector desde Igni. No es trivial pero está bien documentado.
- **Overlap funcional:** Igni hace notificaciones push/email en la app. OpenEWS hace el canal de voz y SMS masivo. Son complementarios.
- **Blockers técnicos:** ninguno técnico. El blocker práctico es que para usar llamadas de voz en Argentina se necesita un proveedor de telefonía local (SIP/VoIP). Somleng tiene integraciones pero hay que configurarlas para Argentina.

### Contacto y entrada

- **Cómo contactar:** GitHub issues en `open-ews/open-ews`. Site open-ews.org tiene formulario de contacto.
- **Primer contacto sugerido:** issue o email "Interest in deploying OpenEWS for wildfire early warning in Patagonia, Argentina — community-based OSS project". Preguntar si tienen soporte para operadores de telefonía argentinos y si hay casos de uso de wildfire documentados.
- **Qué ofrecer:** caso de uso wildfire + caso de uso rural/remoto (Patagonia tiene muchas comunidades con poca conectividad pero con telefonía básica). Sería el primer caso de uso de OpenEWS en Sudamérica hispanohablante.

### Riesgos

- **Dependencia:** OpenEWS depende de Chatterbox/Somleng como empresa. MIT License protege el código, pero el expertise y el momentum están concentrados.
- **Señales de alerta:** la certificación DPG expira junio 2026 — hay que observar si se renueva. Si no se renueva puede indicar cambio de prioridades.
- **Nota:** existe un segundo proyecto llamado "Open EWS" (open-ews.com, distinto) que sí menciona explícitamente wildfire modeling y alertas de evacuación. Investigar si es el mismo o diferente proyecto. **Esta ambigüedad es un riesgo de información.**

---

## 6. Wildfire Commons

**Web:** [wildfirecommons.org](https://wildfirecommons.org)
**Institución:** UC San Diego (UCSD) + Los Alamos National Laboratory — iniciativa ProWESS

### Overview

Qué hace: no es un proyecto de software sino una plataforma comunitaria de datos y modelos. Ofrece: FireForge Catalog (repositorio de datasets + modelos AI + código OSS para wildfire), FireForge Workspaces (entornos cloud colaborativos para ML), Expert Network (comunidad de practitioners), y Community Marketplace (compartir datos y herramientas).

- **Inputs:** contribuciones de la comunidad (datasets, modelos, código)
- **Outputs:** catálogo searchable, workspaces cloud, networking
- **Stack:** plataforma web propia. Sin repo OSS público identificado (es más un portal que un software).
- **Licencia:** N/A como proyecto de software. Los recursos en el catálogo tienen sus propias licencias.
- **Estado 2026:** muy activo. Launch online: julio 31, 2025. California Wildfire Commons (nodo California) activó data hub en marzo 2026. Wildfire Resilience Index: lanzamiento 2026. Eventos regulares en 2026.

### Gobernanza y sostenibilidad

- **Quién mantiene:** UC San Diego (Societal Computing and Innovation Lab — SCIL) + Los Alamos National Laboratory.
- **Funding:** NIST (National Institute of Standards and Technology, USA). Apropiaciones del Congreso USA (Senador Alex Padilla, Representantes Vargas y Jacobs). Funding institucional fuerte.
- **Bus factor:** bajo. Dos instituciones académicas/nacionales con financiamiento gubernamental.
- **Governance:** académica/institucional. No hay gobernanza comunitaria OSS.
- **Comunidad:** eventos webinar regulares, expert network. No es GitHub-centric.

### APIs, datos y protocolos

- **API pública:** no detectada. Es un catálogo web, no una API de datos.
- **Formatos:** depende de cada dataset en el catálogo.
- **Datasets:** FireForge Catalog es la fuente clave. Contiene datasets open-source de wildfire de múltiples agencias.
- **Estándares:** promueve interoperabilidad y metadatos estandarizados.

### Fit con Igni

- **Categoría:** membership / acceso a datasets estratégico.
- **Caso de uso concreto:** Igni puede registrarse como proyecto miembro de Wildfire Commons para: (1) acceder al FireForge Catalog y encontrar datasets de Argentina/Patagonia, (2) aparecer en el Expert Network como proyecto OSS latinoamericano, (3) participar en workspaces de ML para validar o mejorar modelos de predicción.
- **Costo de integración:** bajo. No es integración técnica sino membresía institucional.
- **Overlap funcional:** ninguno. Wildfire Commons es un hub de conocimiento, no un sistema operacional.
- **Blockers técnicos:** ninguno técnico. Blocker práctico: es USA-centric (NIST, Congreso USA). Igni necesita demostrar relevancia para ser incluido.

### Contacto y entrada

- **Cómo contactar:** wildfirecommons.org tiene formulario. Eventos públicos de 2026 donde participar (webinars).
- **Primer contacto sugerido:** participar en el webinar "Reboot the Earth Hackathon - Data Workshop" (29 abril 2026) y presentar Igni como caso de uso LATAM. Luego contactar para registrar Igni en el Expert Network y en el FireForge Catalog.
- **Qué ofrecer:** datos de incendios de Patagonia (escasos en el catálogo actual que es USA-centric), caso de uso de sistema ciudadano OSS en contexto de baja infraestructura institucional.

### Riesgos

- **Dependencia:** ninguno técnico. Es un directorio, no una dependencia de código.
- **Señales de alerta:** es muy reciente (lanzado julio 2025). No está probado como comunidad sostenida. Puede quedar como un portal sin tracción comunitaria real.

---

## 7. TAK-NZ/etl-firms

**Repo:** [github.com/TAK-NZ/etl-firms](https://github.com/TAK-NZ/etl-firms)
**Org:** Team Awareness Kit New Zealand (TAK.NZ)

### Overview

Qué hace: pipeline ETL que consume datos NASA FIRMS (Fire Information for Resource Management System), los transforma, y los emite en formatos usables por sistemas de situational awareness (principalmente TAK — Team Awareness Kit, estándar militar/emergencias para mapas en tiempo real).

- **Inputs:** feeds NASA FIRMS (MODIS, VIIRS, LANDSAT) via API NASA
- **Outputs:** datos FIRMS transformados, probablemente en formato compatible con TAK (CoT — Cursor on Target XML, o similar)
- **Componentes:** scripts Python ETL
- **Stack:** Python. Sin más detalle técnico confirmado públicamente.
- **Licencia:** no confirmada explícitamente en los resultados de búsqueda. **Pendiente verificar en el repo.** TAK-NZ es una organización orientada a primera respuesta — licencias permisivas son esperables pero no confirmadas.
- **Estado 2026:** el proyecto existe y es mencionado como activo. Sin datos de commits recientes verificados. Información limitada públicamente.

### Gobernanza y sostenibilidad

- **Quién mantiene:** TAK-NZ — iniciativa neozelandesa para adaptar herramientas TAK (originalmente militares USA) a servicios de emergencia civiles de Nueva Zelanda.
- **Funding:** no documentado. Probablemente voluntarios + algún apoyo institucional de emergencias NZ.
- **Bus factor:** alto aparente. Organización pequeña, proyecto con poca visibilidad pública.
- **Governance:** no documentada.
- **Comunidad:** GitHub. Sin canal público detectado.

### APIs, datos y protocolos

- **API pública:** no es una API — es un pipeline CLI/scheduled. Se ejecuta y produce output, no expone endpoints.
- **Formatos:** consume FIRMS API (NASA). Output probablemente CoT (Cursor on Target) para TAK, o GeoJSON.
- **Datasets:** transforma FIRMS, no genera datos propios.
- **Estándares:** TAK/CoT (estándar de primera respuesta USA/OTAN). FIRMS.

### Fit con Igni

- **Categoría:** consumir como componente o estudiar como referencia para el pipeline FIRMS propio de Igni.
- **Caso de uso concreto:** Igni necesita consumir FIRMS. `etl-firms` ya resolvió ese problema. Igni puede: (1) usar el código como base para su propio pipeline FIRMS, adaptando el output a `fire_reports` de Supabase en lugar de CoT/TAK, o (2) ejecutar `etl-firms` como proceso separado y consumir su output.
- **Costo de integración:** bajo para fork/referencia. Medio si se quiere ejecutar como servicio separado (hay que deployar un proceso Python adicional).
- **Overlap funcional:** solo en la capa de ingesta FIRMS. Igni necesita exactamente eso.
- **Blockers técnicos:** licencia no verificada (verificar antes de fork). Stack Python compatible con un microservicio separado. El output CoT es irrelevante para Igni — habría que adaptar el sink del pipeline.

### Contacto y entrada

- **Cómo contactar:** GitHub issues en `TAK-NZ/etl-firms`.
- **Primer contacto sugerido:** issue simple "Considering using etl-firms as basis for FIRMS ingestion in an OSS wildfire reporting system in Argentina — question about license and output format flexibility".
- **Qué ofrecer:** feedback de uso, mejoras al pipeline si se hacen cambios útiles para terceros.

### Riesgos

- **Dependencia:** proyecto con baja visibilidad y posible alto bus factor. Si el maintainer abandona, el código queda como está (que puede ser suficiente si el pipeline FIRMS de NASA no cambia drásticamente).
- **Señales de alerta:** información muy limitada. No hay datos de frecuencia de commits ni de issues abiertos/cerrados. Proceder con cautela — verificar el repo directamente antes de decidir.

---

## Conclusión: Top 3 a integrar primero

### #1 — TAK-NZ/etl-firms (semana 1–2)

**Justificación:** Igni ya usa FIRMS como fuente de datos. El pipeline ETL resuelve el problema de ingesta estructurada. Costo de integración trivial (fork + adaptar el sink a Supabase). No tiene dependencias externas complejas. **Acción inmediata:** verificar licencia en el repo, leer el código, y decidir si es fork o reimplementación basada en el mismo patrón. Si la licencia es permisiva, fork directo. Si no, reimplementar el mismo approach (es un pipeline FIRMS — no es complejo).

**Qué desbloquea:** ingesta automática de focos FIRMS sin depender de FireAlert como intermediario. Igni tiene su propio pipeline de datos satelitales.

### #2 — FireAlert (semana 2–4)

**Justificación:** stack idéntico (Next.js + PostgreSQL), webhook nativo, misma fuente de datos (FIRMS). Verificar licencia y configurar un webhook handler en Igni para recibir GeoEvents de zonas registradas en Patagonia. Si la licencia permite fork, tomar el componente de procesamiento FIRMS y el sistema de notificaciones multi-canal. **Es el proyecto con mayor overlap funcional directo con Igni.**

**Qué desbloquea:** notificaciones SMS/WhatsApp/email sin construir ese stack desde cero. Validación de que el modelo "recibir alerta FIRMS → notificar comunidad" ya funciona a escala.

### #3 — OpenEWS (mes 2–3, post-MVP)

**Justificación:** MIT License, Digital Public Good certificado, API-first, en uso operacional en 4 países. Agrega el canal de diseminación masiva (voz + SMS) que Igni no puede construir rápidamente. El blocker es la configuración de telefonía argentina — pero es un blocker operacional, no técnico.

**Qué desbloquea:** alcanzar poblaciones rurales de Patagonia sin smartphone. Transforma Igni de "app comunitaria" a "sistema de alerta con capacidad gubernamental". Es el paso de madurez que abre conversaciones con Defensa Civil y municipios.

---

**Acciones paralelas sin dependencia:**
- Registrar Igni en **Wildfire Commons** Expert Network (bajo esfuerzo, alto retorno en visibilidad)
- Contactar **PyroNear** via GitHub issue (siembra relación para futuro si brigadas adoptan cámaras)
- Estudiar arquitectura de **bcgov/wps** para diseñar la API de Igni de forma compatible con estándares gubernamentales

---

## Fuentes por proyecto

### PyroNear
- [github.com/pyronear](https://github.com/pyronear) — org principal
- [pyronear.org](https://pyronear.org) — site de la NGO
- [earthtoolsmaker.org — PyroNear tutorial](https://earthtoolsmaker.org) — referencia técnica

### ODIN-fire
- [odin-fire.org](https://odin-fire.org)
- [NASA Ames Research Center — ODIN publications](https://www.nasa.gov)
- [Cesium DevCon 2025 — ODIN-fire presentation](https://cesium.com)
- [ORNL — ODIN-fire reference](https://ornl.gov)

### bcgov/wps
- [github.com/bcgov/wps](https://github.com/bcgov/wps)
- [github.com/bcgov/wps-research](https://github.com/bcgov/wps-research)
- [BC Wildfire Service — 2026 preparedness](https://www2.gov.bc.ca)
- [MDPI paper — ML wildfire prediction BC (nov 2025)](https://mdpi.com)

### FireAlert
- [github.com/Plant-for-the-Planet-org/FireAlert](https://github.com/Plant-for-the-Planet-org/FireAlert)
- [plant-for-the-planet.org/firealert](https://www.plant-for-the-planet.org)
- [App Store listing](https://apps.apple.com)

### OpenEWS
- [open-ews.org](https://open-ews.org)
- [github.com/open-ews/open-ews](https://github.com/open-ews/open-ews)
- [Digital Public Goods Alliance — OpenEWS certification](https://digitalpublicgoods.net)
- [UNICEF Venture Fund — Somleng/Chatterbox](https://unicefventurefund.org)
- [Alert Hub — CAP ecosystem](https://alert-hub.org)

### Wildfire Commons
- [wildfirecommons.org](https://wildfirecommons.org)
- [UC San Diego — ProWESS center](https://ucsd.edu)
- [Statescoop — California Wildfire Commons](https://statescoop.com)

### TAK-NZ/etl-firms
- [github.com/TAK-NZ/etl-firms](https://github.com/TAK-NZ/etl-firms)

---

*Nota de confianza:* datos de estado de repos (commits, contributors) son estimaciones basadas en búsquedas web (Gemini/Google grounding). Para cifras exactas verificar directamente en GitHub cada repo (Insights → Contributors, Pulse). Las licencias marcadas como "verificado" provienen de referencias directas en los resultados de búsqueda; las marcadas como "pendiente" deben confirmarse antes de cualquier decisión de fork.
