# Task ID: 4

**Title:** Add Licensing Online Verification Adapter

**Status:** pending

**Dependencies:** 3

**Priority:** medium

**Description:** Extend packages/licensing with an adapter interface for online verification and implement Lemon Squeezy API integration plus an in-memory fake for testing.

**Details:**

Implementation:
1. Define adapter interface:
```typescript
interface LicenseVerifier {
  verify(licenseKey: string): Promise<{
    valid: boolean;
    payload?: LicensePayload;
    error?: string;
  }>;
  activate?(licenseKey: string, instanceId: string): Promise<boolean>;
}
```

2. Implement `LemonSqueezyVerifier`:
   - Uses Lemon Squeezy License API: POST /v1/licenses/validate
   - Headers: Authorization Bearer with API key
   - Returns parsed payload if valid, error message if not
   - Handles rate limits (429) with exponential backoff

3. Implement `InMemoryVerifier` for tests:
   - Constructor takes a Map<string, LicensePayload>
   - verify() checks map, simulates latency
   - activate() adds to activated set

4. Export factory: `createVerifier(type: 'lemon-squeezy' | 'memory', opts)`

5. Add grace period caching:
```typescript
interface CachedVerifier {
  // Cache valid results for 24h, allowing offline use
  verify(key: string): Promise<Result>;
  clearCache(): void;
}
```

Pseudo-code:
```typescript
export class LemonSqueezyVerifier implements LicenseVerifier {
  constructor(private apiKey: string) {}
  
  async verify(licenseKey: string) {
    const res = await fetch('https://api.lemonsqueezy.com/v1/licenses/validate', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
      body: JSON.stringify({ license_key: licenseKey })
    });
    // Parse response...
  }
}
```

**Test Strategy:**

1. Unit test InMemoryVerifier with valid/invalid keys.
2. Integration test LemonSqueezyVerifier with mocked fetch (use msw or manual mock).
3. Test cache: verify same key twice, ensure second call uses cache.
4. Test cache expiry: simulate time passage, verify re-fetch occurs.
5. Test network failure: verify graceful degradation to cached result.

## Subtasks

### 4.1. Define LicenseVerifier Interface and Types

**Status:** pending  
**Dependencies:** None  

Create the core LicenseVerifier adapter interface with verify() and optional activate() methods, along with all associated types (VerificationResult, LicensePayload re-export).

**Details:**

Create src/adapters/types.ts in packages/licensing with:
1. Import LicensePayload from core types (Task 3)
2. Define VerificationResult interface: { valid: boolean; payload?: LicensePayload; error?: string }
3. Define LicenseVerifier interface with:
   - verify(licenseKey: string): Promise<VerificationResult>
   - activate?(licenseKey: string, instanceId: string): Promise<boolean> (optional method)
4. Define ActivationResult interface if needed for richer activate() responses
5. Export all types from src/adapters/index.ts
6. Re-export from main src/index.ts

### 4.2. Implement InMemoryVerifier for Testing

**Status:** pending  
**Dependencies:** 4.1  

Create InMemoryVerifier adapter that uses a Map for storing valid licenses, supports configurable latency simulation, and tracks activations for test assertions.

**Details:**

Create src/adapters/in-memory-verifier.ts:
1. Constructor accepts Map<string, LicensePayload> for valid licenses and optional config: { latencyMs?: number }
2. Implement verify():
   - Simulate latency with setTimeout/Promise wrapper if configured
   - Look up key in map, return { valid: true, payload } or { valid: false, error: 'Invalid license key' }
3. Implement activate():
   - Track activated keys in private Set<string> (key + instanceId combination)
   - Return true if key exists in map, false otherwise
4. Add helper methods for testing: getActivatedKeys(), reset()
5. Export from adapters index

### 4.3. Implement LemonSqueezyVerifier with Rate Limit Handling

**Status:** pending  
**Dependencies:** 4.1  

Create LemonSqueezyVerifier adapter that calls Lemon Squeezy License API with proper authentication, response parsing, and exponential backoff for 429 rate limit responses.

**Details:**

Create src/adapters/lemon-squeezy-verifier.ts:
1. Constructor accepts { apiKey: string, baseUrl?: string } for testability
2. Implement verify():
   - POST to https://api.lemonsqueezy.com/v1/licenses/validate
   - Headers: Authorization: Bearer {apiKey}, Content-Type: application/json
   - Body: { license_key: licenseKey }
   - Parse response: extract valid status, map to LicensePayload fields
3. Implement exponential backoff for 429:
   - Initial delay: 1s, max delay: 32s, max retries: 5
   - Use helper function withRetry() wrapping fetch
4. Handle errors: network failures return { valid: false, error: message }
5. Optionally implement activate() if Lemon Squeezy API supports it
6. Export from adapters index

### 4.4. Add CachedVerifier Wrapper with 24h TTL

**Status:** pending  
**Dependencies:** 4.1  

Create CachedVerifier decorator that wraps any LicenseVerifier, caches successful verifications for 24 hours to enable offline grace periods, and provides cache management methods.

**Details:**

Create src/adapters/cached-verifier.ts:
1. Constructor accepts LicenseVerifier instance and optional config: { ttlMs?: number } (default 24h = 86400000)
2. Use Map<string, { result: VerificationResult, cachedAt: number }> for cache storage
3. Implement verify():
   - Check cache first: if valid entry exists and not expired, return cached result
   - Only cache successful (valid: true) results
   - On network failure, return cached result if available (grace period)
4. Implement clearCache(): void to clear all cached entries
5. Implement clearKey(key: string): void for selective invalidation
6. Add getCacheStats() for debugging: { size, oldestEntry, newestEntry }
7. Delegate activate() to wrapped verifier without caching
8. Export from adapters index

### 4.5. Create Factory Function and Integration Tests

**Status:** pending  
**Dependencies:** 4.2, 4.3, 4.4  

Implement createVerifier() factory function that instantiates the appropriate verifier based on type parameter, and write comprehensive integration tests covering all adapter combinations.

**Details:**

1. Create src/adapters/factory.ts:
   - Define VerifierType = 'lemon-squeezy' | 'memory'
   - Define options types for each verifier
   - Implement createVerifier(type, opts): LicenseVerifier
   - Support wrapped option for automatic CachedVerifier wrapping
2. Update src/adapters/index.ts to export factory and all adapters
3. Update main src/index.ts to re-export adapter API
4. Create tests/adapters.test.ts with integration tests:
   - Factory returns correct type for each input
   - Full flow: create -> verify -> activate -> verify again (cached)
   - Test InMemory + Cached combination
   - Test error propagation through cache layer
5. Add JSDoc documentation to all public APIs
