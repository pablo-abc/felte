import { defineConfig } from 'vitest/config';
import { createRequire } from 'node:module';
import preact from '@preact/preset-vite';

const require = createRequire(import.meta.url);

export default defineConfig({
  resolve: {
    alias: [
      {
        find: 'preact/hooks',
        replacement: require.resolve('preact/hooks'),
      },
      {
        find: '@testing-library/preact',
        replacement: require.resolve('@testing-library/preact'),
      },
    ],
  },
  plugins: [preact()],
  test: {
    transformMode: {
      web: [/\.[jt]sx$/],
    },
    environment: 'jsdom',
  },
});
