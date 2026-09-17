# Task ID: 6

**Title:** Build Telemetry Cloudflare Worker Collector

**Status:** pending

**Dependencies:** 5

**Priority:** medium

**Description:** Create a Cloudflare Worker that receives telemetry batches, aggregates counts by venture/event/day, and stores in KV. Include a simple dashboard endpoint.

**Details:**

Implementation:
1. Create `packages/telemetry-collector/` or `infra/telemetry-worker/`:
   - wrangler.toml configuration
   - KV namespace binding for storage

2. Worker routes:
   - POST /ingest - receives batch, aggregates, stores
   - GET /stats?venture=X - returns counts for a venture
   - GET /health - simple health check

3. Storage schema in KV:
   - Key: `{venture}:{event}:{day}` e.g., `v1-contrast:install:2026-09-17`
   - Value: count (number)

4. Worker code:
```typescript
export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    
    if (request.method === 'POST' && url.pathname === '/ingest') {
      const events: TelemetryEvent[] = await request.json();
      for (const e of events) {
        const key = `${e.venture}:${e.event}:${e.day}`;
        const current = parseInt(await env.TELEMETRY.get(key) || '0');
        await env.TELEMETRY.put(key, String(current + e.count));
      }
      return new Response('ok');
    }
    
    if (url.pathname === '/stats') {
      const venture = url.searchParams.get('venture');
      const list = await env.TELEMETRY.list({ prefix: `${venture}:` });
      // Aggregate and return...
    }
  }
};
```

5. Rate limiting: use Cloudflare's built-in or simple IP tracking
6. Deploy script in package.json: `wrangler deploy`

**Test Strategy:**

1. Local test with wrangler dev: POST batch, verify KV updated.
2. Test aggregation: send same event twice, verify count increments.
3. Test stats endpoint returns correct structure.
4. Test invalid JSON returns 400.
5. Load test with 1000 events to verify performance.

## Subtasks

### 6.1. Set up Cloudflare Worker project with wrangler.toml and KV namespace binding

**Status:** pending  
**Dependencies:** None  

Initialize the Cloudflare Worker project structure with proper wrangler configuration and KV namespace binding for telemetry storage.

**Details:**

Create `packages/telemetry-collector/` directory with the following structure:

1. Initialize with `wrangler init` or manually create:
   - `wrangler.toml` with name, compatibility_date, and KV namespace binding:
     ```toml
     name = "telemetry-collector"
     main = "src/index.ts"
     compatibility_date = "2024-01-01"
     
     [[kv_namespaces]]
     binding = "TELEMETRY"
     id = "<production-namespace-id>"
     preview_id = "<preview-namespace-id>"
     ```
   - `src/index.ts` with basic worker skeleton and Env type definition
   - `package.json` with wrangler as dev dependency and TypeScript config
   - `tsconfig.json` configured for Cloudflare Workers environment

2. Define TypeScript types:
   ```typescript
   interface Env {
     TELEMETRY: KVNamespace;
   }
   
   interface TelemetryEvent {
     venture: string;
     event: string;
     day: string;
     count: number;
   }
   ```

3. Create KV namespace via Wrangler CLI: `wrangler kv:namespace create TELEMETRY`

4. Add workspace entry in root package.json if using monorepo structure.

### 6.2. Implement POST /ingest endpoint for batch processing and KV aggregation

**Status:** pending  
**Dependencies:** 6.1  

Build the main ingestion endpoint that receives telemetry event batches, validates input, and atomically increments counters in KV storage.

**Details:**

Implement the `/ingest` POST endpoint in `src/index.ts`:

1. Request handling:
   - Parse JSON body with try/catch for malformed input
   - Validate array structure and each event's required fields (venture, event, day, count)
   - Return 400 with descriptive error for invalid payloads

2. KV aggregation logic (handle concurrent writes carefully):
   ```typescript
   async function handleIngest(request: Request, env: Env): Promise<Response> {
     try {
       const events: TelemetryEvent[] = await request.json();
       
       // Validate events
       for (const e of events) {
         if (!e.venture || !e.event || !e.day || typeof e.count !== 'number') {
           return new Response('Invalid event format', { status: 400 });
         }
       }
       
       // Aggregate by key first to minimize KV operations
       const aggregated = new Map<string, number>();
       for (const e of events) {
         const key = `${e.venture}:${e.event}:${e.day}`;
         aggregated.set(key, (aggregated.get(key) || 0) + e.count);
       }
       
       // Update KV (note: not truly atomic, but acceptable for counters)
       for (const [key, increment] of aggregated) {
         const current = parseInt(await env.TELEMETRY.get(key) || '0', 10);
         await env.TELEMETRY.put(key, String(current + increment));
       }
       
       return new Response('ok', { status: 200 });
     } catch {
       return new Response('Invalid JSON', { status: 400 });
     }
   }
   ```

3. Note on atomicity: KV doesn't support atomic increments. For high-concurrency scenarios, document this limitation. Consider Durable Objects if exact counts are critical (out of scope for v1).

### 6.3. Implement GET /stats endpoint with prefix-based KV listing

**Status:** pending  
**Dependencies:** 6.1  

Create the stats endpoint that retrieves and aggregates telemetry data for a specific venture using KV prefix listing.

**Details:**

Implement the `/stats` GET endpoint:

1. Query parameter handling:
   - Required: `venture` parameter
   - Optional: `from` and `to` date filters (YYYY-MM-DD format)
   - Return 400 if venture is missing

2. KV listing and aggregation:
   ```typescript
   async function handleStats(request: Request, env: Env): Promise<Response> {
     const url = new URL(request.url);
     const venture = url.searchParams.get('venture');
     
     if (!venture) {
       return new Response('Missing venture parameter', { status: 400 });
     }
     
     const prefix = `${venture}:`;
     const result: Record<string, Record<string, number>> = {}; // event -> day -> count
     
     let cursor: string | undefined;
     do {
       const list = await env.TELEMETRY.list({ prefix, cursor });
       
       for (const key of list.keys) {
         const [, event, day] = key.name.split(':');
         const count = parseInt(await env.TELEMETRY.get(key.name) || '0', 10);
         
         if (!result[event]) result[event] = {};
         result[event][day] = count;
       }
       
       cursor = list.list_complete ? undefined : list.cursor;
     } while (cursor);
     
     return new Response(JSON.stringify(result), {
       headers: { 'Content-Type': 'application/json' },
     });
   }
   ```

3. Handle pagination for large datasets (KV list returns max 1000 keys per call)

4. Consider adding summary totals per event type in the response.

### 6.4. Add GET /health endpoint and rate limiting

**Status:** pending  
**Dependencies:** 6.1  

Implement health check endpoint for monitoring and add basic rate limiting to protect against abuse.

**Details:**

1. Health check endpoint:
   ```typescript
   async function handleHealth(env: Env): Promise<Response> {
     // Optionally verify KV is accessible
     try {
       await env.TELEMETRY.get('__health_check__');
       return new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), {
         headers: { 'Content-Type': 'application/json' },
       });
     } catch {
       return new Response(JSON.stringify({ status: 'degraded', error: 'KV unavailable' }), {
         status: 503,
         headers: { 'Content-Type': 'application/json' },
       });
     }
   }
   ```

2. Rate limiting options:
   - Option A: Use Cloudflare's built-in rate limiting rules (configured in dashboard/wrangler.toml)
   - Option B: Simple in-worker IP tracking using KV:
     ```typescript
     async function checkRateLimit(request: Request, env: Env): Promise<boolean> {
       const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
       const key = `ratelimit:${ip}:${Math.floor(Date.now() / 60000)}`; // per minute
       const count = parseInt(await env.TELEMETRY.get(key) || '0', 10);
       
       if (count >= 100) return false; // 100 requests per minute
       
       await env.TELEMETRY.put(key, String(count + 1), { expirationTtl: 120 });
       return true;
     }
     ```

3. Return 429 Too Many Requests when rate limit exceeded

4. Update main router to check rate limit before processing /ingest requests

5. Consider adding CORS headers if the worker will be called from browser contexts.

### 6.5. Write local tests with wrangler dev and create deployment script

**Status:** pending  
**Dependencies:** 6.2, 6.3, 6.4  

Create comprehensive local tests using wrangler dev, add deployment scripts, and document the deployment process.

**Details:**

1. Create test script `scripts/test-worker.ts` or use a test framework:
   ```typescript
   // Can be run with: npx tsx scripts/test-worker.ts
   // Requires wrangler dev running on localhost:8787
   
   const BASE_URL = 'http://localhost:8787';
   
   async function testIngest() {
     const response = await fetch(`${BASE_URL}/ingest`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify([
         { venture: 'test-venture', event: 'install', day: '2026-09-17', count: 1 },
         { venture: 'test-venture', event: 'install', day: '2026-09-17', count: 1 },
       ]),
     });
     console.assert(response.ok, 'Ingest should return 200');
   }
   
   async function testStats() {
     const response = await fetch(`${BASE_URL}/stats?venture=test-venture`);
     const data = await response.json();
     console.assert(data.install?.['2026-09-17'] === 2, 'Count should be aggregated');
   }
   
   async function testInvalidJson() {
     const response = await fetch(`${BASE_URL}/ingest`, {
       method: 'POST',
       body: 'not json',
     });
     console.assert(response.status === 400, 'Invalid JSON should return 400');
   }
   ```

2. Add package.json scripts:
   ```json
   {
     "scripts": {
       "dev": "wrangler dev",
       "deploy": "wrangler deploy",
       "deploy:preview": "wrangler deploy --env preview",
       "test": "wrangler dev & sleep 3 && npx tsx scripts/test-worker.ts",
       "tail": "wrangler tail"
     }
   }
   ```

3. Add environment configuration in wrangler.toml for staging/production

4. Document deployment in README.md:
   - Prerequisites (Cloudflare account, API token)
   - KV namespace setup steps
   - Environment variables needed
   - Deployment commands
