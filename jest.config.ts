import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
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

export default createJestConfig(config);
