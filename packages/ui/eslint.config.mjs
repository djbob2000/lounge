import { config } from "@lounge/eslint-config/react-internal";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: [
      "eslint.config.mjs",
      "dist/**",
      "node_modules/**",
      ".turbo/**",
      "coverage/**",
      "src/slider.tsx",
      "src/gallery.tsx",
      "turbo/**",
    ],
  },
];
