// @ts-check
import { nestJsConfig } from '@repo/eslint-config/nest-js';

export default [
  ...nestJsConfig,
  {
    ignores: [
      'eslint.config.mjs',
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'test/**',
      '**/*.spec.ts',
    ],
  },
];
