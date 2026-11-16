import { defineConfig } from 'vitest/config'

// Pruebas de reglas de seguridad: requieren el emulador de Firestore.
// Ejecutar con: npm run test:rules
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/rules/**/*.rules.test.ts'],
    fileParallelism: false,
    testTimeout: 20000,
  },
})
