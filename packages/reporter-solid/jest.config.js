export default {
  preset: 'solid-jest/preset/browser',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@felte/solid': '<rootDir>/../solid/dist/cjs/index.cjs',
    '^@felte/core': '<rootDir>/../core/dist/cjs/index.cjs',
    '^@felte/common': '<rootDir>/../common/dist/cjs/index.cjs',
  },
};
