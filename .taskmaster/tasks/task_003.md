# Task ID: 3

**Title:** Build Licensing Package Core

**Status:** pending

**Dependencies:** None

**Priority:** high

**Description:** Create packages/licensing with offline-first license key verification using signed key format. Include the core types, key generation, and offline verification logic without external dependencies.

**Details:**

Implementation:
1. Create `packages/licensing/` workspace:
   - package.json with name `@foundry/licensing`
   - tsconfig.json extending root
   - src/index.ts exporting all public API

2. Key format (signed, offline-verifiable):
```typescript
// Key: base64url({ venture, tier, validUntil, signature })
interface LicensePayload {
  venture: string;      // slug matching the product
  tier: 'basic' | 'pro';
  validUntil: string;   // ISO date or 'perpetual'
  email?: string;       // optional, hashed for privacy
}

interface LicenseKey {
  payload: LicensePayload;
  signature: string;    // HMAC-SHA256 of payload
}
```

3. Functions:
   - `generateLicenseKey(payload, secret): string` - for merchant webhook
   - `verifyLicenseOffline(key, publicHint): LicensePayload | null` - fast check
   - `parseLicenseKey(key): LicensePayload | null` - decode without verify

4. Use Node crypto (HMAC-SHA256), no external deps
5. Handle graceful expiry check: `isExpired(payload): boolean`

Pseudo-code:
```typescript
import { createHmac } from 'node:crypto';

export function generateLicenseKey(payload: LicensePayload, secret: string): string {
  const data = JSON.stringify(payload);
  const sig = createHmac('sha256', secret).update(data).digest('base64url');
  return Buffer.from(JSON.stringify({ payload, signature: sig })).toString('base64url');
}

export function verifyLicenseOffline(key: string, secret: string): LicensePayload | null {
  const { payload, signature } = JSON.parse(Buffer.from(key, 'base64url').toString());
  const expected = createHmac('sha256', secret).update(JSON.stringify(payload)).digest('base64url');
  if (signature !== expected) return null;
  return payload;
}
```

**Test Strategy:**

1. Generate a key, verify it returns the correct payload.
2. Tamper with payload bytes, verify verification fails.
3. Test expired key detection with past validUntil date.
4. Test perpetual keys always pass expiry check.
5. Fuzz test with malformed base64 inputs, verify graceful null returns.

## Subtasks

### 3.1. Create packages/licensing workspace structure

**Status:** pending  
**Dependencies:** None  

Set up the packages/licensing directory with package.json, tsconfig.json, tsconfig.build.json, and src/index.ts following the packages/core workspace conventions.

**Details:**

Create packages/licensing/ directory with:
- package.json with name '@foundry/licensing', type 'module', exports configuration matching @foundry/core pattern (main, types, exports fields)
- tsconfig.json extending ../../tsconfig.base.json with rootDir 'src' and outDir 'dist'
- tsconfig.build.json extending ./tsconfig.json and excluding test files
- src/index.ts as the entry point (initially empty, will export public API)
- Add reference to packages/licensing/tsconfig.build.json in root tsconfig.json

Follow exact patterns from packages/core for consistency.

### 3.2. Define LicensePayload and LicenseKey types

**Status:** pending  
**Dependencies:** 3.1  

Create src/types.ts with TypeScript interfaces for LicensePayload (venture, tier, validUntil, optional email) and LicenseKey (payload plus signature).

**Details:**

Create packages/licensing/src/types.ts with:

interface LicensePayload {
  venture: string;           // slug matching the product
  tier: 'basic' | 'pro';     // license tier
  validUntil: string;        // ISO date (YYYY-MM-DD) or 'perpetual'
  email?: string;            // optional, hashed for privacy
}

interface LicenseKey {
  payload: LicensePayload;
  signature: string;         // HMAC-SHA256 of payload as base64url
}

Export both types from src/index.ts. Use explicit named exports, no default exports per project conventions. Add type guards if helpful for runtime checks.

### 3.3. Implement generateLicenseKey function

**Status:** pending  
**Dependencies:** 3.1, 3.2  

Create src/generate.ts implementing generateLicenseKey(payload, secret) using Node crypto HMAC-SHA256 to produce a signed, base64url-encoded license key string.

**Details:**

Create packages/licensing/src/generate.ts:

import { createHmac } from 'node:crypto';
import type { LicensePayload } from './types.js';

export function generateLicenseKey(payload: LicensePayload, secret: string): string {
  // Serialize payload to deterministic JSON
  const data = JSON.stringify(payload);
  // Create HMAC-SHA256 signature
  const signature = createHmac('sha256', secret).update(data).digest('base64url');
  // Bundle payload + signature and encode as base64url
  return Buffer.from(JSON.stringify({ payload, signature })).toString('base64url');
}

Export from src/index.ts. No external dependencies - use only node:crypto. Ensure explicit return type annotation.

### 3.4. Implement verifyLicenseOffline function

**Status:** pending  
**Dependencies:** 3.1, 3.2, 3.3  

Create src/verify.ts implementing verifyLicenseOffline(key, secret) that decodes the license key, recalculates the HMAC signature, and returns the payload if valid or null if tampered.

**Details:**

Create packages/licensing/src/verify.ts:

import { createHmac } from 'node:crypto';
import type { LicensePayload, LicenseKey } from './types.js';

export function verifyLicenseOffline(key: string, secret: string): LicensePayload | null {
  try {
    // Decode base64url -> JSON
    const decoded = Buffer.from(key, 'base64url').toString();
    const { payload, signature } = JSON.parse(decoded) as LicenseKey;
    // Recalculate expected signature
    const expected = createHmac('sha256', secret).update(JSON.stringify(payload)).digest('base64url');
    // Constant-time comparison would be ideal, but timing attack risk is minimal for offline verification
    if (signature !== expected) return null;
    return payload;
  } catch {
    return null;  // Gracefully handle malformed input
  }
}

Export from src/index.ts.

### 3.5. Add parseLicenseKey and isExpired utility functions

**Status:** pending  
**Dependencies:** 3.1, 3.2  

Create src/utils.ts with parseLicenseKey(key) for decoding without verification and isExpired(payload) for checking validUntil dates, including perpetual license handling.

**Details:**

Create packages/licensing/src/utils.ts:

import type { LicensePayload } from './types.js';

export function parseLicenseKey(key: string): LicensePayload | null {
  try {
    const decoded = Buffer.from(key, 'base64url').toString();
    const { payload } = JSON.parse(decoded) as { payload: LicensePayload };
    // Basic shape validation
    if (!payload?.venture || !payload?.tier || !payload?.validUntil) return null;
    return payload;
  } catch {
    return null;
  }
}

export function isExpired(payload: LicensePayload): boolean {
  if (payload.validUntil === 'perpetual') return false;
  // Parse ISO date and compare to current date (UTC)
  const expiry = new Date(payload.validUntil + 'T23:59:59.999Z');
  return Date.now() > expiry.getTime();
}

Export both from src/index.ts. Comprehensive unit tests covering edge cases.
