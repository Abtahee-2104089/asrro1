import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"
import importPlugin from "eslint-plugin-import-x"
import jsxA11y from "eslint-plugin-jsx-a11y"
import unicorn from "eslint-plugin-unicorn"

const disabledUnicornRules = Object.fromEntries(
  Object.keys(unicorn.configs.unopinionated.rules).map((rule) => [rule, "off"])
)

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: jsxA11y.flatConfigs.strict.rules,
  },
  importPlugin.flatConfigs.errors,
  importPlugin.flatConfigs.typescript,
  unicorn.configs.unopinionated,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      eqeqeq: ["error", "always"],
      "no-console": ["error", { allow: ["warn", "error"] }],
      "prefer-const": "error",
    },
  },
  {
    files: ["components/motion/**/*.{ts,tsx}"],
    rules: {
      ...disabledUnicornRules,
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      eqeqeq: "off",
      "jsx-a11y/no-static-element-interactions": "off",
      "jsx-a11y/click-events-have-key-events": "off",
      "react-hooks/immutability": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: ["convex/**/*.{ts,tsx}"],
    rules: {
      ...disabledUnicornRules,
    },
  },
  globalIgnores([
    ".next/**",
    ".react-doctor/**",
    "out/**",
    "build/**",
    "convex/_generated/**",
    "convex/**/_generated/**",
    "next-env.d.ts",
  ]),
])

export default eslintConfig
