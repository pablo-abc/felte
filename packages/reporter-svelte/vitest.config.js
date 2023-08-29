import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte({ hot: false })],
  test: {
    environment: 'jsdom',
    alias: {
      felte: path.resolve(__dirname, './node_modules/felte/dist/esm/index.js'),
      'svelte/internal': path.resolve(
        __dirname,
        './node_modules/svelte/internal/index.js'
      ),
      'svelte/store': path.resolve(
        __dirname,
        './node_modules/svelte/store/index.js'
      ),
      svelte: path.resolve(__dirname, './node_modules/svelte/index.js'),
    },
  },
});
