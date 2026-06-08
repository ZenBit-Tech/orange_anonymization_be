module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json', './test/tsconfig.e2e.json'],
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended', // runs Prettier as an ESLint rule
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.cjs'],
  rules: {
    // ─── TypeScript ───────────────────────────────────────────────────────────
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'error', // zero `any`
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

    // ─── NestJS conventions ───────────────────────────────────────────────────
    // Never use process.env directly — always inject ConfigService
    'no-restricted-syntax': [
      'error',
      {
        selector: "MemberExpression[object.name='process'][property.name='env']",
        message: 'Use ConfigService (injected via @nestjs/config) instead of process.env directly.',
      },
    ],

    // ─── General quality ─────────────────────────────────────────────────────
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
  },
};
