import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReact from "eslint-plugin-react";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";
import globals from "globals";
import { config as baseConfig } from "./base.js";

/**
 * A custom ESLint configuration for libraries that use React.
 *
 * @type {import("eslint").Linter.Config[]} */
export const config = [
  ...baseConfig,
  js.configs.recommended,
  eslintConfigPrettier,
  pluginReact.configs.flat.recommended,
  {
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  {
    plugins: {
      "react-hooks": pluginReactHooks,
      "jsx-a11y": pluginJsxA11y,
    },
    settings: {
      react: { version: "detect" },
      jsx: true,
      "jsx-a11y": {
        components: {
          Button: "button",
          Link: "a",
        },
      },
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      // React scope no longer necessary with new JSX transform.
      "react/prop-types": "off",
      "react/display-name": "off",
      "react/jsx-no-duplicate-props": "warn",
      "react/jsx-no-undef": "error",
      "react/jsx-pascal-case": ["warn", { allowAllCaps: true }],
      "react/jsx-uses-vars": "warn",
      "react/no-deprecated": "warn",
      "react/no-unstable-nested-components": "warn",
      "react-hooks/exhaustive-deps": [
        "warn",
        {
          additionalHooks: "(useRecoilCallback|useRecoilTransaction_UNSTABLE)",
        },
      ],
      // a11y rules
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/anchor-has-content": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/aria-proptypes": "warn",
      "jsx-a11y/aria-role": "warn",
      "jsx-a11y/role-has-required-aria-props": "warn",
      "jsx-a11y/heading-has-content": "warn",
      "jsx-a11y/no-autofocus": ["warn", { ignoreNonDOM: true }],
    },
  },
];
