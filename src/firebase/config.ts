import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check'
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore/lite'
import { connectFunctionsEmulator, getFunctions, type Functions } from 'firebase/functions'
import { connectStorageEmulator, getStorage, type FirebaseStorage } from 'firebase/storage'
import type { FirebaseEnv } from './env'

export interface FirebaseServices {
  app: FirebaseApp
  auth: Auth
  db: Firestore
  storage: FirebaseStorage
  functions: Functions
}

let services: FirebaseServices | null = null

// Puertos alineados con firebase.json (seccion emulators).
const EMULATOR_HOST = '127.0.0.1'

export function initFirebase(env: FirebaseEnv): FirebaseServices {
  if (services) return services

  const app = getApps().length
    ? getApp()
    : initializeApp({
        apiKey: env.apiKey,
        authDomain: env.authDomain,
        projectId: env.projectId,
        storageBucket: env.storageBucket,
        messagingSenderId: env.messagingSenderId,
        appId: env.appId,
      })

  // App Check va antes que cualquier otro servicio: asi todas las llamadas a Firestore,
  // Storage y Functions llevan el token que prueba que vienen de esta app.
  // No se usa con emuladores (no lo validan) ni si falta la clave.
  if (env.appCheckSiteKey && !env.useEmulators) {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(env.appCheckSiteKey),
      isTokenAutoRefreshEnabled: true,
    })
  }

  const auth = getAuth(app)
  const db = getFirestore(app)
  const storage = getStorage(app)
  // Misma region que las Cloud Functions desplegadas.
  const functions = getFunctions(app, 'us-central1')

  if (env.useEmulators) {
    connectAuthEmulator(auth, `http://${EMULATOR_HOST}:9099`, { disableWarnings: true })
    connectFirestoreEmulator(db, EMULATOR_HOST, 8080)
    connectStorageEmulator(storage, EMULATOR_HOST, 9199)
    connectFunctionsEmulator(functions, EMULATOR_HOST, 5001)
  }

  services = { app, auth, db, storage, functions }
  return services
}

export function getFirebase(): FirebaseServices {
  if (!services) {
    throw new Error('Firebase no esta inicializado. Llamar a initFirebase() al arrancar la app.')
  }
  return services
}
