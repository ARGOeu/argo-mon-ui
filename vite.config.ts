import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'serve-local-domains',
      configureServer(server) {
        server.middlewares.use('/domains.json', (_, res) => {
          const filePath = path.resolve(__dirname, 'localenv/domains.json')
          res.setHeader('Content-Type', 'application/json')
          res.end(fs.readFileSync(filePath, 'utf-8'))
        })
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '127.0.0.1',
    allowedHosts: [
      'status.test',
      'argo-mon.test',
      'tenant-b.test',
      'tenant-test.test',
    ],
  },
})
