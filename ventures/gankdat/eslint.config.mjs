import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['dist/', 'node_modules/', '.wrangler/', 'worker-configuration.d.ts', '**/.obsidian/'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
    },
  },
  {
    // Node scripts run outside the Workers runtime.
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: { console: 'readonly', process: 'readonly', fetch: 'readonly' },
    },
  },
  {
    // Browser client scripts for the static pages (public/js/*.js): run in the
    // DOM, not the Workers runtime, so declare the browser globals they use.
    files: ['public/**/*.js'],
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        location: 'readonly',
        history: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
        URLSearchParams: 'readonly',
        matchMedia: 'readonly',
        getSelection: 'readonly',
        confirm: 'readonly',
        setTimeout: 'readonly',
        requestAnimationFrame: 'readonly',
        performance: 'readonly',
        addEventListener: 'readonly',
        innerWidth: 'readonly',
        innerHeight: 'readonly',
        // Global injected by the Scalar CDN bundle on the docs page.
        Scalar: 'readonly',
      },
    },
    rules: {
      // `try { … } catch {}` (ignore best-effort failures) is intentional here.
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
);
