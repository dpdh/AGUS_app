import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/firebase')) {
            return 'vendor-firebase'
          }
          if (id.includes('node_modules/three')) {
            return 'vendor-three'
          }
          if (id.includes('node_modules/recharts')) {
            return 'vendor-recharts'
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-lucide'
          }
          if (id.includes('node_modules/@capacitor')) {
            return 'vendor-capacitor'
          }
        },
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react', 'recharts', 'three'],
  },
})