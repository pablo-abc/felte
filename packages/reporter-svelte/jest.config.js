export default {
  testEnvironment: 'jsdom',
  collectCoverageFrom: ['./src/**'],
  transform: {
    '^.+\\.svelte$': 'svelte-jester',
    '^.+\\.js$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'svelte'],
};
