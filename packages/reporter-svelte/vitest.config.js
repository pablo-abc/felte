import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), svelteTesting()],
  test: {
    environment: 'jsdom',
    alias: {
      felte: path.resolve(__dirname, './node_modules/felte/dist/esm'),
    },
  },
});
