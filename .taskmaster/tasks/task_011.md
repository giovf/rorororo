# Task ID: 11

**Title:** V1 Figma Plugin Build

**Status:** pending

**Dependencies:** 10

**Priority:** high

**Description:** Build the V1 Figma plugin based on research findings: core functionality, free tier with session limit, paid unlock via Figma payments API, and comprehensive unit tests.

**Details:**

Implementation:
1. Create `ventures/v1/` workspace:
   - package.json with name `@foundry/v1-[slug]`
   - venture.json manifest
   - tsconfig.json
   - esbuild config for Figma plugin bundling

2. Figma plugin structure:
   - manifest.json (Figma plugin manifest)
   - src/code.ts - main plugin logic (runs in Figma sandbox)
   - src/ui.html + src/ui.ts - plugin UI (iframe)
   - src/core/ - business logic (testable, pure functions)

3. Core implementation:
```typescript
// src/core/analyzer.ts (example for contrast checker)
export function checkContrast(fg: RGB, bg: RGB): ContrastResult {
  const ratio = calculateRatio(fg, bg);
  return {
    ratio,
    wcagAA: ratio >= 4.5,
    wcagAAA: ratio >= 7,
  };
}
```

4. Free tier limit:
   - Track usage in clientStorage
   - Limit: e.g., 5 checks per session
   - Show upgrade prompt at limit

5. Paid unlock:
   - Use Figma Payments API: `figma.payments.getPluginPaymentStatus()`
   - Check status on plugin load
   - Unlock full functionality if paid

6. Build scripts:
   - `npm run build` - esbuild bundle
   - `npm run dev` - watch mode
   - `npm run test` - vitest on core logic

**Test Strategy:**

1. Unit test all core logic functions with edge cases.
2. Test free tier limit triggers correctly at threshold.
3. Mock Figma payments API, test unlock flow.
4. Manual test in Figma: install, use free tier, hit limit, verify prompt.
5. Test plugin works on both Figma desktop and web.

## Subtasks

### 11.1. Create ventures/v1 workspace with venture.json manifest and build configuration

**Status:** pending  
**Dependencies:** None  

Set up the foundational workspace structure for the V1 Figma plugin including package.json, venture.json manifest, TypeScript configuration, and esbuild bundling configuration.

**Details:**

1. Create `ventures/v1/` directory structure
2. Initialize package.json with name `@foundry/v1-[slug]` (slug determined by Task 10 research outcome)
3. Create venture.json manifest with required metadata (name, description, platform: 'figma', status: 'development', pricing model)
4. Configure tsconfig.json with strict mode, appropriate target (ES2020+), and module resolution for Figma plugin environment
5. Set up esbuild.config.js for Figma plugin bundling:
   - Bundle code.ts to dist/code.js (Figma sandbox)
   - Bundle ui.ts to dist/ui.js (iframe context)
   - Configure external dependencies appropriately
6. Add npm scripts: `build`, `dev` (watch mode), `test`
7. Create .gitignore for dist/, node_modules/

### 11.2. Set up Figma plugin structure with manifest.json and entry points

**Status:** pending  
**Dependencies:** 11.1  

Create the Figma-specific plugin structure including manifest.json, main plugin entry point (code.ts), and UI entry point (ui.html/ui.ts) following Figma plugin architecture.

**Details:**

1. Create manifest.json with required Figma plugin fields:
   - name, id (generate unique plugin ID), api version
   - main: 'dist/code.js'
   - ui: 'dist/ui.html'
   - editorType: ['figma']
   - permissions if needed (currentuser, etc.)
2. Create src/code.ts skeleton:
   - figma.showUI(__html__, { width, height })
   - Message handling between sandbox and UI
   - Plugin initialization logic
3. Create src/ui.html template:
   - Basic HTML structure with styles
   - Script tag for ui.js bundle
4. Create src/ui.ts:
   - postMessage handlers for communication with code.ts
   - UI state management setup
5. Set up message type definitions for type-safe communication
6. Update esbuild to properly bundle HTML with inlined JS

### 11.3. Implement core business logic in src/core/ with pure testable functions

**Status:** pending  
**Dependencies:** 11.1, 11.2  

Build the core plugin functionality as pure, testable functions in src/core/ directory. The specific functionality depends on Task 10 research findings but should follow the pattern of isolated business logic.

**Details:**

1. Create src/core/ directory for all business logic
2. Design core module structure based on Task 10 research outcome (example patterns):
   - If accessibility: src/core/contrast.ts, src/core/wcag.ts
   - If design system: src/core/tokens.ts, src/core/validation.ts
   - If content: src/core/generator.ts, src/core/formatter.ts
3. Implement pure functions with explicit types:
   ```typescript
   // Example pattern - actual implementation depends on Task 10
   export interface CoreResult<T> {
     success: boolean;
     data?: T;
     error?: string;
   }
   export function processInput(input: InputType): CoreResult<OutputType>
   ```
4. Keep Figma-specific code OUT of core/ - only pure TypeScript
5. Create src/core/types.ts for shared type definitions
6. Create src/core/index.ts for clean exports
7. Add JSDoc comments for public API documentation

### 11.4. Build plugin UI with HTML/TypeScript in iframe context

**Status:** pending  
**Dependencies:** 11.2, 11.3  

Implement the complete plugin UI including layout, styling, user interactions, and communication with the Figma sandbox code. UI should support both free and paid states.

**Details:**

1. Design UI layout in src/ui.html:
   - Clean, minimal design following Figma plugin conventions
   - Responsive within typical plugin dimensions (300-400px width)
   - Dark mode support (respect Figma theme)
2. Implement src/ui.ts with full functionality:
   - State management for UI (free/paid status, usage count, results)
   - Event handlers for user interactions
   - postMessage communication with code.ts
   - Display core logic results from src/core/
3. Add CSS styling:
   - Use CSS variables for theming
   - Match Figma's design language
   - Loading states, error states, success states
4. Implement upgrade prompt UI:
   - Shown when free tier limit reached
   - Clear value proposition
   - Call-to-action button to trigger payment
5. Create reusable UI components if needed
6. Handle accessibility basics (keyboard nav, focus states)

### 11.5. Implement free tier usage tracking with clientStorage and upgrade prompts

**Status:** pending  
**Dependencies:** 11.2, 11.4  

Build the free tier limitation system using Figma's clientStorage API to track usage per session, enforce limits, and display appropriate upgrade prompts when limit is reached.

**Details:**

1. Define usage tracking strategy:
   - Session-based limit (e.g., 5 operations per session)
   - Store in clientStorage: { usageCount: number, sessionId: string, lastReset: timestamp }
2. Implement src/services/usage.ts:
   ```typescript
   export async function getUsageCount(): Promise<number>
   export async function incrementUsage(): Promise<{ count: number; limitReached: boolean }>
   export async function resetUsage(): Promise<void>
   export function getUsageLimit(): number // configurable
   ```
3. Integrate usage tracking in code.ts:
   - Check usage before each operation
   - Block if limit reached and not paid
   - Send limit status to UI
4. Implement upgrade prompt flow in UI:
   - Show remaining uses counter
   - Display upgrade prompt modal at limit
   - Clear messaging about what paid tier unlocks
5. Handle session reset logic (new session = reset count)
6. Add graceful fallback if clientStorage fails

### 11.6. Integrate Figma Payments API for paid unlock detection

**Status:** pending  
**Dependencies:** 11.2, 11.5  

Implement integration with Figma's Payments API to check payment status on plugin load and unlock full functionality for paying users.

**Details:**

1. Create src/services/payments.ts:
   ```typescript
   export async function checkPaymentStatus(): Promise<{
     isPaid: boolean;
     userId?: string;
   }>
   export async function initiatePayment(): Promise<boolean>
   ```
2. Integrate Figma Payments API:
   - Use `figma.payments.getPluginPaymentStatus()` on plugin load
   - Handle PaymentStatus response (PAID, UNPAID, etc.)
   - Store status for session duration
3. Implement unlock flow:
   - On load: check status -> set paid state -> bypass usage limits
   - In UI: hide upgrade prompts if paid, show premium badge
4. Add payment initiation:
   - Call `figma.payments.requestPayment()` from upgrade prompt
   - Handle payment completion callback
   - Update UI state on successful payment
5. Error handling:
   - Network failures during payment check
   - Invalid payment states
   - Graceful degradation (default to free tier on error)
6. Update manifest.json with payment-related configuration if required

### 11.7. Add comprehensive unit tests and manual testing in Figma desktop/web

**Status:** pending  
**Dependencies:** 11.3, 11.5, 11.6  

Create comprehensive test suite using Vitest for all core logic, services, and integration points. Document manual testing procedures for Figma-specific functionality.

**Details:**

1. Set up Vitest configuration:
   - vitest.config.ts with TypeScript support
   - Coverage reporting configuration
   - Test environment setup for mocking Figma APIs
2. Create test files structure:
   - tests/core/*.test.ts - all core business logic
   - tests/services/*.test.ts - usage tracking, payments
   - tests/integration/*.test.ts - message passing, flows
3. Write unit tests:
   - All core functions with edge cases
   - Usage tracking increment/reset/limit
   - Payment status handling
   - Message serialization/deserialization
4. Create Figma API mocks:
   - Mock clientStorage (get/set/delete)
   - Mock figma.payments (status, request)
   - Mock figma.ui.postMessage
5. Create manual testing checklist (TESTING.md):
   - [ ] Install plugin in Figma desktop
   - [ ] Install plugin in Figma web
   - [ ] Use free tier up to limit
   - [ ] Verify upgrade prompt appears
   - [ ] Test payment flow (sandbox)
   - [ ] Verify paid unlock works
6. Add npm script: `npm run test` and `npm run test:coverage`
