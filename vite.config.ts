import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Static build only. Output goes to /dist, which Vercel serves as plain files.
export default defineConfig({
  plugins: [react()],
})
