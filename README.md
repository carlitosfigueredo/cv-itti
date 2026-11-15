# itti talentos (cv-itti)

Directorio de talento y CV para profesionales de ITTI y Grupo Vazquez. Stack: React, Vite, TypeScript, Material UI v6, React Router, Firebase.

Especificacion en `.kiro/specs/talent-platform/` (requirements, design, tasks). Documentacion en `docs/`.

## Requisitos

- Node >= 22.12 (probado con la LTS 26). Con nvm: `nvm install --lts`.
- Firebase CLI: viene como dependencia de desarrollo (`npx firebase ...`).

## Ambientes

| Ambiente | Proyecto Firebase | Archivo de entorno | Comandos |
|----------|-------------------|--------------------|----------|
| dev | `cv-itti-dev` | `.env.dev.local` | `npm run dev`, `npm run build:dev` |
| prod | `cv-itti` | `.env.prod.local` | `npm run build`, `npm run preview` |

Los archivos `.env.*.local` no se commitean. Usar `.env.example` como plantilla y ver `docs/firebase-setup.md`.

## Scripts

- `npm run dev`: servidor local (modo dev).
- `npm run lint`, `npm run typecheck` (incluye `functions/`), `npm test`: validaciones.
- `npm run test:rules`: pruebas de reglas de Firestore con el emulador (requiere Java).
- `npm run test:functions`: pruebas de las Cloud Functions contra emuladores.
- `npm run test:e2e`: pruebas de punta a punta y responsive con Playwright (carga datos ficticios en el emulador). La primera vez: `npx playwright install chromium`.
- `npm run build`: build de produccion. `npm run build:dev`: build apuntando a dev.

## Estructura

`src/` con components, pages, services, hooks, context, firebase, schemas, types, routes, utils y theme. La logica de Firebase va en `services/` y `firebase/`, nunca en componentes visuales.

## Estado

Fases 0 a 7 completas (base, Firebase, login, perfil, CV, publicación y directorio). Siguiente: Fase 8 (administración y moderación). Ver `.kiro/specs/talent-platform/tasks.md`, `docs/search.md` y `docs/change-tracker.md`.

## Contribuir

Ver [CONTRIBUTING.md](CONTRIBUTING.md). Para reportar vulnerabilidades, [SECURITY.md](SECURITY.md).

