import { applyD1Migrations, env, reset } from 'cloudflare:test';
import { beforeEach } from 'vitest';

// pool-workers 0.18 shares binding storage across tests; give every test a
// clean slate and a migrated schema.
beforeEach(async () => {
  await reset();
  await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
});
