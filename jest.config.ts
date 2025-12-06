import { Logger } from '@nestjs/common';
import type { Config } from 'jest';

// Shut down the logger for TU
Logger.overrideLogger(false);

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  setupFiles: ['dotenv-flow/config'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testRegex: '.*\\.spec\\.ts$',

  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }],
  },
  setupFilesAfterEnv: ['<rootDir>/jest.config.ts'],

  transformIgnorePatterns: ['node_modules/(?!(hibp)/)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@ports/(.*)$': '<rootDir>/src/core/ports/$1',
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@sanitizers/(.*)$': '<rootDir>/src/shared/sanitizers/$1',
    '^@pipes/(.*)$': '<rootDir>/src/shared/pipes/$1',
    '^@utils/(.*)$': '<rootDir>/src/shared/utils/$1',
    '^@validators/(.*)$': '<rootDir>/src/shared/validators/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@prisma/client$': '<rootDir>/test/stubs/prisma-client.ts',
  },

  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.dto.ts',
    '!src/**/*.port.ts',
    '!src/**/*.swagger.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.module.ts',
    '!src/main.ts',
    '!src/app.module.ts',
    '!src/**/*.spec.ts',
    '!**/node_modules/**',
    '!src/infrastructure/scripts/**',
    '!src/**/$1',
    '!src/**/_*/**/*',
    '!src/**/_*.{ts,tsx,js}',
    '!dist/',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageThreshold: {
    global: { statements: 95, branches: 90, functions: 90, lines: 95 },
  },
};

export default config;
