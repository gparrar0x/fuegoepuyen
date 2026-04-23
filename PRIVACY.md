# Política de Privacidad

> Esta política aplica a la instancia de referencia de Igni operada por los mantenedores del proyecto (igni.skyw.app). Otras instancias federadas pueden tener políticas propias — revisá la política de la instancia que uses.

*Última actualización: 2026-04-23*

## Resumen corto

Igni es un bien común digital. Recolectamos lo mínimo indispensable para que la comunidad pueda reportar, verificar y responder a incendios forestales. No vendemos datos. No perfilamos usuarios para publicidad. Los datos sobre focos y recursos son públicos por diseño; los datos personales están protegidos.

## Qué datos recolectamos

### Datos que vos ingresás voluntariamente

- **Reportes de focos:** ubicación (lat/lng), hora, intensidad estimada, descripción, foto opcional
- **Verificaciones:** tu voto (positivo/negativo) + comentario opcional sobre reportes de otros
- **Recursos:** si registrás un camión, voluntario o equipo — tipo, ubicación, estado, teléfono de contacto
- **Perfil:** nombre a mostrar, teléfono opcional, zona geográfica

### Datos que se recolectan automáticamente

- **Ubicación aproximada del navegador** (solo si das permiso explícito) para centrar el mapa
- **Logs técnicos mínimos:** timestamp, endpoint accedido, status code, user agent
- **Cookies de sesión** si iniciás sesión con email/contraseña (Supabase Auth)

### Qué **no** recolectamos

- Dirección IP completa (se trunca en los logs cuando es posible)
- Trackers de terceros (no usamos Google Analytics, Meta Pixel, ni equivalentes)
- Ubicación precisa persistente de usuarios
- Datos biométricos, de menores, o de salud

## Datos de focos y recursos son públicos

Por diseño y por el contrato con la comunidad, los siguientes datos son **públicos y de acceso abierto**:

- Ubicación y estado de focos reportados
- Verificaciones (sin identificar a quien votó)
- Ubicación y tipo de recursos registrados (camiones, equipamiento)

Estos datos se publican bajo licencia **Creative Commons Attribution 4.0 (CC BY 4.0)** y están disponibles via API, feeds CAP y GeoJSON.

**Lo que NO es público aun siendo útil operacionalmente:**

- Emails de usuarios
- Teléfonos de contacto (visibles solo a usuarios autenticados con rol `verifier` o `admin`)
- Identidad de quien reportó un foco específico (el voto del reporter se mantiene anónimo en datos abiertos)

## Uso de los datos

Los datos se usan exclusivamente para:

1. Operación del mapa y funcionalidades declaradas
2. Ingesta y cruce con datos satelitales (NASA FIRMS)
3. Verificación comunitaria y coordinación de respuesta
4. Publicación de datos abiertos agregados sobre incendios
5. Mejora del software (agregados, sin identificar individuos)

No usamos los datos para publicidad, marketing dirigido, ni los vendemos a terceros.

## Compartición con terceros

Los datos personales se comparten únicamente con los proveedores de infraestructura necesarios para operar el servicio:

| Proveedor | Qué procesa | Ubicación | Por qué |
|-----------|-------------|-----------|---------|
| **Supabase** | Base de datos, auth, storage | Típicamente US/EU (depende del proyecto) | Almacenamiento primario |
| **Vercel** | Hosting de la aplicación | Global edge | Servir la app |
| **Mapbox** | Tiles de mapa | Global | Renderizar mapas (no recibe datos de usuarios) |
| **NASA FIRMS** | — | — | Solo consumimos datos, no enviamos nada |

Cada proveedor opera bajo su propia política de privacidad. Ningún proveedor recibe datos fuera de lo estrictamente necesario para prestar su servicio.

## Base legal (contexto Argentina / LATAM)

Operamos bajo la **Ley 25.326 de Protección de Datos Personales** de Argentina, y principios equivalentes en otras jurisdicciones de LATAM. Las bases legales de tratamiento son:

- **Consentimiento** — al crear cuenta o enviar reportes, aceptás esta política
- **Interés legítimo** — operación del servicio y seguridad
- **Interés público** — coordinación de respuesta a emergencias

## Tus derechos

Tenés derecho a:

- **Acceder** a tus datos: pedir copia de lo que tenemos sobre vos
- **Rectificar** datos incorrectos
- **Eliminar** tu cuenta y datos personales asociados
- **Oponerte** al procesamiento en casos específicos
- **Portar** tus datos en formato estructurado (JSON)

Para ejercer estos derechos escribinos a **privacy@skywalking.dev** con el asunto `[PRIVACY] <tu solicitud>`. Respondemos dentro de 10 días hábiles.

**Excepción:** los datos sobre focos reportados que ya fueron verificados por la comunidad quedan en el registro histórico agregado como dato abierto (sin identificarte). Podemos anonimizar pero no retirar esos datos del histórico — son parte del valor público del proyecto.

## Retención

- **Datos de cuenta activa:** mientras la cuenta exista
- **Datos de cuenta eliminada:** 30 días de buffer para permitir recuperación, luego borrado definitivo (excepto datos agregados anonimizados)
- **Logs técnicos:** máximo 30 días
- **Reportes de focos:** indefinidamente como parte del registro histórico abierto (anonimizados a nivel de reporter)

## Menores

Igni no está diseñado para menores de 13 años. Si creás una cuenta debés ser mayor de esa edad o tener consentimiento de un tutor legal. Si detectamos cuentas de menores sin consentimiento, las eliminamos.

## Seguridad

Protegemos los datos con:

- Comunicación cifrada en tránsito (HTTPS obligatorio)
- Base de datos cifrada en reposo (Supabase)
- Row Level Security (RLS) en todas las tablas
- Secrets y service keys en variables de entorno, nunca en código cliente
- Auditorías regulares del código

En caso de brecha de datos que afecte derechos o libertades, notificamos a quienes correspondan dentro de 72h y publicamos advisory.

## Cambios a esta política

Publicamos cambios en este archivo del repositorio. Para cambios materiales (qué datos se recolectan, con quién se comparten) avisamos con 30 días de anticipación vía banner en la app y post en el canal de comunidad.

## Contacto

- **Privacidad:** privacy@skywalking.dev
- **Seguridad:** security@skywalking.dev (ver `SECURITY.md`)
- **Conducta:** conduct@skywalking.dev
- **Issues del proyecto:** https://github.com/gparrar0x/igni/issues

## Autoridad de control

Si no estás conforme con cómo tratamos tus datos, podés reclamar ante la autoridad de protección de datos de tu jurisdicción:

- Argentina: [Agencia de Acceso a la Información Pública](https://www.argentina.gob.ar/aaip)
- Otros países LATAM: consultá el regulador local
