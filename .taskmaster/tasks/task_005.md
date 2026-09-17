# Task ID: 5

**Title:** Build Telemetry Package Client

**Status:** pending

**Dependencies:** None

**Priority:** medium

**Description:** Create packages/telemetry with a privacy-safe, opt-in telemetry client that batches events and posts to a configurable endpoint. No PII, just venture/event/day counts.

**Details:**

Implementation:
1. Create `packages/telemetry/` workspace with standard structure

2. Event model (privacy-safe):
```typescript
interface TelemetryEvent {
  venture: string;   // product slug
  event: string;     // 'install' | 'activate' | 'paywall_view' | 'upgrade'
  day: string;       // YYYY-MM-DD (UTC)
  count: number;     // always 1 from client
}

interface TelemetryConfig {
  endpoint: string;
  venture: string;
  enabled: boolean;  // opt-in flag
  batchInterval?: number;  // ms, default 30000
}
```

3. Client implementation:
```typescript
export class TelemetryClient {
  private queue: TelemetryEvent[] = [];
  
  constructor(private config: TelemetryConfig) {
    if (config.enabled) {
      setInterval(() => this.flush(), config.batchInterval ?? 30000);
    }
  }
  
  track(event: string): void {
    if (!this.config.enabled) return;
    this.queue.push({
      venture: this.config.venture,
      event,
      day: new Date().toISOString().slice(0, 10),
      count: 1
    });
  }
  
  async flush(): Promise<void> {
    if (!this.queue.length) return;
    const batch = this.queue.splice(0, 100);
    await fetch(this.config.endpoint, {
      method: 'POST',
      body: JSON.stringify(batch)
    });
  }
}
```

4. Export singleton factory: `createTelemetry(config)`
5. Ensure no PII is ever collected (no user IDs, IPs, etc.)

**Test Strategy:**

1. Create client with enabled=false, call track(), verify no queue buildup.
2. Create enabled client, track events, verify queue contains correctly shaped events.
3. Mock fetch, call flush(), verify POST body matches expected format.
4. Test batch interval fires and clears queue.
5. Verify no PII fields exist in any event shape.

## Subtasks

### 5.1. Create packages/telemetry workspace with TelemetryEvent and TelemetryConfig types

**Status:** pending  
**Dependencies:** None  

Initialize the telemetry package workspace following packages/core conventions. Create package.json, tsconfig.json, and define the privacy-safe TelemetryEvent and TelemetryConfig TypeScript interfaces.

**Details:**

1. Create `packages/telemetry/` directory structure:
   - package.json with name `@foundry/telemetry`, type: module, exports matching packages/core pattern
   - tsconfig.json extending root config
   - src/ directory for source files

2. Create `src/types.ts` with privacy-safe types:
   ```typescript
   export interface TelemetryEvent {
     venture: string;   // product slug
     event: string;     // 'install' | 'activate' | 'paywall_view' | 'upgrade'
     day: string;       // YYYY-MM-DD (UTC)
     count: number;     // always 1 from client
   }

   export interface TelemetryConfig {
     endpoint: string;
     venture: string;
     enabled: boolean;  // opt-in flag
     batchInterval?: number;  // ms, default 30000
   }
   ```

3. Create `src/index.ts` exporting types (will add more exports in subsequent subtasks)

4. CRITICAL: Verify no PII fields exist - no userId, email, IP, deviceId, or any identifying information in event shape

### 5.2. Implement TelemetryClient class with queue management and track() method

**Status:** pending  
**Dependencies:** 5.1  

Build the TelemetryClient class with internal event queue, opt-in enabled check, and track() method that adds privacy-safe events to the queue.

**Details:**

1. Create `src/client.ts` with TelemetryClient class:
   ```typescript
   export class TelemetryClient {
     private queue: TelemetryEvent[] = [];
     private intervalId: ReturnType<typeof setInterval> | null = null;
     
     constructor(private config: TelemetryConfig) {
       if (config.enabled) {
         this.intervalId = setInterval(() => this.flush(), config.batchInterval ?? 30000);
       }
     }
     
     track(event: string): void {
       if (!this.config.enabled) return;
       this.queue.push({
         venture: this.config.venture,
         event,
         day: new Date().toISOString().slice(0, 10),
         count: 1
       });
     }
     
     // flush() to be implemented in next subtask
   }
   ```

2. Handle disabled state gracefully - track() should be a no-op when enabled=false

3. Use UTC date formatting for day field (toISOString gives UTC)

4. Store intervalId for potential cleanup/destroy method

### 5.3. Add flush() method with batching and POST to configured endpoint

**Status:** pending  
**Dependencies:** 5.2  

Implement the flush() method that batches events from the queue and POSTs them to the configured endpoint, with proper error handling and queue management.

**Details:**

1. Add flush() method to TelemetryClient:
   ```typescript
   async flush(): Promise<void> {
     if (!this.queue.length || !this.config.enabled) return;
     const batch = this.queue.splice(0, 100);  // limit batch size
     try {
       await fetch(this.config.endpoint, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(batch)
       });
     } catch {
       // On failure, events are lost - this is acceptable for telemetry
       // to avoid queue buildup and memory issues
     }
   }
   ```

2. Key decisions:
   - Batch size limit of 100 events per flush
   - Fire-and-forget on errors (no retry queue - prevents unbounded memory)
   - Check enabled flag in flush too for safety
   - Use splice to atomically remove events from queue

3. Add optional destroy() method to clear interval:
   ```typescript
   destroy(): void {
     if (this.intervalId) {
       clearInterval(this.intervalId);
       this.intervalId = null;
     }
   }
   ```

### 5.4. Implement createTelemetry() singleton factory and add unit tests

**Status:** pending  
**Dependencies:** 5.3  

Create the singleton factory function for creating TelemetryClient instances, export public API from index.ts, and write comprehensive unit tests.

**Details:**

1. Create singleton factory in `src/factory.ts`:
   ```typescript
   let instance: TelemetryClient | null = null;
   
   export function createTelemetry(config: TelemetryConfig): TelemetryClient {
     if (!instance) {
       instance = new TelemetryClient(config);
     }
     return instance;
   }
   
   // For testing purposes only
   export function resetTelemetry(): void {
     if (instance) {
       instance.destroy();
       instance = null;
     }
   }
   ```

2. Update `src/index.ts` to export full public API:
   ```typescript
   export { TelemetryEvent, TelemetryConfig } from './types.js';
   export { TelemetryClient } from './client.js';
   export { createTelemetry, resetTelemetry } from './factory.js';
   ```

3. Create `src/client.test.ts` with comprehensive tests:
   - Test disabled client behavior
   - Test track() adds events correctly
   - Test flush() with mocked fetch
   - Test batch interval fires
   - Test singleton factory returns same instance
   - Test resetTelemetry() for test isolation

4. Final review: ensure no PII can leak through any code path
