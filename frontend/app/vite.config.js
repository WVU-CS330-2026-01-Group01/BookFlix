import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite serves the React app during development and builds the static frontend.
export default defineConfig({
  plugins: [react()],
})
