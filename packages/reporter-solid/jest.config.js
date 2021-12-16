export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  collectCoverageFrom: ['./src/**'],
  setupFilesAfterEnv: ['./tests/setupTests.ts'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      babelConfig: {
        presets: ['babel-preset-solid', '@babel/preset-env'],
      },
    },
  },
  moduleNameMapper: {
    'solid-js/store': '<rootDir>/node_modules/solid-js/store/dist/store.cjs',
    'solid-js/web': '<rootDir>/node_modules/solid-js/web/dist/web.cjs',
    'solid-js': '<rootDir>/node_modules/solid-js/dist/solid.cjs',
  },
};
