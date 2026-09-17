# Task ID: 12

**Title:** V1 Figma Plugin Launch

**Status:** pending

**Dependencies:** 8, 11

**Priority:** high

**Description:** Prepare all store assets per the launch checklist, submit V1 for Figma Community review, update venture.json status, and record in ledger.

**Details:**

Launch process:
1. Complete `docs/launch/figma.md` checklist:
   - Create 512x512 icon (consistent brand style)
   - Create 1920x960 cover image
   - Write compelling store copy:
     - Name: [Product Name] (≤50 chars)
     - Tagline: [One-liner value prop] (≤100 chars)
     - Description: Problem, solution, features, how it works
   - Capture 3-5 screenshots showing key flows
   - Select appropriate categories

2. Figma Community submission:
   - Navigate to Figma > Resources > Publish
   - Upload all assets
   - Configure pricing (one-time or subscription)
   - Set privacy policy URL (from landing page)
   - Submit for review

3. Post-submission:
   - Update `ventures/v1/venture.json`:
     ```json
     {
       "status": "launched",
       "statusChangedOn": "2026-09-XX"
     }
     ```
   - Run `scripts/portfolio.ts` to verify
   - Update ledger with any costs (usually £0 for Figma)

4. Set 30-day review reminder:
   - Create `ventures/v1/METRICS.md` to track:
     - Installs, paid conversions, revenue
     - Review feedback
     - Bugs/issues reported

**Test Strategy:**

1. Verify all checklist items completed before submission.
2. Test plugin one more time in fresh Figma file.
3. Proofread all store copy.
4. Verify privacy policy URL works.
5. Screenshot submission confirmation for records.

## Subtasks

### 12.1. Complete Figma Community store assets and listing copy

**Status:** pending  
**Dependencies:** None  

Create all required visual assets and write compelling store copy following the docs/launch/figma.md checklist.

**Details:**

Create visual assets:
- 512x512 PNG plugin icon with consistent brand style
- 1920x960 cover image showcasing the plugin's value proposition
- Capture 3-5 screenshots demonstrating key plugin flows and UI

Write store copy:
- Plugin name (≤50 characters): Clear, descriptive, searchable
- Tagline (≤100 characters): One-liner value proposition
- Full description: Problem statement, solution overview, feature list, usage instructions

Select appropriate Figma Community categories that match the plugin's functionality. Store all assets in ventures/v1/assets/ directory for reference. Mark each item complete in docs/launch/figma.md as finished.

### 12.2. Submit plugin to Figma Community and verify acceptance

**Status:** pending  
**Dependencies:** 12.1  

Submit the V1 plugin to Figma Community with all assets, configure pricing, and confirm successful submission.

**Details:**

Submission process (manual steps for owner):
1. Navigate to Figma > Resources > Publish
2. Upload all prepared assets (icon, cover, screenshots)
3. Enter all store copy (name, tagline, description)
4. Configure pricing strategy:
   - One-time purchase or subscription model
   - Set price point based on RESEARCH.md competitive analysis
5. Set privacy policy URL (from landing page if exists, or standard URL)
6. Add support contact email
7. Submit for Figma review

Capture screenshot of submission confirmation for records. Monitor email for Figma review response. If rejected, address feedback and resubmit. Note: This is primarily a manual process through Figma's interface - document steps taken for future ventures.

### 12.3. Update venture status, ledger, and create metrics tracking

**Status:** pending  
**Dependencies:** 12.2  

Update ventures/v1/venture.json to 'launched' status, record any costs in docs/LEDGER.md, and create ventures/v1/METRICS.md for tracking performance.

**Details:**

Post-launch updates:
1. Update ventures/v1/venture.json:
   - Set status to 'launched'
   - Set statusChangedOn to current date (ISO format)
   - Verify with npm run check

2. Update docs/LEDGER.md:
   - Record any costs (typically £0 for Figma Community)
   - Add line item with date, venture, amount, description

3. Create ventures/v1/METRICS.md with tracking template:
   - Installs (weekly snapshots)
   - Paid conversions / revenue
   - Review ratings and feedback summary
   - Bugs/issues reported
   - Set 30-day review reminder note

4. Run scripts/portfolio.ts to verify portfolio listing is updated correctly.
