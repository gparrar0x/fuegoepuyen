# Gobernanza de Igni

Este documento define cómo se toman decisiones en Igni, quién tiene qué responsabilidades, y cómo el proyecto sobrevive a cambios de personas.

Es un documento vivo. Se actualiza cuando la realidad del proyecto lo requiere, no antes.

## Principios rectores

1. **Comunidad antes que código.** Las decisiones técnicas se subordinan a las necesidades de las brigadas, vecinos y organizaciones que usan Igni operacionalmente.
2. **Transparencia por default.** Decisiones se documentan en issues/PRs públicos. Nada crítico se decide en privado.
3. **Replicabilidad sobre centralización.** Cada región que despliega Igni tiene autoridad sobre su instancia.
4. **Sin propietario único.** Igni es un bien común. Nadie puede privatizarlo ni clausurarlo.

## Roles

### Contribuidor

Cualquier persona que aporte código, documentación, traducciones, reportes de bugs, feedback de campo u otra contribución al proyecto.

- No requiere nombramiento
- Sin poder de merge
- Voz en issues y PRs

### Mantenedor (Maintainer)

Persona con derechos de merge en el repo principal y acceso a deploys de producción de la instancia de referencia.

- Revisa PRs, mergea código
- Responde issues
- Puede hacer releases
- Tiene acceso a secrets de producción (env vars, tokens)

**Mínimo: 2 mantenedores activos en todo momento.** Si queda solo 1, se invita a un contribuidor activo dentro de 60 días.

### Steering Committee (Comité de dirección)

Grupo de 3 a 5 personas que toma decisiones estratégicas cuando no hay consenso en issues/PRs.

Responsabilidades:
- Resolver disputas técnicas que no se resuelven en el PR
- Aprobar cambios a este documento
- Aprobar cambios a la licencia
- Representar al proyecto ante financiadores y partners

Composición inicial (abril 2026):
- Gonza Parra (fundador, mantenedor)
- [Segundo mantenedor — a definir antes de release v0.2.0]
- [Representante de brigada usuaria — a invitar después del piloto Epuyén]

Criterios para sumar miembros al Steering Committee:
- Contribución sostenida al proyecto por >6 meses
- Diversidad geográfica (evitar que todos estén en el mismo país)
- Diversidad de roles (dev, usuario operacional, investigación)

### Fiscal host

**Open Source Collective** vía [opencollective.com](https://opencollective.com). Recibe donaciones y paga infraestructura del proyecto en nombre de la comunidad. Ninguna persona física tiene acceso a los fondos fuera del proceso del Collective.

## Toma de decisiones

### Decisiones cotidianas (código, features, bugfixes)

Proceso estándar de PR:
1. Alguien abre un issue o PR
2. Mantenedores y comunidad revisan
3. Si hay consenso, se mergea
4. Si hay desacuerdo, se discute en el PR hasta resolver

Conflictos que no se resuelven en 14 días se escalan al Steering Committee.

### Decisiones estructurales

Requieren consenso explícito del Steering Committee:

- Cambio de licencia
- Cambio de fiscal host
- Cambios a `GOVERNANCE.md`
- Aceptación/rechazo de financiamiento de >$10K USD
- Fusión, discontinuación o transferencia del proyecto

Mecanismo: issue público con la propuesta, discusión abierta por mínimo 14 días, voto del Steering Committee al cierre. Mayoría simple aprueba.

### Decisiones sobre datos

Los datos que genera la comunidad (focos, reportes, verificaciones) se publican bajo **Creative Commons BY 4.0**. Este compromiso no es negociable. Si alguna vez necesita revisarse, requiere consenso del Steering Committee más consulta pública de 30 días.

## Sucesión

### Si un mantenedor se retira

- Aviso con 30 días de anticipación cuando sea posible
- Transferir responsabilidades activas a otro mantenedor
- Revocar accesos (GitHub, Supabase, Vercel, Open Collective) al salir
- El retiro no implica perder voz como contribuidor

### Si el fundador se retira

Igni debe sobrevivir a la salida de Gonza. Mecanismos:

1. **Mínimo 2 mantenedores con acceso completo** desde release v0.2.0
2. **Open Collective** controla las finanzas, no una cuenta personal
3. **Datos en CC BY 4.0** — no dependen del código
4. **Deploy reproducible** documentado en `DEPLOYMENT.md`
5. **Código en AGPL-3.0** — cualquiera puede forkear y continuar

Si el Steering Committee queda sin quórum, el mantenedor más activo en los últimos 3 meses puede llamar a elección de nuevos miembros por votación abierta de contribuidores activos (aquellos con al menos 1 PR mergeado en los últimos 12 meses).

### Si el proyecto se discontinúa

En caso de que el Steering Committee decida formalmente discontinuar Igni:

1. Anuncio público con 60 días de anticipación
2. Documentación de migración para instancias activas
3. Transferencia del repo a una organización OSS custodia (OSGeo, Software Freedom Conservancy, o similar) si aceptan
4. Datos públicos se archivan en Internet Archive y Zenodo
5. Dominios y cuentas se transfieren o liberan

## Financiamiento

Todo financiamiento se recibe vía Open Collective para garantizar transparencia.

Fuentes aceptadas:
- Grants de fundaciones de interés público (NLnet, Sovereign Tech Fund, MOSS, Sloan, etc.)
- Convenios con municipios, provincias, defensa civil, organismos públicos
- Donaciones individuales
- Patrocinios corporativos sin contrapartida comercial

Fuentes **no** aceptadas:
- Dinero que comprometa la neutralidad del proyecto
- Financiamiento condicionado a cerrar código o privatizar datos
- Capital de riesgo (VC) — el proyecto no es una startup

Los ingresos >$10K USD requieren aprobación del Steering Committee antes de aceptarse.

## Conflictos de interés

Cualquier miembro del Steering Committee o mantenedor que tenga interés financiero o personal en una decisión específica debe declararlo y abstenerse de votar en esa decisión.

## Modificaciones a este documento

Modificaciones requieren:
1. PR con los cambios propuestos
2. Discusión pública por mínimo 14 días
3. Aprobación del Steering Committee por mayoría simple

## Contacto

- **Consultas de gobernanza:** governance@skywalking.dev (cuando se active)
- **Código de Conducta:** conduct@skywalking.dev
- **Mantenedores actuales:** ver `MAINTAINERS.md` (próximamente) o commits recientes

---

*Última actualización: 2026-04-23 · Versión 0.1*
