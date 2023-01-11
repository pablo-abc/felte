import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
  resolve: {
    conditions: ['development', 'browser'],
  },
});
