import { defineConfig } from 'vitest/config'

// Pruebas de integracion de las Cloud Functions contra emuladores.
// Ejecutar con: npm run test:functions
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['functions/test/**/*.int.test.ts'],
    fileParallelism: false,
    testTimeout: 30000,
  },
})
