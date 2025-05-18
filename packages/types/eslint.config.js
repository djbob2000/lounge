import { config } from "@repo/eslint-config/base";

export default [
  ...config,
  {
    ignores: [
      "eslint.config.js",
      "dist/**",
      "node_modules/**",
      ".turbo/**",
      "coverage/**",
    ],
  },
];
