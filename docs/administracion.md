# Administración y moderación

## Cómo funciona el rol de administrador

- El rol es un *custom claim* de Firebase Authentication (`admin: true`) dentro del token de la persona.
- Solo se otorga desde código de confianza con Firebase Admin SDK (el script de abajo). Nunca desde el navegador ni desde un documento de Firestore editable.
- Las reglas de Firestore y Storage y las Cloud Functions verifican el claim en el servidor. Ocultar botones en la interfaz es solo comodidad.
- Un claim con otro valor (`"true"` como texto, `false`) no da acceso; está probado en `tests/rules/admin.rules.test.ts`.

## Otorgar o quitar el rol

La persona tiene que haber iniciado sesión al menos una vez en ese ambiente. Desde `functions/`:

```bash
# Usando la sesion de gcloud (gcloud auth login)
node scripts/set-admin.cjs --project cv-itti-dev --email persona@gmail.com --grant  --confirm cv-itti-dev --gcloud
node scripts/set-admin.cjs --project cv-itti-dev --email persona@gmail.com --revoke --confirm cv-itti-dev --gcloud
```

- `--confirm` debe repetir el id del proyecto: evita ejecutarlo contra producción por error.
- Sin `--gcloud`, usa las credenciales de aplicación por defecto (`gcloud auth application-default login`).
- Al otorgar, la persona debe cerrar sesión y volver a entrar para que su token incluya el claim.
- Al quitar, se revocan sus sesiones para que el permiso se pierda de inmediato.
- Cada cambio queda registrado en `adminAudit` (acción `grant_admin` / `revoke_admin`, autor `cli`).

## Panel `/admin`

| Pestaña | Qué muestra |
|---------|-------------|
| Estadísticas | Usuarios, perfiles creados y publicados, perfiles con CV, reportes abiertos, cuentas suspendidas y respuestas sobre Grupo Vázquez (Sí / No / sin responder). Usa consultas de conteo (`getCountFromServer`), no lee todos los documentos. |
| Usuarios | Lista paginada (25) con filtro por respuesta sobre Grupo Vázquez y estado de la cuenta. Acciones por persona. |
| Reportes | Reportes abiertos y cerrados, con acciones para resolverlos. |
| Auditoría | Últimas 50 acciones de administración. |

## Acciones de moderación

Todas pasan por Cloud Functions (`functions/src/index.ts`), piden un motivo que queda en la auditoría y no se pueden aplicar sobre la propia cuenta ni sobre otra persona administradora.

| Acción | Función | Efecto |
|--------|---------|--------|
| Despublicar perfil | `moderateAccount` (`unpublish`) | `isPublic = false`. El perfil y el CV dejan de ser públicos. La persona puede volver a publicarlo. |
| Eliminar CV | `moderateAccount` (`removeCv`) | Borra `cvs/{uid}/cv.pdf` y sus metadatos. |
| Suspender cuenta | `moderateAccount` (`suspend`) | `accountStatus = suspended`, perfil despublicado, inicio de sesión deshabilitado y sesiones revocadas. |
| Reactivar cuenta | `moderateAccount` (`unsuspend`) | Habilita el inicio de sesión. El perfil queda privado hasta que la persona lo publique. |
| Resolver / descartar reporte | `resolveReportCall` | Cierra el reporte y registra quién lo hizo. |
| Eliminar cuenta | `deleteAccount` | Borra CV, perfil, documento privado y usuario de Authentication. Es repetible si falla a mitad de camino. Exige un inicio de sesión de hace menos de 5 minutos. |

## Índices

Las listas del panel (reportes por estado, usuarios por filtros) necesitan índices compuestos definidos en `firestore.indexes.json`. Verificarlos con `npm run check:indexes -- <proyecto>`.

## Auditoría y retención

- Colección `adminAudit`: la escriben solo las funciones y el script; las personas administradoras solo la leen.
- Guarda identificadores, acción, motivo y fecha. Nunca el contenido de perfiles ni de CV.
- Se conserva al menos 1 año (decisión del proyecto). Todavía no hay un proceso automático de depuración: si se define un plazo máximo, agregar una tarea programada.

## Desplegar las funciones

Requiere plan Blaze. Las funciones usan Node 22 y la región `us-central1`.

```bash
npx firebase deploy --only functions --project dev
```

La primera vez Firebase habilita las APIs necesarias y puede tardar varios minutos. Sin este despliegue, las acciones del panel `/admin` fallan.

## Eliminar la propia cuenta

En "Mi panel" hay una tarjeta **Eliminar mi cuenta**. Pide escribir `ELIMINAR`, vuelve a confirmar la identidad con Google (la función exige un inicio de sesión de menos de 5 minutos) y llama a `deleteAccount` sin `targetUid`. Una cuenta administradora no puede borrarse así: primero hay que quitarle el rol.
