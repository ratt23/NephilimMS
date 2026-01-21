import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3005,
        proxy: {
            '/.netlify/functions/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/\.netlify\/functions\/api/, '')
            },
            '/.netlify/functions/imageProxy': {
                target: 'http://localhost:3000/imageProxy',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/\.netlify\/functions\/imageProxy/, '')
            }
        }
    }
})