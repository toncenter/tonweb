
import type { Config } from '@jest/types';


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
};
