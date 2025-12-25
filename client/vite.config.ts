import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  envDir: '../', // Look for .env in root if needed, though usually vite load .env from its root.
  // Actually, standard behavior is fine. We just rely on VITE_ variables.
})
