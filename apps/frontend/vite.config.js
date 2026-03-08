import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@mui')) return 'vendor-mui';
            if (id.includes('monaco-editor')) return 'vendor-monaco';
            if (id.includes('@codemirror') || id.includes('@uiw')) return 'vendor-codemirror';
            if (id.includes('reactflow')) return 'vendor-reactflow';
            if (id.includes('recharts') || id.includes('chart.js') || id.includes('react-chartjs-2')) return 'vendor-charts';
            if (id.includes('react-syntax-highlighter') || id.includes('highlight.js')) return 'vendor-highlight';
            if (id.includes('moment')) return 'vendor-moment';
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('@jsonforms')) return 'vendor-jsonforms';

            // Core React/Routing
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('react-router')) return 'vendor-react';

            // Catch-all for other dependencies
            return 'vendor';
          }
        }
      }
    }
  }
})
