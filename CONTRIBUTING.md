# Contribuir a Igni

Gracias por considerar contribuir a Igni. Este proyecto es un bien común digital: cada mejora vuelve a la comunidad.

## Formas de contribuir

No solo código. También suma:

- **Reportar bugs** — abrir un issue describiendo qué esperabas, qué pasó, y cómo reproducirlo
- **Proponer features** — abrir un issue con la etiqueta `feature` explicando el caso de uso concreto
- **Mejorar documentación** — correcciones, traducciones, ejemplos
- **Testing con brigadas reales** — feedback de uso operacional vale más que cualquier PR
- **Código** — PRs con bugfixes, features aprobados, refactors

## Antes de empezar

1. Revisa los issues abiertos. Si tu idea ya existe, suma un comentario ahí en vez de abrir otro.
2. Para features nuevos, abre un issue primero y espera feedback. No queremos que inviertas tiempo en algo que no encaja con la dirección del proyecto.
3. Lee `GOVERNANCE.md` para entender cómo se toman decisiones.
4. Revisa `CODE_OF_CONDUCT.md`.

## Flujo de trabajo

```bash
# 1. Fork del repo a tu cuenta de GitHub
# 2. Clonar tu fork
git clone https://github.com/TU_USUARIO/igni.git
cd igni

# 3. Instalar dependencias
pnpm install

# 4. Crear una rama descriptiva
git checkout -b feat/nombre-del-feature
# o
git checkout -b fix/descripcion-del-bug

# 5. Hacer cambios, commits pequeños y claros
# 6. Asegurar que pasa el linter y build
pnpm biome:check
pnpm build

# 7. Push a tu fork
git push origin feat/nombre-del-feature

# 8. Abrir Pull Request al repo principal
```

## Convenciones de código

- **Lenguaje:** TypeScript estricto. Evitar `any`.
- **Componentes:** React con hooks. Client components marcados con `'use client'` al inicio.
- **Estilos:** Tailwind CSS + shadcn/ui. No CSS custom salvo casos puntuales.
- **Data fetching:** React Query para client, Server Components para server.
- **Test IDs:** elementos interactivos llevan `data-testid` descriptivo (ver `docs/TEST_ID_CONTRACT.md` si existe en el repo).
- **Formateo:** Biome se encarga. Correr `pnpm biome:fix` antes de commit.

## Commits

Mensajes cortos, imperativos, en inglés o español neutro (sin voseo):

```
feat: add CAP output endpoint
fix: corregir calculo de radio en recursos
docs: actualizar DEPLOYMENT.md con pasos de Supabase
refactor: extraer logica de verificacion a hook propio
```

Un commit por unidad logica. Si hiciste varias cosas, `git add -p` y divide en commits separados.

## Pull Requests

Un PR incluye:

1. **Título claro** — describe el cambio, no la implementación
2. **Descripción** — qué cambia, por qué, y cómo probarlo
3. **Screenshots o GIFs** si tocas UI
4. **Checklist:**
   - [ ] El codigo pasa `pnpm biome:check`
   - [ ] El codigo pasa `pnpm build`
   - [ ] He probado el cambio localmente
   - [ ] He actualizado documentacion relevante
   - [ ] He agregado/actualizado tests si aplica

Los mantenedores responden en máximo 7 días. Si pasa más tiempo, mandá un recordatorio en el PR.

## Licencia de las contribuciones

Al contribuir código a Igni, aceptás que tu contribución se distribuye bajo la misma licencia del proyecto: **AGPL-3.0-or-later**.

No se requiere firmar un CLA (Contributor License Agreement). El acto de mandar un PR implica aceptación de la licencia.

## Datos generados por usuarios

Los datos que generan usuarios de Igni (focos reportados, verificaciones, recursos mapeados) se publican bajo **Creative Commons BY 4.0**. Esto es parte del contrato con la comunidad: los datos no dependen del código.

## Primeros pasos recomendados para nuevos contribuidores

Si es tu primer aporte, mirá issues con la etiqueta `good-first-issue`. Si no hay, podés empezar por:

- Mejorar un mensaje de error poco claro
- Traducir strings al inglés/portugués
- Agregar un ejemplo en `DEPLOYMENT.md`
- Mejorar un componente de UI que te parezca inconsistente

## Contacto

- **Issues de código y features:** GitHub issues del repo
- **Conducta:** conduct@skywalking.dev
- **Preguntas abiertas:** GitHub Discussions (cuando se habiliten)

Gracias por aportar al proyecto.
