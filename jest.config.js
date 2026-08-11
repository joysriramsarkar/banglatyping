const nextJest = require('next/jest.js');

const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/lib/utils.ts',
    'src/lib/bengali-grapheme.ts',
    'src/lib/lessons.ts',
    'src/hooks/use-timer.ts',
    'src/hooks/use-typing-practice.ts',
  ],
  coverageThreshold: {
    global: { lines: 70 },
  },
};

module.exports = createJestConfig(config);
