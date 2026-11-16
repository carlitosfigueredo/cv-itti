import { defineConfig, devices } from '@playwright/test'

// Pruebas de punta a punta contra la app en modo emuladores (datos ficticios).
// Ejecutar con: npm run test:e2e (levanta los emuladores, carga datos y corre las pruebas).
export default defineConfig({
  testDir: 'e2e',
  outputDir: 'e2e/.results',
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:5174',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npx vite --mode emulators --port 5174 --strictPort --host 127.0.0.1',
    url: 'http://127.0.0.1:5174',
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
