module.exports = {
  root: true,
  extends: ['airbnb-typescript', 'eslint:recommended', 'plugin:eslint-comments/recommended', 'prettier/@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json', './example/tsconfig.json'],
  },
  env: {
    node: true,
    es6: true,
    browser: true,
  },
  plugins: ['@typescript-eslint', 'react-hooks'],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'eslint-comments/no-unused-disable': 'error',
    'import/prefer-default-export': 0,
    'no-console': 0,
    'no-unused-vars': 0,
    '@typescript-eslint/no-unused-vars': 0,
    'array-callback-return': 0,
    'react/static-property-placement': 0,
    'no-param-reassign': 0,
    'no-underscore-dangle': 0,
  },
  globals: {
    dva: dva,
  },
};
