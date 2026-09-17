# Task ID: 1

**Title:** Create Portfolio Listing Script

**Status:** done

**Dependencies:** None

**Priority:** high

**Description:** Build scripts/portfolio.ts that reads all venture.json files from ventures/<slug>/, validates them with defineVenture(), and prints a formatted portfolio status summary. Wire it into npm run check to fail on invalid manifests.

**Details:**

Implementation:
1. Create `scripts/portfolio.ts` that:
   - Globs `ventures/*/venture.json` using Node's fs/promises + path
   - Reads and parses each JSON file
   - Calls `defineVenture()` from `@foundry/core` for validation (throws on invalid)
   - Collects results and prints a table: slug | name | channel | status | pricing
   - Uses console colors (no dep needed, Node 22 has stylized output)
   - Exit code 1 if any manifest invalid
2. Add a `scripts/` workspace in package.json or run via tsx
3. Add `"portfolio": "tsx scripts/portfolio.ts"` and update `check` script to include it
4. Create `scripts/tsconfig.json` extending root config

Pseudo-code:
```typescript
import { glob } from 'node:fs/promises';
import { defineVenture, VentureManifest } from '@foundry/core';

const manifests = await glob('ventures/*/venture.json');
let hasError = false;

for (const path of manifests) {
  const raw = JSON.parse(await readFile(path, 'utf8'));
  try {
    const v = defineVenture(raw);
    console.log(`✓ ${v.slug} [${v.status}]`);
  } catch (e) {
    console.error(`✗ ${path}: ${e.message}`);
    hasError = true;
  }
}
process.exit(hasError ? 1 : 0);
```

**Test Strategy:**

1. Create a test venture.json in ventures/test-venture/ with valid data, run portfolio script, verify it prints success.
2. Create an invalid manifest (bad slug), run script, verify it exits 1 with error message.
3. Run npm run check with both valid and invalid states to ensure integration works.
4. Remove test fixture after verification.

## Subtasks

### 1.1. Create scripts/portfolio.ts with glob-based venture.json discovery and JSON parsing

**Status:** pending  
**Dependencies:** None  

Implement the core script file that uses Node 22's native glob to discover all venture.json files under ventures/*/, reads them using fs/promises, and parses the JSON content. Handle file system errors gracefully.

**Details:**

Create scripts/portfolio.ts using Node 22's native fs/promises glob support. Import { glob, readFile } from 'node:fs/promises' and { join, dirname } from 'node:path'. Glob for 'ventures/*/venture.json' pattern. For each matched path, read the file contents with readFile(path, 'utf8') and parse with JSON.parse(). Extract the slug from the directory name using path utilities. Store results in an array for processing. Include try-catch around file reading to handle malformed JSON with helpful error messages including the file path.

### 1.2. Integrate with @foundry/core defineVenture() for validation and format output table

**Status:** pending  
**Dependencies:** 1.1  

Import defineVenture from @foundry/core to validate each parsed manifest. Collect validation results and print a formatted table showing slug, name, channel, status, and pricing. Use Node 22 console styling for colored output.

**Details:**

Import { defineVenture } from '@foundry/core'. For each parsed JSON manifest, call defineVenture(raw) which throws on invalid data. Track hasError boolean. On success, store venture data for table output. On catch, log error with ✗ prefix and file path, set hasError=true. After processing all files, print formatted table with columns: slug | name | channel | status | pricing. Use console.table() or manual formatting with padEnd() for alignment. Apply Node 22 console colors: green ✓ for valid, red ✗ for invalid. Call process.exit(hasError ? 1 : 0) at end.

### 1.3. Wire into npm run check script and add scripts/tsconfig.json

**Status:** pending  
**Dependencies:** 1.2  

Create scripts/tsconfig.json extending the root config for proper TypeScript compilation of scripts. Add 'portfolio' npm script using tsx, and update the 'check' script to include portfolio validation so CI fails on invalid manifests.

**Details:**

Create scripts/tsconfig.json: { "extends": "../tsconfig.base.json", "compilerOptions": { "module": "NodeNext", "moduleResolution": "NodeNext", "target": "ES2022", "outDir": "../dist/scripts" }, "include": ["./*.ts"] }. In root package.json, add script: "portfolio": "tsx scripts/portfolio.ts". Update existing "check" script to chain portfolio validation, e.g., "check": "tsc --noEmit && npm run portfolio" or similar pattern matching existing check commands. Ensure tsx is available (should be in devDependencies already, or add if missing).
