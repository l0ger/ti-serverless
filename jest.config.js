/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/services', '<rootDir>/shared'],
  testMatch: ['**/*.test.ts'],
  modulePathIgnorePatterns: ['<rootDir>/.*/cdk.out/'],
  transform: {
    '^.+\\.ts$': [
      '@swc/jest',
      {
        jsc: { parser: { syntax: 'typescript' }, target: 'es2022' },
        module: { type: 'commonjs' },
      },
    ],
  },
};
