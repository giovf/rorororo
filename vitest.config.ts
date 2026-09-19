import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['packages/**/*.test.ts', 'ventures/**/*.test.ts'],
    // gankdat runs under the Cloudflare Workers pool with its own vitest: `npm run check -w @foundry/gankdat`.
    exclude: ['**/node_modules/**', '**/dist*/**', 'ventures/gankdat/**'],
    passWithNoTests: false,
  },
});
