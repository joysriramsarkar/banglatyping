const nextJest = require('next/jest.js');

const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/playwright/', '<rootDir>/e2e/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/lib/**/*.ts',
    'src/hooks/**/*.ts',
    'src/hooks/**/*.tsx',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
    // type-only modules: they compile to no runtime code
    'src/lib/types.ts',
    'src/lib/curriculum/types.ts',
  ],
  // Honest floor. Coverage is measured across every file in src/lib and
  // src/hooks rather than a hand-picked list, so this number is the real one.
  // Raise it as tests are added; do not lower it.
  coverageThreshold: {
    global: { lines: 80 },
  },
};

module.exports = createJestConfig(config);
