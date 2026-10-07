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
  // Multi-dimensional coverage floor enforcing rigorous regression protection
  // across lines, branches, functions, and statements (পরিকল্পনা.md #19.2).
  coverageThreshold: {
    global: {
      lines: 85,
      statements: 85,
      functions: 80,
      branches: 65,
    },
  },
};

module.exports = createJestConfig(config);
