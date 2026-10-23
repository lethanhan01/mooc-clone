import { createLogger, defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

const DEFAULT_API_PROXY_TARGET = 'http://localhost:5000'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.API_PROXY_TARGET || DEFAULT_API_PROXY_TARGET

  const customLogger = createLogger()
  const originalError = customLogger.error.bind(customLogger)
  customLogger.error = (msg, options) => {
    if (
      msg.includes('ws proxy socket error') &&
      (msg.includes('ECONNRESET') || msg.includes('ECONNABORTED') || msg.includes('EPIPE'))
    ) {
      return
    }
    originalError(msg, options)
  }

  return {
    customLogger,
    plugins: [
      tailwindcss(),
      react(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('error', (err, _req, res) => {
              const code = (err as { code?: string }).code
              if (code === 'ECONNRESET' || code === 'ECONNABORTED' || code === 'ECONNREFUSED') {
                if ('writeHead' in res && !res.headersSent) {
                  res.writeHead(502, { 'Content-Type': 'application/json' })
                  res.end(
                    JSON.stringify({
                      success: false,
                      code: 'BACKEND_UNAVAILABLE',
                      message: 'mooc-clone Backend service is restarting or temporarily unavailable',
                    })
                  )
                }
              }
            })
          },
        },
        '/socket.io': {
          target: proxyTarget,
          ws: true,
          changeOrigin: true,
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-query': ['@tanstack/react-query'],
            'vendor-charts': ['recharts'],
            'vendor-ui': ['lucide-react', 'clsx', 'tailwind-merge'],
            'vendor-emoji': ['emoji-picker-react'],
            'vendor-i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
            'vendor-socket': ['socket.io-client'],
          },
        },
      },
    },
  }
})
