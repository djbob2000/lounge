import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import sonarjsPlugin from "eslint-plugin-sonarjs";
import nPlugin from "eslint-plugin-n";
import unicornPlugin from "eslint-plugin-unicorn";

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
      import: importPlugin,
      sonarjs: sonarjsPlugin,
      n: nPlugin,
      unicorn: unicornPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },
    },
    rules: {
      "unicorn/filename-case": ["error", { case: "kebabCase" }],
      "turbo/no-undeclared-env-vars": "warn",
      "import/first": "warn",
      "import/no-duplicates": "warn",
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "type",
            "internal",
            ["parent", "sibling", "index"],
            "object",
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "sonarjs/no-duplicate-string": ["warn", { threshold: 3 }],
      "sonarjs/no-identical-functions": "warn",
      "sonarjs/cognitive-complexity": ["warn", 15],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
  eslintConfigPrettier,
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      ".turbo/**",
      ".next/**",
      "build/**",
      "coverage/**",
    ],
  },
];
