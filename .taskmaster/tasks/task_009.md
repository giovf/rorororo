# Task ID: 9

**Title:** Create Owner Action Request Template

**Status:** done

**Dependencies:** 2 ✓

**Priority:** high

**Description:** Design a standardized format for batching identity-bound actions the owner must perform (account creation, payments, domain registration). Create the first request covering Phase 0 setup.

**Details:**

Implementation:
1. Create `docs/for-owner/actions/` directory

2. Define template format (`TEMPLATE.md`):
```markdown
# Owner Action Request #N

Date: YYYY-MM-DD
Status: pending | completed
Estimated time: X minutes
Cost: £X.XX

## Actions Required

### 1. [Action Name]
- **What**: Description
- **Where**: URL/location
- **Credentials needed**: What to share back (keys, etc.)
- **Cost**: £X.XX

### 2. [Next Action]
...

## After Completion
1. Update status above to 'completed'
2. Add any keys to .env
3. Update ledger with costs
4. Notify via [method]

## Notes
Any additional context.
```

3. Create `docs/for-owner/actions/001-phase0-setup.md`:
   - Figma account + Community payments setup (free, needs identity)
   - Chrome Web Store developer registration ($5 = ~£4)
   - Lemon Squeezy application (free, waitlist, needs identity)
   - Domain registration (e.g., foundry-ventures.uk, ≤£10)
   - Total estimated: ~£14

4. Add to ledger as planned costs

5. Create `scripts/owner-actions.ts` to list pending actions

**Test Strategy:**

1. Review template with actual platform signup flows to verify completeness.
2. Estimate time accurately against real account creation processes.
3. Verify costs match current platform pricing.
4. Test script lists pending actions correctly.

## Subtasks

### 9.1. Create docs/for-owner/actions/TEMPLATE.md with standardized request format

**Status:** pending  
**Dependencies:** None  

Create the owner-actions directory and define the standardized markdown template for batching identity-bound actions.

**Details:**

1. Create `docs/for-owner/actions/` directory.
2. Create `TEMPLATE.md` with the format specified in task details:
   - Header with request number, date, status (pending/completed), estimated time, and cost fields
   - Actions Required section with numbered actions containing: What, Where, Credentials needed, and Cost
   - After Completion checklist: update status, add keys to .env, update ledger, notify
   - Notes section for additional context
3. Ensure the template uses GBP (£) currency formatting consistent with the project.

### 9.2. Create docs/for-owner/actions/001-phase0-setup.md with Phase 0 actions

**Status:** pending  
**Dependencies:** 9.1  

Create the first owner action request document covering all Phase 0 setup tasks including Figma, Chrome Web Store, Lemon Squeezy, and domain registration.

**Details:**

1. Create `001-phase0-setup.md` using the template format from subtask 1.
2. Include the following actions with accurate current pricing:
   - Figma account + Community payments setup (free, needs identity verification)
   - Chrome Web Store developer registration ($5 ≈ £4)
   - Lemon Squeezy application (free, waitlist, needs identity)
   - Domain registration (e.g., foundry-ventures.uk, budget ≤£10)
3. Set total estimated cost: ~£14
4. Set status to 'pending', add current date, estimate completion time.
5. Update docs/LEDGER.md with planned costs for each action item (pending Task 2 completion for ledger schema).

### 9.3. Create scripts/owner-actions.ts to list pending owner actions

**Status:** pending  
**Dependencies:** 9.1, 9.2  

Build a TypeScript script that scans docs/for-owner/actions/ directory and lists all pending action requests with their details.

**Details:**

1. Create `scripts/owner-actions.ts` with functionality to:
   - Glob `docs/for-owner/actions/*.md` files (excluding TEMPLATE.md)
   - Parse each markdown file to extract: request number, date, status, estimated time, total cost
   - Filter to show pending actions (status != completed)
   - Print a formatted summary table to console showing: ID, Date, Status, Est. Time, Cost, and number of actions
2. Use Node.js fs/promises and path modules (no external dependencies).
3. Exit code 0 if all actions processed successfully, 1 on parse errors.
4. Add npm script `"owner-actions": "tsx scripts/owner-actions.ts"` to package.json.
