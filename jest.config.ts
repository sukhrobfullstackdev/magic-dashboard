const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');
const { Config } = require('jest');
const nextJest = require('next/jest.js');

const createJestConfig = nextJest({
  dir: './',
});

const config: typeof Config = {
  rootDir: process.cwd(),
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transformIgnorePatterns: [],
  testEnvironment: 'jsdom',
  transform: {
    '.*\\.(tsx?|jsx?)$': [
      '@swc/jest',
      {
        jsc: {
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
        },
      },
    ],
  },
  moduleNameMapper: {
    '\\.(scss|sass|css|less)$': 'identity-obj-proxy',
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>' }),
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  collectCoverage: true,
  collectCoverageFrom: ['./src/**'],
  coveragePathIgnorePatterns: ['<rootDir>/src/types', '<rootDir>/src/constants', '<rootDir>/src/hooks/data'],
  coverageDirectory: './coverage/',
  coverageReporters: ['text-summary', 'html'],
  // TODO: Enable threshold after refactor complete
  // coverageThreshold: {
  //   global: {
  //     statements: 70,
  //     branches: 70,
  //     functions: 70,
  //     lines: 70,
  //   },
  // },
};

export default createJestConfig(config);
