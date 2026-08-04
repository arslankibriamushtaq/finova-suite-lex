import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import envCompatible from 'vite-plugin-env-compatible';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), envCompatible()],
  esbuild: {
    logLevel: 'silent' // Suppresses warnings and errors
  },
  build: {
    // `flag-icons` ships ~530 country SVGs, nearly all under the 4 KB inline
    // threshold. Inlining them as data: URIs added ~430 KB to the single
    // app-wide stylesheet — a cost every page pays so one field can show a
    // flag. Keep them as files so a flag is fetched only when it is displayed.
    assetsInlineLimit: (filePath) => (filePath.includes('flag-icons') ? false : undefined),
  },
  server: {
    port: 3000
  }
})
