import tseslint from "typescript-eslint";

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "debug-*.js",
      "test-*.js",
    ],
  },
  ...tseslint.configs.recommended,
];

export default eslintConfig;
