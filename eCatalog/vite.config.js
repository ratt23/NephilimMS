import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    base: '/',  // Set base path for deployed version
    server: {
        port: 3003,
        proxy: {
            '/.netlify/functions': {
                target: 'http://localhost:8888',
                changeOrigin: true,
                secure: false
            }
        }
    }
})
