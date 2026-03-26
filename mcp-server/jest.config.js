export default {
  testEnvironment: 'node',
  testTimeout: 30000,
  transform: {},
  moduleNameMapper: {
    '^(\.{1,2}/.*)\.js$': '$1',
  },
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'index.js',
    'lib/**/*.js',
    'utils/**/*.js',
    '!**/__tests__/**',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
};
