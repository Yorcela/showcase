// eslint.config.mjs
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import prettierPlugin from "eslint-plugin-prettier";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier";
import { fileURLToPath } from "node:url";

const tsconfigRootDir = fileURLToPath(new URL(".", import.meta.url));

export default [
  { ignores: ["dist/**", "node_modules/**", ".eslintrc.js"] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir,
        sourceType: "module",
      },
    },

    plugins: {
      import: importPlugin,
      prettier: prettierPlugin,
      "unused-imports": unusedImports,
    },

    settings: {
      "import/resolver": {
        typescript: { project: "./tsconfig.json" },
      },
    },

    rules: {
      "@typescript-eslint/no-explicit-any": "off",

      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        { vars: "all", varsIgnorePattern: "^_", args: "after-used", argsIgnorePattern: "^_" },
      ],

      "prettier/prettier": "warn",

      // Détection des cycles d'import
      "import/no-cycle": ["error", { maxDepth: 2 }], // ⬅︎ ajouté

      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling", "index"],
            "object",
            "type",
          ],
          pathGroups: [
            { pattern: "@nestjs/**", group: "external", position: "before" },
            { pattern: "@prisma/**", group: "external", position: "before" },
            { pattern: "@paralleldrive/**", group: "external", position: "before" },

            { pattern: "@core/**", group: "internal", position: "before" },
            { pattern: "@ports/**", group: "internal", position: "before" },
            { pattern: "@infrastructure/**", group: "internal", position: "before" },
            { pattern: "@modules", group: "internal", position: "before" },
            { pattern: "@modules/**", group: "internal", position: "before" },
            { pattern: "@shared/**", group: "internal", position: "before" },
            { pattern: "@/**", group: "internal", position: "before" },
          ],
          pathGroupsExcludedImportTypes: ["builtin", "external"],
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/no-internal-modules": "off",
    },
  },

  {
    files: ["**/*.spec.ts", "**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-var-requires": "off",
    },
  },

  {
    files: ["src/modules/**/application/**/*.ts", "src/modules/**/domain/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@modules/*/application/**",
                "@modules/*/domain/**",
                "@modules/*/infrastructure/**",
              ],
              message:
                "🚫 Import circulaire potentiel : utilise un import relatif si tu es dans le même module.",
            },
          ],
        },
      ],
    },
  },

  {
    files: ["src/**/*.ts"],
    ignores: ["**/prisma/**", "**/*.prisma.*.ts", "**/prisma.*.ts", "**/infrastructure/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "**/prisma/prisma.service",
                "@infrastructure/**/prisma.service",
                "**/prisma.service",
              ],
              message:
                "🚫 PrismaService can only be used by infra or files named .prisma or within prisma folders. Use a port instead.",
            },
          ],
        },
      ],
    },
  },

  eslintConfigPrettier,
];
