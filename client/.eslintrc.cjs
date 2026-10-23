module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'vite.config.ts', 'tailwind.config.js', 'postcss.config.js'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: { react: { version: 'detect' } },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-restricted-syntax': [
      'error',
      {
        selector: 'JSXOpeningElement[name.name="select"]',
        message: 'Native <select> is banned. Use TrainerSelect / OwnerSelect / StaffSelect from the role UI module instead.',
      },
    ],
  },
  overrides: [
    {
      files: ['scripts/**/*.{js,mjs}', '*.cjs'],
      env: {
        node: true,
        es2020: true,
      },
    },
  ],
}
