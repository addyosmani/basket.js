export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  moduleFileExtensions: ['js'],
  testMatch: ['**/test/**/*.test.js'],
  setupFiles: ['./test/setup.js'],
  verbose: true
};
