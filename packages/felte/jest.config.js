module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  collectCoverageFrom: ['./src/**'],
  moduleNameMapper: {
    'lodash-es/(.*)': 'lodash/$1',
  },
};
