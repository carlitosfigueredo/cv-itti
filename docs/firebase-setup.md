# Conexion con Firebase

Estos pasos crean el proyecto y lo conectan al repo. No se guardan credenciales en el repo.

## 1. Iniciar sesion en la CLI

```bash
firebase login --reauth
firebase projects:list
```

Usar la cuenta de Google que sera duena del proyecto.

## 2. Crear el proyecto

Opcion A (consola): https://console.firebase.google.com -> Add project.
Opcion B (CLI): `firebase projects:create <project-id> --display-name "Talent Platform"`

Recomendacion: un proyecto para desarrollo/staging y otro para produccion.

## 3. Plan Blaze (necesario para Cloud Functions)

Consola -> Usage and billing -> Modify plan -> Blaze. Luego crear un budget alert en Google Cloud Billing (las alertas no detienen el gasto).

## 4. Habilitar servicios

- Authentication -> Sign-in method -> Google.
- Firestore Database -> region `us-central1` (la region no se puede cambiar despues).
- Storage -> bucket en `US-CENTRAL1` (elegida por costo; esa region puede usar el nivel Always Free segun la documentacion de Firebase).
- Hosting.
- App Check -> registrar la web app con reCAPTCHA (se enforza en la fase de hardening).

## 5. Registrar la web app y completar `.env`

Consola -> Project settings -> Your apps -> Web. Copiar los valores a `.env.local` (no se commitea) usando `.env.example` como plantilla. Esos valores no son secretos de Admin SDK, pero la seguridad depende de las reglas y App Check.

## 6. Vincular el repo

```bash
firebase use --add
```

Esto crea `.firebaserc` con el alias. La config de emuladores se agrega en la Fase 2.

## Ambientes (dev y prod)

| Ambiente | Proyecto Firebase | Alias | Archivo de entorno | Modo Vite |
|----------|-------------------|-------|--------------------|-----------|
| Desarrollo | `cv-itti-dev` | `dev` (default) | `.env.dev.local` | `dev` |
| Produccion | `cv-itti` | `prod` | `.env.prod.local` | `prod` |

- Cambiar de ambiente: `firebase use dev` o `firebase use prod`.
- Desplegar siempre con el proyecto explicito: `firebase deploy --project dev`.
- Cada proyecto necesita activar a mano el proveedor Google en Authentication y, mas adelante, registrar App Check.
- Cada proyecto tiene su propio presupuesto de USD 5.

## Emuladores locales

Requieren Java (probado con 24). Usan el proyecto ficticio `demo-cv-itti`, por lo que nunca tocan datos reales.

```bash
npm run emulators   # Auth 9099, Firestore 8080, Storage 9199, Hosting 5000, UI 4000
npm run dev:emu     # app apuntando a los emuladores (usa .env.emulators)
```

La primera ejecucion descarga los JAR de los emuladores. Las reglas de `firestore.rules` y `storage.rules` estan cerradas (deny all) hasta que se implementen las reglas reales en las fases 4 a 9. Los headers de seguridad estan en `firebase.json`; el CSP se agrega en la Fase 9 una vez conocidos los dominios que usa el login con Google.

## Validacion de configuracion

Si falta alguna variable `VITE_FIREBASE_*`, la app muestra una pantalla con la lista de variables faltantes en vez de arrancar.

## CV: Storage, CORS y Cloud Function

### Descarga desde el navegador (CORS)

La descarga usa el SDK (`getBlob`), no URLs con token, por lo que el bucket necesita CORS.

```bash
gcloud storage buckets update gs://cv-itti-dev.firebasestorage.app --cors-file=storage.cors.dev.json
gcloud storage buckets update gs://cv-itti.firebasestorage.app --cors-file=storage.cors.prod.json
```

Si se usa un dominio propio en produccion, agregarlo a `storage.cors.prod.json` antes de aplicarlo.

### Desplegar reglas de Storage

```bash
firebase deploy --only storage --project dev
```

La primera vez, la CLI pide otorgar al servicio de Storage el rol de lectura de Firestore (las reglas consultan `publicProfiles` y `users`). Aceptarlo.

### Validacion de contenido del PDF (Cloud Function `validate### Validacion de contenido del PDF (Cloud Function `validate### Validacion de contenido del PDF (Cloud Function `validate### Validacion de contenido del PDF (Cloud Function `validate### Validacamano no cumplen), borra el archivo y quita los metadatos del perfil.

```bash
firebase deploy --only functions --project dev
```

Requiere plan Blaze y Node 22 (runtime de la funcion). Region `us-central1`, igual que el bucket. La primera vez Firebase habilita las APIs necesarias (puede tardar unos minutos).

Limitacion conocida: si la funcion rechaza un archivo antes de que el cliente registre los metadatos, podria quedar un `cvPath` sin archivo. La descarga fallaria con un error claro y el usuario puede volver a subir el CV.
