import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import scholarships from './src/data/scholarships.json'
import universities from './src/data/universities.json'

/**
 * Publishes the scholarship and university data as plain files:
 *   https://myrehbar.org/data/scholarships.json
 *   https://myrehbar.org/data/universities.json
 * The Google Sheet's "MyRehbar → Update scholarships & universities" menu reads these.
 * It is the same public data the website already shows.
 */
function publishData(): Plugin {
  return {
    name: 'myrehbar-publish-data',
    generateBundle() {
      const files = { 'data/scholarships.json': scholarships, 'data/universities.json': universities }
      for (const [fileName, data] of Object.entries(files)) {
        this.emitFile({ type: 'asset', fileName, source: JSON.stringify(data) })
      }
    },
  }
}

// Static build only. Output goes to /dist, which Vercel serves as plain files.
export default defineConfig({
  plugins: [react(), publishData()],
})
