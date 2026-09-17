# Task ID: 14

**Title:** V2 Chrome Extension Build and Launch

**Status:** pending

**Dependencies:** 4, 7, 8, 13

**Priority:** medium

**Description:** Build V2 Chrome extension using WXT framework with freemium model, integrate @foundry/licensing for paywall, deploy landing page from template, and submit to Chrome Web Store.

**Details:**

Implementation:
1. Create `ventures/v2/` workspace:
   - Initialize with WXT: `npm create wxt@latest`
   - Configure for Chrome MV3
   - Add @foundry/licensing, @foundry/telemetry deps

2. Extension structure (WXT):
```
ventures/v2/
├── src/
│   ├── entrypoints/
│   │   ├── background.ts
│   │   ├── content.ts (if needed)
│   │   └── popup/
│   │       ├── index.html
│   │       └── main.ts
│   ├── core/           # Business logic
│   └── utils/
├── wxt.config.ts
├── package.json
└── venture.json
```

3. Freemium implementation:
   - Free tier: limited uses per day (stored in chrome.storage)
   - Paywall: show upgrade prompt at limit
   - License check: call @foundry/licensing with cached verification
   - Unlock: paste license key in popup, verify, store

4. Landing page:
   - Copy packages/landing template to ventures/v2/landing
   - Configure with V2 manifest
   - Deploy to Cloudflare Pages

5. Chrome Web Store submission:
   - Complete docs/launch/chrome.md checklist
   - $5 developer fee (owner action)
   - Submit for review

6. Post-launch:
   - Update manifest, ledger
   - Enable telemetry
   - Set 30-day review

**Test Strategy:**

1. Test extension in Chrome with fresh profile.
2. Test free tier limit triggers correctly.
3. Test license key entry and verification flow.
4. Test offline mode with cached license.
5. Verify landing page renders correctly.
6. Check all permissions are justified.

## Subtasks

### 14.1. Create ventures/v2 workspace with WXT framework initialization for Chrome MV3

**Status:** pending  
**Dependencies:** None  

Initialize the V2 Chrome extension workspace using WXT framework with proper npm workspace integration and Chrome Manifest V3 configuration.

**Details:**

1. Run `npm create wxt@latest ventures/v2` to scaffold WXT project
2. Configure wxt.config.ts for Chrome MV3 target (manifest_version: 3)
3. Update root package.json to include ventures/v2 in workspaces array
4. Add @foundry/licensing and @foundry/telemetry as workspace dependencies in ventures/v2/package.json
5. Create venture.json with defineVenture() compliant structure: slug='v2', channel='chrome-web-store', status='building', pricing freemium model
6. Run npm install from root to link workspace
7. Verify wxt dev and wxt build commands work

### 14.2. Implement core extension functionality (background, content scripts, popup)

**Status:** pending  
**Dependencies:** 14.1  

Build the core extension entry points following WXT conventions: background service worker, content script (if needed), and popup UI with main.ts entry.

**Details:**

1. Create src/entrypoints/background.ts with chrome.runtime listeners for lifecycle events
2. Create src/entrypoints/popup/index.html with minimal HTML shell
3. Create src/entrypoints/popup/main.ts with TypeScript entry point
4. Create src/core/ directory for business logic (keep UI and logic separate)
5. Create src/utils/ for shared helpers
6. Add content.ts only if page injection is needed (avoid unless required for V2 feature)
7. Configure proper permissions in wxt.config.ts (minimal required set)
8. Implement the core V2 feature logic in src/core/ based on validated direction from Task 13

### 14.3. Integrate @foundry/licensing for freemium paywall with chrome.storage persistence

**Status:** pending  
**Dependencies:** 14.1, 14.2  

Implement freemium model with daily usage limits stored in chrome.storage.local, license key verification via @foundry/licensing, and upgrade prompt flow.

**Details:**

1. Import verifyLicenseKey from @foundry/licensing
2. Create src/core/usage.ts: track daily usage count in chrome.storage.local with date-based reset
3. Define FREE_TIER_LIMIT constant (e.g., 5 uses per day)
4. Create src/core/license.ts: store/retrieve license key from chrome.storage.sync, cache verification result
5. Implement checkAccess() function: returns 'free' | 'paid' | 'limit-reached'
6. Create upgrade prompt UI component in popup showing remaining uses and upgrade CTA
7. Add license key input field in popup settings for users to paste and verify keys
8. Handle offline verification using @foundry/licensing cached signature validation
9. Show unlock success/error feedback after key entry

### 14.4. Integrate @foundry/telemetry for anonymous usage tracking

**Status:** pending  
**Dependencies:** 14.1, 14.2  

Add opt-in telemetry using @foundry/telemetry package to track funnel events (install, activate, limit-hit, upgrade, daily-use).

**Details:**

1. Import telemetry functions from @foundry/telemetry
2. Create src/core/telemetry.ts wrapper with venture='v2' context
3. Track events: 'install' (on first run), 'activate' (on feature use), 'limit-reached' (when free cap hit), 'license-entered' (on key entry)
4. Implement opt-in consent flow in popup (default off, toggle in settings)
5. Store telemetry preference in chrome.storage.sync
6. Only send events when user has opted in
7. Ensure events are anonymous ({venture, event, day} only, no PII)
8. Handle offline: queue events and send on reconnect or drop gracefully

### 14.5. Copy and configure packages/landing template for V2 landing page deployment

**Status:** pending  
**Dependencies:** 14.1  

Set up the V2 landing page using the packages/landing Astro template, configure with venture manifest data, and deploy to Cloudflare Pages.

**Details:**

1. Copy packages/landing template to ventures/v2/landing/ directory
2. Update package.json name to @foundry/v2-landing
3. Configure landing page with V2 venture manifest data (name, pricing, thesis)
4. Create feature highlight sections based on V2 functionality
5. Add Chrome Web Store badge/link (placeholder until store listing exists)
6. Configure Cloudflare Pages deployment in wrangler.toml or via dashboard
7. Set up custom domain if available, otherwise use pages.dev subdomain
8. Add privacy policy and refund policy pages (required for store compliance)
9. Test build: npm run build in ventures/v2/landing/

### 14.6. Complete docs/launch/chrome.md checklist and create store assets

**Status:** pending  
**Dependencies:** 14.2, 14.3, 14.4  

Create Chrome Web Store launch checklist and prepare all required store listing assets: icons, screenshots, descriptions, and privacy policy.

**Details:**

1. Create docs/launch/chrome.md with complete submission checklist
2. Generate extension icons: 16x16, 48x48, 128x128 PNG files in ventures/v2/public/
3. Create 1280x800 and 440x280 promotional screenshots showing key features
4. Write short description (132 chars max) and detailed description (up to 16k chars)
5. Identify primary category (Productivity or Shopping based on V2 direction)
6. Document all permissions with justifications (shown to users during install)
7. Create privacy policy URL (link to landing page privacy policy)
8. Prepare support URL and support email
9. Fill in single purpose statement (required by Chrome)
10. Review Chrome Web Store Developer Program Policies for compliance

### 14.7. Handle $5 developer fee owner action and submit to Chrome Web Store

**Status:** pending  
**Dependencies:** 14.6  

Coordinate with owner for Chrome Web Store developer registration fee ($5), then submit extension for review following the launch checklist.

**Details:**

1. Update docs/LEDGER.md: convert planned row for Chrome dev fee to cost once paid
2. Document owner-action request: 'Pay $5 Chrome Web Store developer registration'
3. Wait for owner confirmation of account creation
4. Receive Chrome Web Store developer account access or credentials
5. Create new extension item in Chrome Web Store Developer Dashboard
6. Upload built extension zip (wxt build output)
7. Fill in all store listing fields from docs/launch/chrome.md checklist
8. Upload icons and screenshots
9. Submit for review
10. Monitor review status (typically 1-3 business days)
11. Address any reviewer feedback if rejected

### 14.8. Update venture.json, ledger, enable telemetry and set 30-day review

**Status:** pending  
**Dependencies:** 14.7  

Post-launch housekeeping: update venture status to 'launched', record any costs in ledger, enable production telemetry, and schedule 30-day performance review.

**Details:**

1. Update ventures/v2/venture.json: status='launched', statusChangedOn=<launch date>
2. Run npm run check to validate updated manifest
3. Update docs/LEDGER.md with any additional costs incurred during launch
4. Verify telemetry endpoint is receiving events from production extension
5. Create ventures/v2/RESEARCH.md entry documenting: launch date, initial metrics targets, 30-day review criteria
6. Define success metrics: install count, DAU, conversion rate targets
7. Set calendar reminder or task for 30-day review
8. Document escalation path: when to consider killing vs doubling down
9. Commit all updates with clear message: 'chore(v2): mark launched, enable telemetry'
