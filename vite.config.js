import { defineConfig, createLogger } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

const logger = createLogger()
const originalError = logger.error

// Filter out noisy ECONNREFUSED proxy errors when Python backend is offline
logger.error = (msg, options) => {
  if (
    typeof msg === 'string' &&
    (msg.includes('http proxy error') ||
     msg.includes('ECONNREFUSED') ||
     msg.includes('AggregateError') ||
     msg.includes('afterConnectMultiple'))
  ) {
    return
  }
  originalError(msg, options)
}

// https://vitejs.dev/config/
export default defineConfig({
  root: 'frontend',
  customLogger: logger,
  plugins: [react()],
  envDir: resolve(__dirname, '.'),
  publicDir: resolve(__dirname, 'assets'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            if (res && res.writeHead && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' })
              res.end(
                JSON.stringify({
                  status: 'offline',
                  message: 'Backend server is offline. Run start_dev.bat to start both backend and frontend.',
                  error: err.code || 'ECONNREFUSED',
                })
              )
            }
          })
        },
      },
    },
  },
})
