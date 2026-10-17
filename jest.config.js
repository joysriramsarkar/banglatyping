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
    'src/app/api/**/route.ts',
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
      lines: 90,
      statements: 90,
      functions: 85,
      branches: 75,
    },
    './src/lib/bengali-grapheme.ts': {
      lines: 95,
      statements: 95,
      functions: 95,
      branches: 90,
    },
    './src/lib/typing/metric-formulas.ts': {
      lines: 100,
      statements: 100,
      functions: 100,
      branches: 95,
    },
    './src/lib/typing/session.ts': {
      lines: 90,
      statements: 90,
      functions: 90,
      branches: 80,
    },
  },
};

module.exports = createJestConfig(config);
