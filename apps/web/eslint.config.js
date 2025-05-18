import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  {
    ignores: [
      "eslint.config.js",
      ".next/**",
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "public/**",
    ],
    // Next.js специфічна конфігурація
    linterOptions: {
      reportUnusedDisableDirectives: "error",
      noInlineConfig: false,
    },
  },
];
