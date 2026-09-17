# Task ID: 2

**Title:** Create Ledger Schema and Validation Script

**Status:** done

**Dependencies:** 1 ✓

**Priority:** high

**Description:** Define docs/LEDGER.md with a structured markdown table schema for tracking all costs and revenues, then create scripts/ledger-check.ts to parse and validate entries, ensuring totals stay under the £100 capital cap.

**Details:**

Implementation:
1. Create `docs/LEDGER.md` with structure:
```markdown
# Portfolio Ledger

Source of truth for all money in/out.

| Date       | Venture | Kind    | GBP    | Note                          |
|------------|---------|---------|--------|-------------------------------|
| 2026-09-17 | infra   | cost    | 5.00   | Chrome Web Store dev fee      |
```

2. Create `scripts/ledger-check.ts`:
   - Parse markdown table using regex or simple line parsing (no external deps)
   - Validate: date is ISO format, kind is 'cost'|'revenue', GBP is valid number
   - Calculate totals: sum costs, sum revenue, net
   - **Fail build if total planned costs exceed £100**
   - Print summary: total spent, total earned, net
3. Add to npm scripts and `check` command
4. Export types: `LedgerRow { date: string; venture: string; kind: 'cost'|'revenue'; gbp: number; note: string }`

Pseudo-code:
```typescript
const lines = (await readFile('docs/LEDGER.md', 'utf8')).split('\n');
const rows = parseMarkdownTable(lines);
let costs = 0, revenue = 0;
for (const row of rows) {
  if (row.kind === 'cost') costs += row.gbp;
  else revenue += row.gbp;
}
if (costs > 100) {
  console.error(`Capital cap exceeded: £${costs} > £100`);
  process.exit(1);
}
```

**Test Strategy:**

1. Create ledger with entries totaling < £100, verify script passes.
2. Add entries exceeding £100, verify script fails with clear message.
3. Test malformed rows (bad date format, invalid kind) trigger validation errors.
4. Verify script outputs accurate totals summary.

## Subtasks

### 2.1. Create docs/LEDGER.md with markdown table schema and initial entries

**Status:** pending  
**Dependencies:** None  

Create the LEDGER.md file in the docs directory with a properly formatted markdown table schema for tracking all portfolio costs and revenues. Include the header row, separator row, and at least one example entry to establish the format.

**Details:**

Create docs/LEDGER.md with the following structure:
1. Add a title '# Portfolio Ledger' and description explaining it's the source of truth for all money in/out
2. Define the markdown table with columns: Date | Venture | Kind | GBP | Note
3. Add the separator row with proper alignment dashes
4. Include initial entry: 2026-09-17 | infra | cost | 5.00 | Chrome Web Store dev fee
5. Add a section explaining column requirements:
   - Date: ISO 8601 format (YYYY-MM-DD)
   - Venture: slug matching ventures/<slug>/
   - Kind: 'cost' or 'revenue' only
   - GBP: decimal number with 2 decimal places
   - Note: free text description
6. Document the £100 capital cap constraint prominently at the top

### 2.2. Implement scripts/ledger-check.ts with markdown table parsing logic

**Status:** pending  
**Dependencies:** 2.1  

Create the ledger-check.ts script in the scripts directory that reads and parses the LEDGER.md markdown table without external dependencies. Export the LedgerRow type for reuse across the codebase.

**Details:**

Implement scripts/ledger-check.ts:
1. Export type LedgerRow = { date: string; venture: string; kind: 'cost' | 'revenue'; gbp: number; note: string }
2. Read docs/LEDGER.md using fs/promises readFile
3. Implement parseMarkdownTable() function:
   - Split content by newlines
   - Find lines starting with '|' (table rows)
   - Skip header row (first table row) and separator row (contains dashes)
   - For each data row, split by '|' and trim whitespace
   - Extract columns: date, venture, kind, gbp (parseFloat), note
   - Return array of LedgerRow objects
4. Handle edge cases: empty file, no table found, malformed rows
5. Use only Node.js built-ins (fs/promises, path) - no external parsing libraries

### 2.3. Add validation for date formats, kind enum, and GBP numeric values

**Status:** pending  
**Dependencies:** 2.2  

Implement validation logic within ledger-check.ts to ensure each parsed row conforms to the schema: ISO date format, valid kind enum ('cost' or 'revenue'), and valid GBP numeric values. Report clear error messages for invalid entries.

**Details:**

Add validation functions to ledger-check.ts:
1. validateDate(date: string): boolean - Check ISO 8601 format using regex /^\d{4}-\d{2}-\d{2}$/ and verify it's a valid date
2. validateKind(kind: string): kind is 'cost' | 'revenue' - Ensure kind is exactly 'cost' or 'revenue'
3. validateGbp(gbp: number): boolean - Ensure it's a finite positive number
4. validateRow(row: LedgerRow, lineNum: number): string[] - Return array of error messages
5. Implement validateLedger(rows: LedgerRow[]): { valid: boolean; errors: string[] }
6. Print each validation error with line number for easy debugging
7. Exit with code 1 if any validation errors found, printing all errors before exiting
8. Validate venture slugs match expected format (lowercase, alphanumeric with hyphens)

### 2.4. Implement capital cap check (£100 limit) and integrate with npm run check

**Status:** pending  
**Dependencies:** 2.3  

Add the capital cap enforcement logic that fails the build if total planned costs exceed £100. Implement summary output showing totals and integrate the script with the existing npm run check command.

**Details:**

Complete ledger-check.ts implementation:
1. Calculate totals after validation passes:
   - Sum all rows where kind === 'cost' into totalCosts
   - Sum all rows where kind === 'revenue' into totalRevenue
   - Calculate net = totalRevenue - totalCosts
2. Implement capital cap check:
   - If totalCosts > 100, print error: 'Capital cap exceeded: £{totalCosts.toFixed(2)} > £100'
   - Exit with code 1 on cap exceeded
3. Print summary on success:
   - 'Ledger Summary:'
   - '  Total costs:   £{totalCosts.toFixed(2)}'
   - '  Total revenue: £{totalRevenue.toFixed(2)}'
   - '  Net:           £{net.toFixed(2)}'
   - '  Capital remaining: £{(100 - totalCosts).toFixed(2)}'
4. Add to package.json scripts: 'ledger-check': 'npx tsx scripts/ledger-check.ts'
5. Update 'check' script to include ledger-check in the chain
