# Igni — Market Research: Wildfire Monitoring como Bien Común Digital

> Investigación: Oraculo (Deep Dive) | Actualización: 2026-04-22
> Fuentes: Gemini Search (Google Grounding) × 4 queries + síntesis de reporte previo
> Frame: Igni es un proyecto **open-source, crowdsourced, orientado a la comunidad**. No busca revenue ni market share. Compite en legitimidad y soberanía de datos, no en ARR.

---

## CORRECCIÓN DE FRAME (leer primero)

El reporte anterior analizó Igni como si fuera una startup civic-tech compitiendo con Watch Duty. Ese frame es incorrecto.

**Igni es un bien común digital:**
- Open-source, replicable por región
- Sin modelo de revenue primario
- La comunidad (brigadas, vecinos, Defensa Civil) es el producto y el cliente al mismo tiempo
- Watch Duty y los AI-startups no son competidores: son referencias de features y casos de éxito a estudiar
- El éxito se mide en adopción comunitaria, confiabilidad operacional y replicabilidad, no en usuarios activos mensuales ni en ARR

Lo que sigue replantea todo bajo ese eje.

---

## 1. Executive Summary (OSS-first)

Cinco aprendizajes clave bajo el nuevo frame:

1. **Existen análogos OSS exitosos, y sus patrones son reproducibles.** Ushahidi (crisis mapping), Safecast (radiación post-Fukushima), HOT-OSM (desastres), Sahana Eden (coordinación humanitaria) y PyroNear (detección de incendios) demuestran que infraestructura crítica puede sostenerse sin VC. Los factores comunes: gobernanza distribuida, financiamiento mixto (grants + brigadas/municipios que pagan infra), y documentación que mata el bus factor.

2. **El campo OSS de wildfire específico está activo pero fragmentado.** Pyronear (Francia, activo en 2026), ODIN-fire, bcgov/wps (British Columbia), FireAlert (Plant-for-the-Planet), Wildfire Commons y OpenEWS son proyectos activos con los que Igni debería integrarse o federar, no duplicar.

3. **La licencia AGPL-3 es la elección correcta para Igni.** Protege la soberanía de los datos comunitarios, obliga a que mejoras de instituciones/gobiernos que usan Igni vuelvan al proyecto, y es el estándar de la mayoría de proyectos civic-tech de impacto. MIT maximiza adopción pero permite que actores privados clausuren el fork.

4. **Los fondos existen y son accesibles.** NLnet (hasta €50K por proyecto, enfocado en internet abierto y soberanía digital), Sovereign Tech Fund (€50K-€1M, público alemán, para infraestructura digital crítica), Mozilla MOSS, Sloan Foundation, y la Digital Public Goods Alliance son canales directamente aplicables. No requieren ser empresa ni tener revenue.

5. **El riesgo #1 no es falta de dinero: es el bus factor.** La mayoría de proyectos civic-tech muere cuando el fundador se va. La solución es estructural: gobernanza documentada, contribuidores en múltiples geografías, y una fundación o fiscal host (Open Collective, Software Freedom Conservancy) como paraguas institucional desde el inicio.

---

## 2. Proyectos OSS Análogos: Qué Estudiar

### 2A. Crisis-mapping y emergencias (análogos directos)

| Proyecto | Dominio | Gobernanza | Funding | Bus Factor | Lección para Igni |
|---------|---------|------------|---------|------------|-------------------|
| **Ushahidi** | Crisis mapping genérico | Nonprofit civic-tech company (Kenya) | Revenue SaaS + grants + crowdfunding | Bajo: equipo distribuido + "trusted developers" program | Igni puede usar su plataforma como base o tomar su modelo de verificación comunitaria |
| **Safecast** | Radiación post-Fukushima | Nonprofit internacional, voluntarios | Individuos + grants + fundaciones caritativas, **cero funding gubernamental** | Bajo: distribuido en Japón/USA/Europa, datos abiertos | Modelo de ciudadanos con sensores propio: aplica a brigadas con GPS/reporte |
| **Sahana Eden** | Coordinación humanitaria | Sahana Software Foundation + comunidad laxa | SIDA Suecia, IBM, NSF USA + vendedores profesionales + voluntarios | Medio: depende de comunidad de practitioners | Igni puede usar Eden como base técnica para el dashboard de coordinación de recursos |
| **HOT-OSM** | Mapeo en desastres | Nonprofit internacional, model locally-led | Audacious Project (seed), microgrants, subcontratos con ACNUR/OIM, corporate partners | Bajo: comunidad de miles de mappers + estructura de hubs locales | Modelo de microgrants a brigadas locales para activaciones de mapeo |
| **mPing (NOAA)** | Reporte ciudadano de clima severo | Gubernamental USA (NOAA/CIMMS) | Presupuesto estatal USA | N/A (estatal) | Interfaz sin fricción, sin login: validación del modelo de reporte anónimo |
| **Zooniverse** | Ciencia ciudadana | Nonprofit UK | Grants + Sloan + NSF | Bajo: 50+ instituciones partner | Modelo de validación por múltiples usuarios: aplica a verificación de focos |

### 2B. Wildfire OSS específico (integrarse, no duplicar)

| Proyecto | Stack | Estado (2026) | Relevancia | URL |
|---------|-------|---------------|------------|-----|
| **PyroNear** | Python + cámaras + ML | Muy activo (repo actualizado abr 2026) | Detección temprana con cámaras IoT + FIRMS; NGO francesa, financiada por grants; **integración natural con Igni** | github.com/pyronear |
| **ODIN-fire** | Rust + web | Activo (jul 2024) | Framework de integración de datos heterogéneos para wildfire; arquitectura de referencia para multi-fuente | github.com/NASAWorldWind/ODIN-fire |
| **bcgov/wps** | Python/React | Muy activo | Sistema gubernamental BC Canada, open-source real, operacional; referencia de arquitectura para integración gubernamental | github.com/bcgov/wps |
| **FireAlert** | — | Activo | Alertas FIRMS por SMS, email y WhatsApp para cualquier zona; Plant-for-the-Planet; directamente análogo a lo que Igni quiere hacer para notificaciones | github.com/plant-for-the-planet-org |
| **OpenEWS** | — | Activo (abr 2026) | Plataforma open-source de diseminación de alertas de emergencia; soporta CAP; **planea integrar modelado de propagación de incendios y alertas de evacuación** | open-ews.org |
| **Wildfire Commons** | — | Activo | Iniciativa de comunidad para centralizar datasets, modelos AI y herramientas open-source de wildfire | wildfirecommons.org |
| **TAK-NZ/etl-firms** | ETL Python | Activo (2026) | Pipeline FIRMS listo para usar; Igni puede consumirlo directamente | github.com/TAK-NZ/etl-firms |

**Conclusión:** Igni no necesita construir desde cero la capa de detección (PyroNear), ni la de alertas (OpenEWS, FireAlert), ni la de datos FIRMS (etl-firms). El valor de Igni está en la **capa comunitaria**: verificación ciudadana, tracking de recursos, y adaptación cultural a Patagonia/Latam.

### 2C. Protocolos abiertos relevantes

| Protocolo | Qué hace | Adopción | Recomendación para Igni |
|----------|----------|----------|------------------------|
| **CAP (Common Alerting Protocol, OASIS)** | Formato estándar XML/JSON para alertas de emergencia multi-canal | FEMA IPAWS (USA), muchos sistemas nacionales | Igni debería emitir alertas en formato CAP desde el inicio. Es lo que permite interoperabilidad con sistemas gubernamentales y broadcast masivo |
| **EDXL (Emergency Data Exchange Language)** | Suite de estándares para intercambio de datos de emergencia (incluye DE, HAVE, TEP) | Defensa Civil USA, Cruz Roja | Implementación avanzada; útil si Igni quiere hablar con sistemas de Defensa Civil formales |
| **FIRMS API (NASA)** | Detección de puntos de calor satelital (MODIS, VIIRS, LANDSAT) | Estándar global | Ya implementado en Igni; mantenerlo como fuente primaria de contexto regional |
| **ActivityPub** | Protocolo de redes sociales federadas (Mastodon, etc.) | Fediverse | No existe implementación en sistemas de emergencia; no recomendado aún; puede ser interesante para alertas federadas entre instancias Igni a futuro |

**Prioridad:** implementar CAP output desde MVP. Es lo que transforma Igni de "app comunitaria" a "infraestructura interoperable".

---

## 3. Igni como Bien Común Digital: Sostenibilidad a 3 Años

### 3A. Modelos de funding aplicables

| Fuente | Qué financia | Monto típico | Fit con Igni | Proceso |
|--------|-------------|--------------|--------------|---------|
| **NLnet Foundation** | Internet abierto, privacidad, soberanía digital, estándares abiertos | €5K-€50K por proyecto | Alto: Igni es infraestructura digital pública, open standards, soberanía de datos comunitarios | Aplicación abierta, ciclos trimestrales; nlnet.nl |
| **Sovereign Tech Fund** | Infraestructura digital crítica open-source, mantenimiento a largo plazo | €50K-€1M | Alto si Igni escala a nivel regional; foco en resiliencia y soberanía tecnológica | Candidatura abierta; sovereigntechfund.de |
| **Mozilla MOSS** | Proyectos open-source de impacto en salud de internet | $10K-$150K USD | Medio: fit parcial por el componente de datos abiertos y comunidad | Aplicación abierta; mozilla.org/en-US/moss |
| **Sloan Foundation** | Ciencia, tecnología, economía; datos abiertos, software científico | $50K-$500K USD | Medio-Alto si Igni incorpora componente de datos de investigación (quemas históricas, clima) | Invitación o LOI; sloan.org |
| **Digital Public Goods Alliance** | Reconocimiento y visibilidad como bien público digital (no dinero directo) | — | Alto para legitimidad; abre puertas a PNUD, UNICEF Tech, OEA | Registro en DPGregistry; digitalpublicgoods.net |
| **Open Collective** | Fiscal hosting + transparencia financiera para proyectos sin entidad legal | — (es el canal, no el funder) | Alto para arrancar: permite recibir donaciones y pagar infra sin crear fundación | opencollective.com |
| **Municipios/provincias pagando infra** | Defensa Civil Chubut, Neuquén Digital, municipio El Bolsón | $200-$2000 USD/mes | Alto a mediano plazo: el municipio hostea su instancia o paga la infra de Igni para su territorio | Convenio técnico simple; no requiere licitación si es OSS |
| **Brigadas de bomberos voluntarios** | Donaciones en especie (servidor, dominio, mantenimiento) | — | Medio: las brigadas no tienen presupuesto pero pueden presionar a municipios | Colaboración directa |

**Ruta realista a 3 años:**
- Año 1: Open Collective para recibir donaciones + NLnet grant (€10-30K para infra y dev inicial)
- Año 2: Convenio con 1-2 municipios patagónicos que pagan infra (~$500/mes c/u) + candidatura Sovereign Tech Fund
- Año 3: DPGA recognition + Sloan o Mozilla MOSS si hay componente de investigación; 3-5 instancias regionales auto-sostenidas

### 3B. Gobernanza: qué funciona y qué falla

**Modelos que funcionan (observado en Ushahidi, HOT, Sahana, Safecast):**

- **Steering committee pequeño + comunidad amplia.** 3-5 personas con poder de decisión técnica real; cientos de contribuidores. Ushahidi tiene un Core Team + Trusted Developers program. HOT tiene un Governance Working Group electo. Safecast tiene un Board internacional mínimo.
- **Locally-led, not remotely managed.** HOT cambió de mapeo centralizado a hubs locales con presupuesto propio. Aplica a Igni: brigada de Epuyén debería tener ownership de su instancia, no depender de que Gonza responda un issue.
- **Documentación como vacuna contra el bus factor.** Safecast publica todos sus métodos, Sahana tiene guías de deployment extensas, HOT tiene mapathon runbooks. Igni necesita: CONTRIBUTING.md, DEPLOYMENT.md, GOVERNANCE.md desde el día 1.
- **Open data como contrato con la comunidad.** Safecast publica todos los datos en Creative Commons. Los usuarios confían porque saben que los datos no desaparecen si la organización muere. Igni debe comprometerse a datos bajo CC BY 4.0 o similar desde el inicio.

**Qué falla (patrones a evitar):**

- **Proyecto = fundador.** Si solo Gonza puede hacer un release, Igni muere con Gonza. Requiere al menos 2 personas con acceso de merge y deploy desde el inicio.
- **Gobernanza informal.** "Nos organizamos en WhatsApp" es un error clásico. Cuando hay más de 3 contribuidores activos, necesitás un proceso de decisión escrito aunque sea de 1 página.
- **Dependencia de un grant específico.** Muchos proyectos civic-tech colapsan cuando un grant no se renueva. La diversificación de fuentes es crítica desde el año 2.
- **Scope creep sin priorización comunitaria.** Sin un proceso de priorización público (RFC, votación en issues, roadmap abierto), los proyectos OSS terminan respondiendo a quien grita más fuerte, no a quien más lo necesita.

---

## 4. Replicabilidad Regional: Multi-instancia y Federación

### El modelo Mastodon/Funkwhale aplicado a emergencias

No existe hoy un framework estándar para deployments federados de sistemas de emergencia. Sin embargo, el patrón es claro en redes sociales federadas y puede adaptarse:

- **Instancia por región/municipio:** Cada brigada, municipio o provincia levanta su propia instancia de Igni con sus propios datos. No depende de la instancia central para operar.
- **Federación opcional de datos:** Las instancias pueden compartir focos verificados entre sí (protocolo a definir; CAP es el candidato natural). Un foco en El Bolsón puede ser visible desde la instancia de Esquel si las dos instancias acuerdan compartir.
- **Catálogo público de instancias:** Tipo joinmastodon.org pero para Igni: lista de instancias activas por región, con estado operacional y última actividad.

**Referencia técnica:** OpenEWS ya está pensando en diseminación multi-canal desde el inicio. Igni podría contribuir a OpenEWS o hacer su capa comunitaria interoperable con OpenEWS para la parte de broadcast.

**Qué implica para el stack actual de Igni:**
- Supabase puede hostear múltiples proyectos (uno por instancia) bajo la misma org
- La API de Igni debe ser stateless y configurable por región desde env vars
- CAP output permite que cualquier instancia Igni sea consumida por sistemas externos sin lock-in

---

## 5. Preguntas Críticas: Respuestas Directas

**¿Con qué proyectos OSS debería integrarse o federar Igni en vez de competir?**
- **Integrar:** PyroNear (detección temprana con cámaras), FireAlert (notificaciones FIRMS multi-canal), TAK-NZ/etl-firms (pipeline FIRMS), OpenEWS (broadcast de alertas en CAP)
- **Federar datos:** bcgov/wps (si hay colaboración institucional), Wildfire Commons (datasets abiertos)
- **No duplicar:** detección ML propia, pipeline satelital propio. Consumir PyroNear/FIRMS como fuente.

**¿Qué licencia conviene?**
AGPL-3.0. Razones:
1. Obliga a que gobiernos y municipios que modifiquen Igni para uso interno publiquen sus cambios
2. Protege que ningún actor privado pueda clausurar el fork y venderlo sin devolver mejoras
3. Es el estándar de Ushahidi (AGPL), Mastodon (AGPL), y la mayoría de infraestructura civic-tech de impacto
4. MIT permite adopción más amplia pero sacrifica la reciprocidad comunitaria que Igni necesita

Caveat: si algún gobierno pide integrar Igni en un sistema cerrado, se puede emitir licencia dual. Pero AGPL como default.

**¿Debería unirse a una umbrella existente?**
- **Digital Public Goods Alliance:** Sí, como primer paso. Es gratuito, da legitimidad internacional, y abre puertas con PNUD y agencias de la ONU que podrían financiar deployments en otros países afectados por incendios (Bolivia, Ecuador, Uruguay).
- **Open Collective:** Sí, desde el inicio. Permite recibir donaciones con transparencia sin crear una fundación. Costo: 10% + fees de tarjeta.
- **Software Freedom Conservancy o OSGeo:** A considerar en año 2-3 si Igni crece. OSGeo es especialmente relevante porque es el paraguas de muchos proyectos de geo/GIS open-source.
- **Fundación propia:** No todavía. El overhead administrativo mataría el proyecto en esta etapa.

**¿Cuál es la ruta de sostenibilidad a 3 años sin VC?**
Ver sección 3A. En resumen: Open Collective + NLnet (año 1) → convenios municipales (año 2) → Sovereign Tech Fund + DPGA recognition (año 3).

**¿Qué comunidad debería adoptar Igni primero?**
**Brigadas de bomberos voluntarios de Epuyén/El Bolsón.** Razones:
1. Gonza vive ahí: el feedback loop es directo y rápido
2. El incendio de Las Golondrinas (2021) demostró que la coordinación fue caótica; hay motivación real
3. Las brigadas tienen estructura (aunque informal) y pueden aportar verificación experta de focos
4. El caso de éxito local es la prueba que abre puertas en Esquel, Bariloche, Neuquén

**¿Cómo evitamos que Igni muera cuando el fundador deja?**
- **Gobernanza documentada desde el inicio:** GOVERNANCE.md con proceso de decisión, roles, y proceso de sucesión
- **Mínimo 2 maintainers con acceso de deploy** antes de la primera release pública
- **Open Collective como fiscal host** (dinero en un colectivo, no en cuenta personal de Gonza)
- **Datos en CC BY 4.0** (los datos no dependen del código)
- **Deploy reproducible en <30 minutos** con documentación pública (README + DEPLOYMENT.md)
- **Roadmap público** (GitHub Projects o Linear público) para que la comunidad sepa hacia dónde va sin preguntar a Gonza

---

## 6. White Space Latam (contexto, no posicionamiento competitivo)

El análisis previo de white space sigue siendo válido como contexto de necesidad, reencuadrado:

| País | Sistema gubernamental existente | Lo que falta para la comunidad |
|------|---------------------------------|-------------------------------|
| Argentina | SINAI (datos satelitales, sin interfaz ciudadana) | Reporte ciudadano verificado, tracking de recursos, alertas push |
| Chile | CONAF SIIF (operacional pero sin app pública útil) | Canal oficial de reporte ciudadano que llegue a brigadas |
| Brasil | INPE Monitor do Fogo (técnico, sin crowdsourcing) | Interfaz sin fricción para ciudadanos |
| Patagonia específica | Nada. WhatsApp, radio AM, Facebook en emergencias | Todo: mapa en tiempo real, reporte, verificación, alertas |

Dato confirmado: durante los incendios de Las Golondrinas/Epuyén (2021) y la temporada 2023-2024, la coordinación ciudadana ocurrió íntegramente por WhatsApp y grupos de Facebook.

---

## 7. Features Must-Have (contexto OSS sin cambios)

El análisis de features previo se mantiene. La diferencia es el orden de prioridad bajo el frame OSS:

### Must-Have para comunidad operacional

| Feature | Justificación | Alineación OSS |
|---------|---------------|----------------|
| Alertas push por zona geográfica | Core de cualquier sistema de emergencia | Puede federar con OpenEWS/FireAlert |
| Integración FIRMS/VIIRS | Estándar global; ya implementado | Consumir etl-firms directamente |
| Offline mode / low-bandwidth | Crítico en Patagonia rural | Sin dependencia de CDN externo |
| SMS / WhatsApp alerts | Canal dominante en Latam rural | Twilio API o WhatsApp Business API |
| **CAP output** | Interoperabilidad con sistemas gubernamentales | Nuevo: necesario para legitimidad institucional |
| **DEPLOYMENT.md + self-hosting guide** | Sin esto no hay replicabilidad regional | Nuevo: requisito de proyecto OSS serio |

### Nice-to-Have (diferencial, no bloqueante)

| Feature | Nota OSS |
|---------|----------|
| Predicción de comportamiento del fuego | Consumir modelos de Wildfire Commons, no entrenar propio |
| Integración Copernicus/Sentinel | API gratuita; añade contexto de quema total |
| Dashboard de coordinación de brigadas | El diferencial de Igni vs otros OSS; priorizar si hay brigadas interesadas |
| Cámaras IoT | Integrar con PyroNear, no construir propio |
| Calidad del aire | APIs gratuitas: OpenAQ, IQAir |

---

## 8. Riesgos bajo el Frame OSS

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| Bus factor (Gonza se va / pierde interés) | Alta si no se mitiga desde inicio | GOVERNANCE.md + 2 maintainers + Open Collective desde día 1 |
| Desactivación comunitaria entre temporadas | Alta (clásico en apps de emergencia) | Usar Igni para otros tipos de alertas (inundaciones, aludes) en invierno; comunidad permanente de mejora, no solo de uso |
| Fork privado por municipio sin devolver mejoras | Media con MIT; Baja con AGPL | AGPL como licencia default |
| Datos incorrectos durante emergencia real | Alta sin proceso de verificación | Modelo iNaturalist: ciudadano reporta → comunidad valida → bombero confirma; niveles de confianza explícitos en UI |
| Dependencia de Supabase/Mapbox (servicios propios) | Media | Documentar paths de migración a PostGIS propio + MapLibre/OpenStreetMap desde el inicio |
| Grant que no se renueva | Alta si es fuente única | Diversificación desde año 2; municipal + grant es el mínimo |

---

## 9. Recomendación: Próximos Pasos Concretos

Ordenados por impacto y urgencia bajo el frame OSS:

1. **Licencia:** Agregar `LICENSE` (AGPL-3.0) y `CONTRIBUTING.md` al repo antes de cualquier release pública. 1 día.
2. **Open Collective:** Crear colectivo en opencollective.com/igni (o similar). Fiscal host: Open Source Collective. Permite recibir donaciones y pagar Supabase/Vercel sin que sea plata de Gonza. 2 horas.
3. **DPGA Application:** Registrar Igni en Digital Public Goods Alliance. Abre legitimidad internacional y puertas a financiamiento de agencias ONU. 1 semana.
4. **CAP output:** Agregar endpoint `/api/alerts/cap.xml` que emita focos verificados en formato CAP. Permite que cualquier sistema gubernamental consuma Igni sin integración custom. 2-3 días de dev.
5. **DEPLOYMENT.md:** Documentar cómo levantar una instancia propia de Igni desde cero. Sin esto no hay replicabilidad. 1-2 días.
6. **Comunidad inicial:** Contactar brigadas de El Bolsón y Epuyén directamente. No esperar a tener el producto perfecto. El feedback de una temporada de fuego vale más que 6 meses de desarrollo en soledad.
7. **NLnet grant:** Preparar aplicación para el próximo ciclo (trimestral). Budget mínimo: €15-30K para infra, dev de CAP integration, y outreach comunitario en Patagonia.

---

## 10. Proyectos a Estudiar (Lecturas Prioritarias)

1. **Ushahidi governance model:** ushahidi.com/community
2. **HOT locally-led model:** hotosm.org/updates/hot-transitioning-to-a-locally-led-model
3. **Safecast open data methodology:** safecast.org/methodology
4. **NLnet application guide:** nlnet.nl/apply
5. **PyroNear architecture:** github.com/pyronear/pyro-api (referencia directa de integración)
6. **OpenEWS:** open-ews.org (potencial collaborator en CAP/alerting)
7. **Digital Public Goods Standard:** digitalpublicgoods.net/standard

---

## 11. Watch Duty y AI-Startups: Referencia, No Competidores

> Estos proyectos son útiles como benchmark de features y prueba de demanda. No son el target a alcanzar ni el enemigo a superar.

**Watch Duty:** nonprofit con $11.4M de revenue (2025), 16.8M usuarios/año, curación humana experta (no crowdsourcing). Foco absoluto en USA. Lo que Igni puede aprender: la credibilidad como diferencial, el modelo de verificación experta, la expansión gradual de tipos de emergencia.

**PyroNear:** el análogo OSS más cercano a Igni en componente técnico. Francesa, grant-funded, detección temprana con cámaras + ML. **Integrar, no competir.**

**Pano AI / OroraTech / Dryad:** B2G enterprise, hardware físico, decenas de millones de dólares de VC. Mercado completamente diferente. Útiles como referencia de lo que es posible técnicamente en detección temprana.

**bcgov/wps:** el OSS más maduro para operaciones reales de wildfire. Referencia de arquitectura, no competidor. Vale estudiar su gobernanza como proyecto OSS gubernamental.

---

## Fuentes Citadas

1. Gemini Search (Google Grounding) — 4 queries, Abril 2026
2. Ushahidi — Community + governance: https://ushahidi.com
3. Safecast — Open data methodology: https://safecast.org
4. HOT-OSM — Locally-led model: https://hotosm.org
5. Sahana Software Foundation: https://sahanafoundation.org
6. PyroNear — GitHub (pyronear/pyro-api, actualizado abr 2026): https://github.com/pyronear/pyro-api
7. OpenEWS — Open emergency warning system: https://open-ews.org
8. Wildfire Commons: https://wildfirecommons.org
9. FireAlert — Plant-for-the-Planet: https://github.com/plant-for-the-planet-org
10. ODIN-fire (NASA WorldWind): https://github.com/NASAWorldWind
11. bcgov/wps (Wildfire Predictive Services BC): https://github.com/bcgov/wps
12. TAK-NZ/etl-firms: https://github.com/TAK-NZ/etl-firms
13. NLnet Foundation: https://nlnet.nl
14. Sovereign Tech Fund: https://sovereigntechfund.de
15. Mozilla MOSS: https://mozilla.org/en-US/moss
16. Sloan Foundation: https://sloan.org
17. Digital Public Goods Alliance: https://digitalpublicgoods.net
18. Open Collective: https://opencollective.com
19. CAP (Common Alerting Protocol, OASIS): https://oasis-open.org/committees/emergency
20. NASA FIRMS API: https://firms.modaps.eosdis.nasa.gov
21. Watch Duty (referencia de features): https://watchduty.org
22. InfOCampo — Incendios Patagonia: https://infocampo.com.ar
