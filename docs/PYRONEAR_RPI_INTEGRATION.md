# PyroNear + Raspberry Pi → Igni: Guía de integración

> Verificado contra repos reales (github.com/pyronear) — abril 2026.
> Todo lo marcado como [INFERIDO] no está explícitamente documentado en los repos.

---

## TL;DR

- **Si se puede montar en RPi.** El CLAUDE.md del propio repo pyro-engine dice textualmente: *"edge devices (Raspberry Pi, etc.)"*. Python 3.11+, NCNN (ARM-optimizado) o ONNX, Docker. Sin acelerador externo requerido.
- **Esfuerzo real: ~3 dias de setup técnico** + hardware (~$400–600 USD en LATAM). No trivial pero tampoco complejo.
- **Camino recomendado: Opción B** — pyro-engine en RPi → pyro-api self-hosted tuyo → Igni consume tu instancia via webhook/polling.

---

## Arquitectura PyroNear (verificada en repos)

### División edge / server

```
┌─────────────────────────────────────────────────────────┐
│  EDGE DEVICE (Raspberry Pi)                             │
│                                                         │
│  ┌──────────────────┐    ┌─────────────────────────┐   │
│  │  pyro_camera_api │    │     pyroengine           │   │
│  │  (FastAPI)       │◄──►│   (core.py + engine.py)  │   │
│  │  Puerto local    │    │                          │   │
│  │  Control PTZ     │    │  YOLO11 via NCNN/ONNX    │   │
│  │  RTSP/HTTP/CSI   │    │  Sliding window          │   │
│  └──────────────────┘    │  Alert threshold         │   │
│         ▲                └──────────┬───────────────┘   │
│         │                           │ HTTP POST          │
│   Cameras (IP/RTSP)                 │ multipart          │
│   Reolink, Hikvision,               ▼                   │
│   Linovision, URL                                        │
└─────────────────────────────────────────────────────────┘
                                      │
                               Bearer Token
                               HTTPS REST
                                      │
┌─────────────────────────────────────▼───────────────────┐
│  SERVER (cloud / VPS / local)                           │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  pyro-api  (FastAPI + PostgreSQL)                │   │
│  │  POST /api/v1/detections/                        │   │
│  │  PATCH /api/v1/cameras/heartbeat                 │   │
│  │  GET  /api/v1/sequences/unlabeled/latest         │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼───────────────────┐
│  IGNI (Next.js + Supabase)                              │
│  Consume detecciones via webhook / polling               │
└─────────────────────────────────────────────────────────┘
```

**Fuente:** `pyronear/pyro-engine` → `CLAUDE.md` (architecture section), `pyproject.toml`, `requirements.txt`

### Stack real del edge

| Componente | Valor real |
|------------|------------|
| Lenguaje | Python 3.11+ |
| Inferencia | **NCNN** (ARM-optimizado, default en RPi) o ONNX |
| Modelo | YOLO11, pesos descargados automáticamente de Hugging Face Hub |
| Cámara API | FastAPI corriendo en localhost (contenedor separado) |
| Orquestación | Docker + docker-compose (2 contenedores: engine + camera_api) |
| Comunicación interna | HTTP local (engine llama a camera_api para capturar frames) |
| Package manager | `uv` |

### Stack real del API server

| Componente | Valor real |
|------------|------------|
| Framework | FastAPI |
| Base de datos | PostgreSQL |
| Deploy | Docker Compose |
| Puerto | 5050 (Swagger UI en `/docs`) |
| Auth | Bearer token por cámara (JWT) |
| Cliente Python | `pyroclient` (incluido en el repo como subdirectorio) |

---

## Hardware soportado para el edge

### Raspberry Pi — soporte oficial

**CONFIRMADO EN EL REPO:** El `CLAUDE.md` del repo pyro-engine dice: *"edge devices (Raspberry Pi, etc.)"*.

| Aspecto | Hallazgo | Fuente |
|---------|----------|--------|
| RPi soportado | Si, explícitamente mencionado | `CLAUDE.md` del repo |
| Modelo mínimo documentado | No especificado en docs | [INFERIDO: RPi 4 4GB mínimo viable, RPi 5 8GB recomendado] |
| Acelerador requerido | No. NCNN es ARM-nativo | `requirements.txt` (`ncnn==1.0.20240410`) |
| Aceleradores soportados | Ninguno documentado (no Coral, no Jetson, no Hailo) | `requirements.txt` |
| Python | 3.11+ | `pyproject.toml` |

### Nota sobre NCNN

NCNN es un framework de inferencia de redes neuronales desarrollado por Tencent, **optimizado para ARM**. Corre eficientemente en RPi sin GPU. Es la dependencia clave que hace viable el edge deployment sin acelerador. Verificado en `requirements.txt`: `ncnn==1.0.20240410`.

### Cámaras soportadas (verificado en adapters/)

- **Reolink** (PTZ y estáticas) — soporte nativo, mencionado extensamente
- **Linovision / Hikvision** (protocolo ISAPI)
- **RTSP** streams genéricos
- **HTTP URL** (cualquier cámara que exponga snapshot vía URL)
- No se requiere módulo CSI. Una cámara IP con RTSP es suficiente.

### Visión nocturna

**PARCIALMENTE SOPORTADO.** El engine detecta noche via análisis del canal IR (`is_day_time(strategy="ir")`): si `max(R - G) == 0`, la imagen se considera infrarroja/nocturna. En ese caso el loop principal **duerme 1 hora** y detiene los patrullajes. Es decir: con cámara térmica o IR-cut podría funcionar de noche, pero el comportamiento default es **pausar inferencia de noche**. [Fuente: `CLAUDE.md` del repo, sección "Night / day handling"]

---

## Protocolo edge → server

### Autenticación

```
Authorization: Bearer <camera_token>
```

El token es por cámara. Se valida contra `GET /api/v1/login/validate` al inicializar el cliente.

### Endpoint de detección

```
POST https://api.pyronear.org/api/v1/detections/
Content-Type: multipart/form-data
Authorization: Bearer <camera_token>
```

### Payload verificado

```
Form fields:
  bboxes   = "(x1,y1,x2,y2,conf),(x1,y1,x2,y2,conf)"  # max 5 bboxes, coords normalizadas [0,1]
  pose_id  = "7"                                         # integer como string

File field:
  file     = <imagen JPEG>   # key "file", filename "logo.png", MIME "image/png"
```

**Fuente:** `pyroclient/client.py` — método `create_detection()`, verificado directamente.

### Heartbeat

```
PATCH /api/v1/cameras/heartbeat
Authorization: Bearer <camera_token>
```

Se envía periódicamente. No tiene payload especial.

### credentials.json (config del edge)

```json
{
  "192.168.1.10": {
    "token": "<JWT>",
    "type": "ptz",
    "name": "site-cam-01",
    "brand": "reolink",
    "id": 7,
    "poses": [0, 1, 2, 3],
    "azimuths": [0, 90, 180, 270]
  }
}
```

---

## Opciones de integración con Igni

### Tabla comparativa

| Opción | Descripción | Modificación PyroNear | Esfuerzo | Riesgo |
|--------|-------------|----------------------|----------|--------|
| **A** | RPi → api.pyronear.org → Igni consume API oficial | Cero | Bajo | Dependencia de infraestructura de terceros. No controlas SLAs. Necesitas cuenta PyroNear. |
| **B** | RPi → pyro-api self-hosted → Igni consume tu instancia | Cero en edge, deploy de pyro-api | Medio | Control total. Recomendado. |
| **C** | RPi → webhook directo a Igni | Fork + modificar engine.py | Alto | Acoplamiento fuerte. Perdes updates de PyroNear. |
| **D** | Fork pyro-engine completo + endpoint custom | Fork + mantenimiento | Alto | Máxima flexibilidad, máximo mantenimiento. |

### Opción recomendada: B

**Por qué:**
1. Cero modificaciones al edge — pyro-engine corre exactamente como está
2. Controlas el servidor: acceso a todas las detecciones, puedes hacer webhooks desde pyro-api hacia Igni
3. pyro-api despliega con `docker compose up` — 30 minutos de setup
4. Si PyroNear actualiza pyro-engine, tus RPis se actualizan sin conflictos
5. Igni consume via polling o webhook desde tu pyro-api self-hosted

**Integración Igni ← pyro-api:**

```
pyro-api → webhook → Igni API endpoint → Supabase insert
                                       → FIRMS data merge (ya tienes esto)
```

O polling desde Igni:
```
GET http://tu-pyro-api/api/v1/sequences/unlabeled/latest
```

[INFERIDO: pyro-api no tiene webhooks nativos documentados. Habría que implementar un pequeño adapter o usar polling desde Igni.]

---

## Hardware shopping list (LATAM, abril 2026)

| Componente | Especificación | Precio aprox. LATAM (USD) | Notas |
|------------|---------------|--------------------------|-------|
| Raspberry Pi 5 8GB | RPi 5, 8GB RAM | $330–$410 | Precio varía mucho por país e impuestos de importación |
| MicroSD + case activo | 64GB A2 + case con ventilador | ~$30–$50 | Necesario: RPi 5 corre caliente |
| Fuente de alimentación | Oficial RPi 5 (27W USB-C) | ~$15–$25 | No escatimar en esto |
| Cámara IP RTSP | Reolink RLC-810A o similar | $60–$120 | 4K, PoE, RTSP nativo. La más soportada |
| Switch PoE (si se usa PoE) | 5-port mini PoE switch | $25–$50 | Alternativa: alimentación USB a la cámara |
| Case exterior resistente | IP65, con montaje | $20–$40 | Necesario si va al exterior |
| Tarjeta SIM 4G + dongle | USB LTE modem | $30–$60 | Si no hay WiFi en campo |
| **Total estimado** | | **$510–$755 USD** | Sin 4G: $480–$695 |

**Consumo eléctrico:**
- RPi 5 bajo carga: ~5–8W
- Cámara IP Reolink: ~10–13W
- Total: ~15–20W. En 30 dias: ~11–14 kWh [INFERIDO a partir de specs de componentes]

**Mantenimiento:**
- Actualizaciones Docker: 1 comando periódico
- Limpieza de lente: mensual en campo
- Supervisión de logs: se puede automatizar via alertas

---

## Roadmap de integración

### Día 1 — Verificar viabilidad local

```bash
# Clonar el repo
git clone https://github.com/pyronear/pyro-engine.git
cd pyro-engine

# Copiar config de ejemplo
cp .env.example .env
# Editar .env: API_URL, CAM_USER, CAM_PWD

# Editar data/credentials.json con datos de tu cámara de prueba

# Levantar con mock (sin cámara real)
docker compose up  # Tarda en bajar imágenes la primera vez
```

Objetivo del día 1: ver el engine correr con cámara mock, entender los logs.

### Semana 1 — Self-host pyro-api

```bash
git clone https://github.com/pyronear/pyro-api.git
cd pyro-api
cp .env.example .env
docker compose pull
docker compose up

# API disponible en http://localhost:5050/docs
```

- Registrar una organización y cámara via Swagger UI
- Obtener el camera token JWT
- Apuntar pyro-engine a tu instancia: `API_URL=http://localhost:5050` en `.env`
- Verificar que detecciones llegan a tu pyro-api

### Semana 1 — Conectar Igni

- Crear endpoint en Igni: `POST /api/pyronear/detection`
- Implementar polling desde Igni a pyro-api: `GET /api/v1/sequences/unlabeled/latest`
- Normalizar campos pyro-api → schema Igni/Supabase
- Mergear con datos FIRMS existentes (coordenadas de cámara + timestamp)

### Mes 1 — Deploy en campo

- Comprar hardware (ver lista arriba)
- Instalar RPi OS + Docker
- Clonar pyro-engine en el RPi, configurar con cámara real
- Montar en ubicación: campo con visión panorámica, 360° si es PTZ
- Apuntar a pyro-api en tu VPS/cloud

---

## Riesgos y limitaciones (honestos)

### Lo que PyroNear NO hace

| Limitación | Detalle |
|------------|---------|
| Sin acelerador de hardware | NCNN corre en CPU ARM. Es viable pero inferencia tarda más que en GPU. Latencia estimada [INFERIDA]: 2–5 seg/frame en RPi 5 con YOLO11 small. |
| Sin visión nocturna por defecto | El engine pausa de noche. Con cámara térmica podría funcionar pero no está documentado ni soportado oficialmente. |
| Sin triangulación multi-cámara | Cada cámara reporta de forma independiente. No hay fusión de coordenadas de múltiples dispositivos. |
| Sin geolocalización del fuego | El sistema sabe que HAY fuego en el frame, pero no calcula coordenadas GPS del incendio. Solo reporta la cámara que lo detectó. [INFERIDO] |
| Sin calibración de falsos positivos documentada | No hay umbral configurable documentado públicamente. El sliding window está hardcoded en la lógica del engine. |

### Falsos positivos típicos [INFERIDO, no documentado en repos]

- Niebla densa o nubes bajas
- Humo industrial o doméstico a distancia
- Reflejos de sol en superficies metálicas
- Polvo en suspensión

### Distancia de detección [INFERIDO]

Depende de la cámara, no del modelo. Con Reolink 4K en montaña despejada: estimado 3–8 km para columnas de humo visibles. Para fuego pequeño: 500m–2km. Sin datos oficiales de PyroNear en sus repos.

### Comunidad PyroNear — dónde pedir ayuda

- **GitHub Issues:** https://github.com/pyronear/pyro-engine/issues (activo, última actualización 2026-04-21)
- **GitHub Discussions:** https://github.com/orgs/pyronear/discussions (verificar si está habilitado)
- **Discord:** Buscar en README de pyronear.org (no encontrado en repos — [INFERIDO que existe por ser proyecto OSS activo])

---

## Links directos (verificados)

| Recurso | URL |
|---------|-----|
| pyro-engine (repo principal edge) | https://github.com/pyronear/pyro-engine |
| pyro-api (servidor) | https://github.com/pyronear/pyro-api |
| pyro-vision (modelos) | https://github.com/pyronear/pyro-vision |
| pyro-platform (dashboard web) | https://github.com/pyronear/pyro-platform |
| CLAUDE.md del engine (arquitectura) | https://github.com/pyronear/pyro-engine/blob/main/CLAUDE.md |
| pyroclient (librería HTTP) | https://github.com/pyronear/pyro-api/tree/main/client |
| Swagger API oficial | https://api.pyronear.org/docs |
| Sitio oficial | https://pyronear.org |

---

## Qué está VISTO vs INFERIDO

**VISTO directamente en repos:**
- Soporte explícito para RPi en CLAUDE.md del engine
- NCNN como dependencia ARM-optimizada
- Python 3.11+, Docker, uv
- Cámaras soportadas (Reolink, Hikvision, RTSP, HTTP URL)
- Protocolo HTTP REST con multipart para detecciones
- Payload exacto: `bboxes`, `pose_id`, `file` (JPEG)
- Auth via Bearer token por cámara
- Comportamiento nocturno: sleep 1h, no inferencia
- credentials.json schema completo

**INFERIDO (no documentado explícitamente):**
- Modelo mínimo de RPi (4 vs 5, RAM mínima)
- Latencia de inferencia en ARM
- Distancias de detección confiables
- Falsos positivos típicos
- Existencia de Discord/comunidad
- Geolocalización GPS del foco de incendio
