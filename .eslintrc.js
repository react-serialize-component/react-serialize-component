module.exports = {
  root: true,
  extends: ['airbnb-typescript-prettier'],
  parserOptions: {
    project: ['packages/*/tsconfig.json', 'examples/tsconfig.json', 'tsconfig.json'],
  },
  env: {
    node: true,
    es6: true,
    browser: true,
  },
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'import/prefer-default-export': 0,
    'no-console': 0,
    'no-unused-vars': 0,
    '@typescript-eslint/no-unused-vars': 0,
    'array-callback-return': 0,
    'react/static-property-placement': 0,
    'no-param-reassign': 0,
    'no-underscore-dangle': 0,
    '@typescript-eslint/no-explicit-any': 0,
    'no-new-func': 0,
    'prefer-promise-reject-errors': 0,
    'max-classes-per-file': 0,
    'react/no-danger': 1,
    'react/jsx-props-no-spreading': 0,
    'no-template-curly-in-string': 0,
    'import/no-unresolved': 1,
    'react/no-array-index-key': 0,
    'func-names': 0,
    'no-bitwise': 0,
    'no-nested-ternary': 1,
    'class-methods-use-this': 0,
    'no-restricted-syntax': [0, "BinaryExpression[operator='in']"],
  },
};