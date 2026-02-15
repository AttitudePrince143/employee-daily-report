import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  optimizeDeps: {
    include: ["jspdf", "jspdf-autotable"],},
  plugins: [react() , tailwindcss()],
  server: { port: 5173 }
})
