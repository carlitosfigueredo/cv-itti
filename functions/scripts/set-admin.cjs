#!/usr/bin/env node
// Otorga o revoca el rol de administrador (custom claim "admin") a una cuenta.
//
// Se ejecuta desde una maquina de confianza con credenciales de Google Cloud
// (gcloud auth application-default login). NUNCA desde el navegador y sin llaves
// de servicio en el repositorio.
//
// Uso:
//   node scripts/set-admin.cjs --project cv-itti-dev --email persona@gmail.com --grant  --confirm cv-itti-dev
//   node scripts/set-admin.cjs --project cv-itti-dev --email persona@gmail.com --revoke --confirm cv-itti-dev
//
// --confirm debe repetir el id del proyecto: evita ejecutarlo contra produccion por error.
// --gcloud usa la sesion activa de gcloud (gcloud auth login) en vez de las credenciales
// de aplicacion por defecto (gcloud auth application-default login).

const { execFileSync } = require('node:child_process')
const { initializeApp } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { FieldValue, getFirestore } = require('firebase-admin/firestore')

function parseArgs(argv) {
  const args = { grant: false, revoke: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--grant') args.grant = true
    else if (a === '--revoke') args.revoke = true
    else if (a === '--project') args.project = argv[++i]
    else if (a === '--email') args.email = argv[++i]
    else if (a === '--confirm') args.confirm = argv[++i]
    else if (a === '--gcloud') args.gcloud = true
    else throw new Error(`Argumento desconocido: ${a}`)
  }
  return args
}

function gcloudToken() {
  return execFileSync('gcloud', ['auth', 'print-access-token']).toString().trim()
}

// Registra el cambio en adminAudit. Con --gcloud se usa la API REST de Firestore,
// porque el cliente gRPC del SDK no acepta credenciales de usuario de gcloud.
async function writeAudit(args, action, targetUid) {
  if (!args.gcloud) {
    await getFirestore().collection('adminAudit').add({
      actorUid: 'cli',
      action,
      targetUid,
      createdAt: FieldValue.serverTimestamp(),
    })
    return
  }
  const url = `https://firestore.googleapis.com/v1/projects/${args.project}/databases/(default)/documents/adminAudit`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${gcloudToken()}`,
      'x-goog-user-project': args.project,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        actorUid: { stringValue: 'cli' },
        action: { stringValue: action },
        targetUid: { stringValue: targetUid },
        createdAt: { timestampValue: new Date().toISOString() },
      },
    }),
  })
  if (!response.ok) throw new Error(`No se pudo registrar la auditoria (HTTP ${response.status})`)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.project || !args.email || args.grant === args.revoke) {
    console.error('Uso: --project <id> --email <correo> (--grant | --revoke) --confirm <id> [--gcloud]')
    process.exit(2)
  }
  if (args.confirm !== args.project) {
    console.error(`Falta confirmar: agrega --confirm ${args.project} para continuar.`)
    process.exit(2)
  }

  if (args.gcloud) {
    // Con credenciales de usuario, las APIs de Google exigen un proyecto de cuota.
    process.env.GOOGLE_CLOUD_QUOTA_PROJECT = args.project
    const credential = {
      getAccessToken: async () => ({
        access_token: gcloudToken(),
        expires_in: 3000,
      }),
    }
    initializeApp({ projectId: args.project, credential })
  } else {
    initializeApp({ projectId: args.project })
  }
  const auth = getAuth()

  let user
  try {
    user = await auth.getUserByEmail(args.email)
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`No existe una cuenta con ese correo en ${args.project}. La persona debe iniciar sesion al menos una vez en la app.`)
      process.exit(1)
    }
    throw error
  }

  const claims = { ...(user.customClaims || {}) }
  if (args.grant) claims.admin = true
  else delete claims.admin
  await auth.setCustomUserClaims(user.uid, claims)

  // Al revocar se fuerza un nuevo inicio de sesion para que el permiso se pierda ya.
  if (args.revoke) await auth.revokeRefreshTokens(user.uid)

  await writeAudit(args, args.grant ? 'grant_admin' : 'revoke_admin', user.uid)

  console.log(
    args.grant
      ? `Listo: ${args.email} ahora es administrador en ${args.project}. Debe cerrar sesion y volver a entrar para que se aplique.`
      : `Listo: ${args.email} dejo de ser administrador en ${args.project}.`,
  )
}

main().catch((error) => {
  console.error('Error:', error.code || error.message)
  process.exit(1)
})
