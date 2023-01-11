import { defineConfig } from 'vitest/config';
import solid from 'vite-plugin-solid';

export default defineConfig({
  test: {
    environment: 'jsdom',
    transformMode: {
      web: [/\.[jt]sx?$/],
    },
  },
  plugins: [solid()],
  resolve: {
    conditions: ['development', 'browser'],
  },
});
