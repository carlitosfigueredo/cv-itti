import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore'
import { connectStorageEmulator, getStorage, type FirebaseStorage } from 'firebase/storage'
import type { FirebaseEnv } from './env'

export interface FirebaseServices {
  app: FirebaseApp
  auth: Auth
  db: Firestore
  storage: FirebaseStorage
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

  const auth = getAuth(app)
  const db = getFirestore(app)
  const storage = getStorage(app)

  if (env.useEmulators) {
    connectAuthEmulator(auth, `http://${EMULATOR_HOST}:9099`, { disableWarnings: true })
    connectFirestoreEmulator(db, EMULATOR_HOST, 8080)
    connectStorageEmulator(storage, EMULATOR_HOST, 9199)
  }

  services = { app, auth, db, storage }
  return services
}

export function getFirebase(): FirebaseServices {
  if (!services) {
    throw new Error('Firebase no esta inicializado. Llamar a initFirebase() al arrancar la app.')
  }
  return services
}
