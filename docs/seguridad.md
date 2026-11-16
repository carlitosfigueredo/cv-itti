# Seguridad

Resumen de las capas de protección y de cómo operarlas. El detalle de reglas está en `firestore.rules` y `storage.rules`, con sus pruebas en `tests/rules/`.

## Capas

| Capa | Qué protege | Dónde |
|------|-------------|-------|
| Reglas de Firestore | Quién lee y escribe cada documento; validación campo por campo; consentimientos; nadie modifica datos ajenos ni su propio rol o estado. | `firestore.rules` |
| Reglas de Storage | CV solo del dueño, PDF de hasta 5 MB, lectura pública solo con perfil publicado. | `storage.rules` |
| Cloud Functions | Moderación y borrado de cuenta con verificación del rol `admin` en el servidor y auditoría. | `functions/src/` |
| Validación de PDF | Firma `%PDF-` en el navegador y en la función `validateCvUpload` (borra lo que no sea PDF). | `src/utils/cvFile.ts`, `functions/src/cv.ts` |
| App Check | Las llamadas a Firestore, Storage y Functions llevan un token que prueba que vienen de esta app (reCAPTCHA Enterprise). | `src/firebase/config.ts` |
| Content Security Policy | El navegador solo carga scripts, estilos, iframes y conexiones de orígenes permitidos. | `firebase.json` |
| Headers de Hosting | HSTS, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`. | `firebase.json` |
| CI | Lint, tipos, pruebas, reglas y funciones en cada pull request; GitGuardian detecta secretos. | `.github/workflows/ci.yml` |

## App Check

- Proveedor: **reCAPTCHA Enterprise** (sin desafío visible). Una clave por proyecto ("itti talentos web"), con estos dominios:
  - `cv-itti-dev`: `localhost`, `127.0.0.1`, `cv-itti-dev.web.app`, `cv-itti-dev.firebaseapp.com`
  - `cv-itti`: `cv-itti.web.app`, `cv-itti.firebaseapp.com`
- La clave de sitio es pública y va en `VITE_APPCHECK_SITE_KEY` (archivos `.env.*.local` y variables de los entornos de GitHub).
- Los tokens duran **1 día** y el navegador los reutiliza: una persona que vuelve el mismo día no genera otra evaluación.
- Con los emuladores App Check no se activa.
- Si se usa un dominio propio, agregarlo a la clave: `gcloud recaptcha keys update <clave> --web --domains=... --project=<proyecto>`.

### Costo

reCAPTCHA Enterprise es gratis hasta 10.000 evaluaciones por mes (por organización). Entre 10.001 y 100.000 cuesta USD 8 fijos por mes, lo que supera la alerta de presupuesto de USD 5. Revisar el uso en Google Cloud → Security → reCAPTCHA.

### Estado: modo monitoreo (no se exige)

Hoy App Check **no se exige**: las solicitudes sin token siguen funcionando. Google recomienda medir antes de exigir, para no bloquear a personas reales.

Para exigirlo, primero revisar en Firebase console → App Check → APIs que casi todas las solicitudes figuren como **verificadas**. Después:

```bash
P=cv-itti-dev   # o cv-itti
N=$(gcloud projects describe $P --format='value(projectNumber)')
TOKEN=$(gcloud auth print-access-token)
for S in firestore.googleapis.com firebasestorage.googleapis.com; do
  curl -s -X PATCH -H "Authorization: Bearer $TOKEN" -H "x-goog-user-project: $P" -H "Content-Type: application/json" \
    "https://firebaseappcheck.googleapis.com/v1/projects/$N/services/$S?updateMask=enforcementMode" \
    -d '{"enforcementMode":"ENFORCED"}'
done
```

Y para las Cloud Functions: poner `ENFORCE_APP_CHECK=true` en `functions/.env.<proyecto>` y desplegarlas. Para volver atrás, usar `"UNENFORCED"` y `false`.

## Content Security Policy

Orígenes permitidos (además del propio sitio):

| Directiva | Permite | Motivo |
|-----------|---------|--------|
| `script-src` | `apis.google.com`, `www.google.com/recaptcha/`, `www.gstatic.com/recaptcha/` | Login con Google y reCAPTCHA |
| `style-src` | `'unsafe-inline'` | Material UI (Emotion) inserta estilos en línea |
| `connect-src` | `*.googleapis.com`, `*.cloudfunctions.net`, `*.run.app`, `www.google.com/recaptcha/` | Firestore, Storage, Auth, App Check y Functions |
| `frame-src` | `*.firebaseapp.com`, `accounts.google.com`, reCAPTCHA | Popup e iframe del login, reCAPTCHA |
| `img-src` / `font-src` | `data:`, `blob:`, `www.gstatic.com` | Íconos y recursos de reCAPTCHA; las fuentes están en el propio sitio |

`object-src 'none'`, `frame-ancestors 'none'` (no se puede embeber el sitio), `base-uri` y `form-action` restringidos al propio sitio. No se permite `eval`: por eso Zod corre en modo `jitless` (`src/utils/zodConfig.ts`).

### Probar la CSP en local

`npm run build:dev && npx vite preview --mode dev` sirve el build con los mismos headers que Hosting (leídos de `firebase.json`). Abrir la consola del navegador y revisar que no haya mensajes "Content Security Policy". Si una funcionalidad nueva necesita otro origen, agregarlo en `firebase.json` y documentarlo acá.

## Dependencias

- `npm audit --omit=dev`: **0 vulnerabilidades** en lo que llega al navegador y en `functions/`.
- `@grpc/grpc-js` se fuerza a 1.14.x (`overrides` en `package.json`): Firestore fija una versión vieja con alertas de servidor, y solo se usa en Node (pruebas).
- Quedan alertas **moderadas** en herramientas de desarrollo (`firebase-tools`, `typescript-eslint`: glob, minimatch, uuid). No llegan al sitio; se aceptan y se revisan al actualizar esas herramientas.
- Revisar con `npm audit` al actualizar dependencias.

## Datos personales en logs

El frontend y las funciones registran solo el nombre o el código del error, nunca contenido de perfiles, emails ni CV.

## Reportar vulnerabilidades

Ver [.github/SECURITY.md](../.github/SECURITY.md).
