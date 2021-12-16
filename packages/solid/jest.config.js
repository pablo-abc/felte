module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  collectCoverageFrom: ['./src/**'],
  moduleNameMapper: {
    'solid-js/store': '<rootDir>/node_modules/solid-js/store/dist/store.cjs',
    'solid-js': '<rootDir>/node_modules/solid-js/dist/solid.cjs',
  },
};
