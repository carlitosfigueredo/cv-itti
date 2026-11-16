/// <reference types="vitest/config" />
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// "vite preview" sirve los mismos headers de seguridad que Firebase Hosting
// (leidos de firebase.json), para probar la CSP en local antes de desplegar.
// Se omite upgrade-insecure-requests: en http://localhost forzaria https.
function hostingHeaders(): Record<string, string> {
  const config = JSON.parse(readFileSync(new URL('./firebase.json', import.meta.url), 'utf8')) as {
    hosting: { headers: { source: string; headers: { key: string; value: string }[] }[] }
  }
  const all = config.hosting.headers.find((h) => h.source === '**')?.headers ?? []
  return Object.fromEntries(
    all
      .filter((h) => h.key !== 'Strict-Transport-Security')
      .map((h) => [
        h.key,
        h.key === 'Content-Security-Policy'
          ? h.value.split('; ').filter((d) => d !== 'upgrade-insecure-requests').join('; ')
          : h.value,
      ]),
  )
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  preview: {
    headers: hostingHeaders(),
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'functions/src/**/*.test.ts'],
  },
})
