import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // deploy-target crutch, same as the router swap -- GitHub Pages serves this
  // project off /the-key-theater-site/, not the domain root. Drop back to
  // '/' (or remove the option entirely) once the site has its own domain.
  base: '/the-key-theater-site/',
  plugins: [react(), tailwindcss()],
})
