import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

export default tseslint.config(
  // Apply to all JS/TS files
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    ...js.configs.recommended,
  },

  // TypeScript config
  ...tseslint.configs.recommended,

  // React config
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // Not needed in Next.js
      'react/prop-types': 'off', // Using TypeScript
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // TypeScript specific rules
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // Ignore patterns
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/out/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/*.config.js',
      '**/*.config.mjs',
    ],
  }
)
