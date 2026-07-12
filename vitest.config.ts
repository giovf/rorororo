import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-pool-workers';
import { defineConfig } from 'vitest/config';

const migrations = await readD1Migrations('./migrations');

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: './wrangler.jsonc' },
      miniflare: {
        bindings: {
          TEST_MIGRATIONS: migrations,
          ADMIN_TOKEN: 'test-admin-token',
          STRIPE_SECRET_KEY: 'sk_test_dummy',
          STRIPE_WEBHOOK_SECRET: 'whsec_testsecret',
          RESEND_API_KEY: 're_test_dummy',
          // Data-source API keys: tests stub the HTTP layer, so the VALUE is
          // irrelevant — but it must be present, else the source bails to
          // fixture fallback (which serves different data than the test stubs).
          // Set here rather than relying on .dev.vars, which CI doesn't have.
          SAM_API_KEY: 'test-sam-key',
          COMPANIES_HOUSE_API_KEY: 'test-ch-key',
          FIXTURE_FALLBACK: 'true',
        },
      },
    }),
  ],
  test: {
    setupFiles: ['./test/apply-migrations.ts'],
  },
});
