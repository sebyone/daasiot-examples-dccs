import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/**", "database.sqlite", "static/**"],
  },
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-unreachable": "error",
    },
  },
];
