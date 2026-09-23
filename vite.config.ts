import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // deploy-target crutch, same as the router swap -- GitHub Pages serves this
  // project off /the-key-theater-site/, not the domain root, so that stays the
  // default. Any host that serves from the domain root (the Railway preview
  // today, Beget later) sets VITE_BASE=/ at build time instead of this file
  // being edited back and forth.
  base: process.env.VITE_BASE ?? '/the-key-theater-site/',
  plugins: [react(), tailwindcss()],
})
