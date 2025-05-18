import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import nPlugin from "eslint-plugin-n";
import globals from "globals";
import { config as baseConfig } from "./base.js";

/**
 * A custom ESLint configuration for libraries that use NestJS.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const nestJsConfig = [
  ...baseConfig,
  js.configs.recommended,
  eslintConfigPrettier,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.jest,
        Express: "readonly",
        Request: "readonly",
        Response: "readonly",
      },
    },
  },
  {
    plugins: {
      n: nPlugin,
    },
    rules: {
      // Disable rules that are causing issues
      // "no-undef": "off",  // Removed
      "no-unused-vars": "warn", // Downgrade to warning

      // NestJS specific rules
      "@typescript-eslint/explicit-function-return-type": [
        "warn",
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowDirectConstAssertionInArrowFunctions: true,
        },
      ],
      // "@typescript-eslint/explicit-member-accessibility": [
      //   "off", // Removed
      //   { overrides: { constructors: "no-public" } }
      // ],
      "@typescript-eslint/no-empty-interface": [
        "warn",
        { allowSingleExtends: true },
      ],
      "@typescript-eslint/no-explicit-any": "warn",

      // Node specific rules
      "n/no-process-exit": "warn",
      "n/no-deprecated-api": "error",

      // General rules
      "prefer-const": "warn",
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],

      // Turbo rules
      "turbo/no-undeclared-env-vars": "warn", // Allow env vars with warning
    },
  },
];
