import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import envCompatible from 'vite-plugin-env-compatible';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), envCompatible()],
  esbuild: {
    logLevel: 'silent' // Suppresses warnings and errors
  },
  server: {
    port: 3000
  }
})
