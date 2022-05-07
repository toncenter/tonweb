
import type { Config } from '@jest/types';


const isPackageTest = Boolean(process.env.TEST_PACKAGE);


export default <Config.InitialOptions>{
  preset: 'ts-jest',
  verbose: true,
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: '<rootDir>/test-reports/',
    }],
  ],
  roots: [
    '<rootDir>/src/',
  ],
  testMatch: [
    '**/*.test.ts',
  ],
  collectCoverageFrom: [
    '**/*.ts',
  ],
  errorOnDeprecated: true,
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.test.json',
    },
  },
  setupFiles: [
    '<rootDir>/test/setup.ts',
  ],
  moduleNameMapper: {
    '__tonweb__': (!isPackageTest
        ? '<rootDir>/src/index.ts'
        : '<rootDir>/node_modules/tonweb/src/index.js'
    ),
  },
};
