// Prints the venture portfolio and fails on any invalid manifest.
// Run: npm run portfolio   (Node 22 runs .ts directly — keep syntax erasable)
import path from 'node:path';
import { formatPortfolio, loadPortfolio } from '@foundry/core';

const dir = path.resolve(import.meta.dirname, '..', 'ventures');
const { ventures, errors } = await loadPortfolio(dir);

console.log(`Portfolio — ${ventures.length} venture(s)\n${formatPortfolio(ventures)}`);
if (errors.length > 0) {
  console.error(`\n${errors.length} invalid manifest(s):\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
