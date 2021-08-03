module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
  transform: {
    '^.+\\.svelte$': 'svelte-jester',
    '^.+\\.(js|ts)$': 'ts-jest',
  },
  moduleFileExtensions: ['js', 'ts', 'svelte'],
  collectCoverageFrom: ['./src/**'],
  preset: 'ts-jest',
};
