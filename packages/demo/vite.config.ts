import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@pixel-office/renderer': resolve(__dirname, '../renderer/src'),
      '@pixel-office/shared': resolve(__dirname, '../shared/src'),
      '@pixel-office/core': resolve(__dirname, '../core/src'),
      '@pixel-office/agents': resolve(__dirname, '../agents/src'),
    },
  },
  server: {
    port: 3000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'pixi.js', 'zustand'],
  },
})
