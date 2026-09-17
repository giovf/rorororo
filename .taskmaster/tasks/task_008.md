# Task ID: 8

**Title:** Create Launch Checklists

**Status:** pending

**Dependencies:** None

**Priority:** medium

**Description:** Write comprehensive markdown checklists for each distribution channel (Figma, Chrome, Web) covering store assets, listing copy, screenshots, privacy disclosures, and permissions justification.

**Details:**

Implementation:
1. Create `docs/launch/figma.md`:
   - [ ] Plugin icon (512x512 PNG)
   - [ ] Cover image (1920x960)
   - [ ] Plugin name (≤50 chars)
   - [ ] Tagline (≤100 chars)
   - [ ] Description (features, use cases)
   - [ ] Categories selected
   - [ ] Screenshots (3-5, showing UI)
   - [ ] Privacy policy URL
   - [ ] Support email
   - [ ] Pricing configured in Figma Community
   - [ ] Test on Figma desktop and web
   - [ ] venture.json updated to 'launched'
   - [ ] Ledger updated with any costs

2. Create `docs/launch/chrome.md`:
   - [ ] Extension icons (16, 48, 128 PNG)
   - [ ] Promo images (small 440x280, large 920x680, marquee 1400x560)
   - [ ] Store listing name
   - [ ] Summary (≤132 chars)
   - [ ] Description
   - [ ] Category
   - [ ] Screenshots (1280x800 or 640x400)
   - [ ] Permissions justification for each permission
   - [ ] Privacy policy URL
   - [ ] Single purpose description
   - [ ] Host permissions justified
   - [ ] $5 developer fee paid (ledger)
   - [ ] Test on Chrome stable
   - [ ] manifest.json version bumped

3. Create `docs/launch/web.md`:
   - [ ] Landing page deployed
   - [ ] Merchant of record account active
   - [ ] Product created in MoR dashboard
   - [ ] Webhook configured for license delivery
   - [ ] Privacy policy page live
   - [ ] Terms of service page live
   - [ ] Test purchase flow end-to-end
   - [ ] Email delivery verified

**Test Strategy:**

1. Review each checklist for completeness against platform documentation.
2. Create dummy venture and walk through checklist, verify no gaps.
3. Cross-reference with official store guidelines (Figma, Chrome) for accuracy.
4. Get feedback after first real submission, update checklists.

## Subtasks

### 8.1. Create docs/launch directory structure

**Status:** pending  
**Dependencies:** None  

Initialize the docs/launch directory to house all platform-specific launch checklists

**Details:**

Create the docs/launch/ directory if it doesn't exist. This directory will contain the three markdown checklist files for Figma, Chrome, and Web distribution channels. Verify the directory is properly tracked in version control.

### 8.2. Write Figma Community launch checklist

**Status:** pending  
**Dependencies:** 8.1  

Create comprehensive docs/launch/figma.md checklist covering all Figma plugin submission requirements

**Details:**

Create docs/launch/figma.md with organized sections for: Assets (plugin icon 512x512 PNG, cover image 1920x960), Listing Copy (plugin name ≤50 chars, tagline ≤100 chars, description with features/use cases, categories), Media (3-5 screenshots showing UI), Compliance (privacy policy URL, support email), Pricing (Figma Community pricing config), Testing (desktop and web verification), Post-Launch (venture.json status update, ledger entry for any costs). Use GitHub-flavored markdown checkboxes.

### 8.3. Write Chrome Web Store launch checklist

**Status:** pending  
**Dependencies:** 8.1  

Create comprehensive docs/launch/chrome.md checklist covering all Chrome extension submission requirements

**Details:**

Create docs/launch/chrome.md with organized sections for: Icons (16, 48, 128 PNG), Promotional Images (small 440x280, large 920x680, marquee 1400x560), Store Listing (name, summary ≤132 chars, description, category), Screenshots (1280x800 or 640x400), Permissions (justification for each permission, host permissions justification, single purpose description), Compliance (privacy policy URL), Fees ($5 developer fee with ledger entry), Technical (manifest.json version bump, Chrome stable testing). Include guidance on permission justification best practices.

### 8.4. Write Web/SaaS launch checklist

**Status:** pending  
**Dependencies:** 8.1  

Create comprehensive docs/launch/web.md checklist for direct web distribution with payment processing

**Details:**

Create docs/launch/web.md with organized sections for: Infrastructure (landing page deployment verification), Payment Setup (merchant of record account activation, product creation in MoR dashboard, webhook configuration for license delivery), Legal Pages (privacy policy live at correct URL, terms of service live at correct URL), Testing (end-to-end purchase flow, email delivery verification, refund flow if applicable), Analytics (tracking configured). Reference the landing package from Task 7 for template usage.

### 8.5. Add cross-references and usage instructions

**Status:** pending  
**Dependencies:** 8.2, 8.3, 8.4  

Add header sections to each checklist explaining usage, link them together, and ensure consistency

**Details:**

Add a consistent header to each checklist file explaining: how to use the checklist (copy to issue/PR, check items as completed), when to use it (before submission), links to official platform documentation, cross-references to other checklists if multi-platform launch. Add a brief index or README note in docs/launch/ if helpful. Ensure consistent formatting, checkbox style, and section organization across all three files. Verify ledger entry reminders are present where costs occur.
