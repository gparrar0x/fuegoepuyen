# Política de Seguridad

La seguridad de Igni es crítica: el proyecto opera en emergencias reales y los datos de recursos y focos pueden ser sensibles. Agradecemos los reportes responsables de vulnerabilidades.

## Versiones soportadas

| Versión | Soporte de seguridad |
|---------|---------------------|
| `main` (HEAD) | Sí |
| Última release taggeada | Sí (≤90 días) |
| Releases anteriores | No |

El proyecto avanza rápido y los fixes de seguridad se aplican a `main`. Si operás una instancia en producción, manteneté cerca de `main` o de la última release.

## Cómo reportar una vulnerabilidad

**No abras un issue público para vulnerabilidades de seguridad.** Los issues públicos dan tiempo cero a los mantenedores para responder antes de que el exploit sea conocido.

Canales privados, en orden de preferencia:

1. **GitHub Security Advisories**: https://github.com/gparrar0x/igni/security/advisories/new
2. **Email cifrado**: security@skywalking.dev
3. **Email sin cifrar** (si es la única opción): security@skywalking.dev con asunto `[SECURITY] Igni <resumen>`

## Qué incluir en el reporte

- Descripción del problema
- Pasos para reproducir
- Impacto estimado (qué datos/sistemas se comprometen)
- Versión del software afectada (commit hash o release)
- Tu nombre o handle (si querés crédito)

## Proceso de respuesta

| Tiempo | Acción |
|--------|--------|
| ≤48h | Acuse de recibo del reporte |
| ≤7d | Evaluación inicial y severidad asignada (CVSS) |
| ≤30d | Fix desplegado en `main` para severidad alta/crítica |
| ≤90d | Advisory público con crédito a quien reportó |

Para vulnerabilidades críticas (RCE, escalamiento de privilegios, exposición de datos masiva) aceleramos el proceso: fix en <7d cuando sea técnicamente posible.

## Qué consideramos vulnerabilidad

- Ejecución remota de código
- Inyección SQL, XSS persistente, CSRF
- Bypass de autenticación o autorización (RLS policies)
- Exposición de datos de usuarios (emails, teléfonos, ubicaciones privadas)
- Exposición de secretos (service_role keys, tokens de terceros)
- Denial of service remoto y explotable por usuarios no autenticados
- Fallas de aislamiento entre instancias federadas

## Qué **no** consideramos vulnerabilidad

- Ataques que requieren acceso físico al dispositivo
- Ataques de ingeniería social fuera del software
- Resultados de escáneres automáticos sin PoC que demuestre impacto real
- Mejores prácticas sin vulnerabilidad explotable (ej: "deberían tener HSTS")
- Rate limiting bypass sin impacto demostrado
- Self-XSS que requiere que la víctima pegue código en su propia consola

## Disclosure público

Una vez que el fix está desplegado y distribuido, publicamos:

- GitHub Security Advisory con CVE si aplica
- Entrada en `CHANGELOG.md` bajo `### Security`
- Post en el canal de comunidad

Damos crédito al reporte responsable salvo que pidas anonimato.

## Safe Harbor

No tomamos acciones legales contra investigadores de seguridad que:

- Actúen de buena fe
- No accedan ni modifiquen datos de otros usuarios
- No interrumpan el servicio
- Sigan este proceso de disclosure privado

Los tests en instancias oficiales de Igni deben hacerse de forma responsable y no invasiva. Para tests agresivos, usá tu propia instancia self-hosted.

## Dependencias

Igni depende de:

- **Next.js** + **React** — reportar al equipo de Next.js
- **Supabase** — reportar a [supabase.com/security](https://supabase.com/security)
- **Mapbox** — reportar a [mapbox.com/security](https://mapbox.com/security)

Si encontrás un bug en una dependencia que afecta a Igni pero es problema de upstream, reportalo al upstream primero y avisanos por el canal privado.

---

*Última actualización: 2026-04-23*
