# Task ID: 7

**Title:** Create Landing Page Astro Template

**Status:** pending

**Dependencies:** None

**Priority:** medium

**Description:** Build packages/landing as an Astro template that generates product page, pricing, privacy policy, and terms from a venture.json manifest. Must be deployable to Cloudflare Pages/GitHub Pages at zero cost.

**Details:**

Implementation:
1. Create `packages/landing/` with Astro:
   - `npm create astro@latest` with blank template
   - Configure for static output (adapter: none)
   - TypeScript strict mode

2. Template pages that read from a manifest:
   - src/pages/index.astro - Hero, features, CTA
   - src/pages/pricing.astro - Pricing table from manifest
   - src/pages/privacy.astro - Generated privacy policy
   - src/pages/terms.astro - Generated terms of service

3. Configuration:
```typescript
// astro.config.mjs
export default defineConfig({
  output: 'static',
  site: 'https://example.com',
});

// src/config.ts
import manifest from '../../venture.json';
export const venture = manifest as VentureManifest;
```

4. Components:
   - Hero.astro - Title, tagline, install/buy button
   - PricingCard.astro - Shows pricing from manifest
   - Footer.astro - Links to privacy, terms

5. Styling: Tailwind CSS (minimal, fast)

6. Deploy script: `npm run build && wrangler pages deploy dist`

7. Privacy policy template includes:
   - No PII collection
   - Telemetry opt-in disclosure
   - Contact email from manifest

**Test Strategy:**

1. Create test manifest, run astro build, verify all pages generated.
2. Verify no 404s for privacy, terms, pricing links.
3. Test pricing displays correctly for one-time and subscription models.
4. Test responsive design on mobile viewport.
5. Lighthouse audit: target 90+ performance score.

## Subtasks

### 7.1. Initialize Astro project in packages/landing with static output and TypeScript strict mode

**Status:** pending  
**Dependencies:** None  

Create the base Astro project structure using the blank template, configure for static site generation without any server adapter, and enable TypeScript strict mode. Set up the workspace package.json with correct build scripts.

**Details:**

Run `npm create astro@latest packages/landing -- --template blank --typescript strict --no-install` or manually scaffold. Configure astro.config.mjs with `output: 'static'` (no adapter needed). Create tsconfig.json extending @astrojs/tsconfig with strict: true. Set up package.json with name '@foundry/landing', scripts for dev/build/preview. Add to root workspaces. Ensure Node 22 compatibility. Target structure:

packages/landing/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── src/
│   └── env.d.ts

### 7.2. Create base layout and configuration to read from venture.json manifest

**Status:** pending  
**Dependencies:** 7.1  

Build the configuration layer that imports and types the venture.json manifest, create a base Layout.astro component with HTML structure, and set up shared TypeScript types for use across all pages.

**Details:**

Create src/config.ts that imports from a configurable path (default ../../venture.json) and re-exports typed VentureManifest from @foundry/core. Create src/layouts/Layout.astro with: <!DOCTYPE html>, <html lang>, <head> with charset, viewport, title from manifest.name, favicon placeholder, slot for styles. <body> with <slot/> for content. Add @foundry/core as dependency in package.json. Create src/types.ts if additional landing-specific types needed. Handle case where manifest doesn't exist with helpful build error. Example config.ts:

import type { VentureManifest } from '@foundry/core';
import manifest from '../../venture.json';
export const venture = manifest as VentureManifest;

### 7.3. Build index.astro with Hero and feature sections

**Status:** pending  
**Dependencies:** 7.2  

Create the main landing page (index.astro) with a Hero component displaying product name, tagline/thesis, and primary CTA button. Add a Features section placeholder that can be populated from manifest data.

**Details:**

Create src/pages/index.astro importing Layout and venture config. Create src/components/Hero.astro with props: title (string), tagline (string), ctaText (string), ctaHref (string). Hero displays: large heading (h1) with title, subheading with tagline, primary button/link for CTA. Style with semantic HTML classes for Tailwind later. Add simple Features section showing key value props (can be hardcoded initially or from manifest if schema extended). Include navigation links to /pricing, /privacy, /terms in a simple nav or header. Footer.astro component with copyright, link to privacy/terms. Pass venture.name, venture.thesis to Hero. CTA should link to channel-appropriate destination (Chrome store, Figma, etc).

### 7.4. Create pricing.astro with PricingCard component for one-time/subscription models

**Status:** pending  
**Dependencies:** 7.2  

Build the pricing page that reads pricing model from venture.json and displays appropriate pricing cards. Handle all three pricing kinds: one-time purchase, subscription (monthly/yearly), and free tier.

**Details:**

Create src/pages/pricing.astro using Layout. Create src/components/PricingCard.astro that accepts PricingModel type and renders appropriately:

- kind: 'free' → Show 'Free' with no cost, CTA 'Get Started'
- kind: 'one-time' → Show '$X' one-time, CTA 'Buy Now'
- kind: 'subscription' → Show '$X/mo' or toggle for '$X/mo' vs '$Y/yr (save Z%)'

PricingCard should include: price display, billing period, feature list placeholder, CTA button. Use TypeScript narrowing on pricing.kind for type safety. Add visual styling hooks (classes) for Tailwind. Page should have heading 'Pricing', single card for MVP (manifest defines one pricing model). Include money-back guarantee or no-commitment text if applicable.

### 7.5. Generate privacy.astro and terms.astro from templates with manifest interpolation

**Status:** pending  
**Dependencies:** 7.2  

Create privacy policy and terms of service pages using template content that interpolates venture-specific data (product name, contact email, effective date). Include standard no-PII-collection clauses and telemetry opt-in disclosure.

**Details:**

Create src/pages/privacy.astro with templated legal content. Include sections: What We Collect (no PII, anonymous usage if telemetry), How We Use Data, Data Retention, Your Rights, Contact Us. Interpolate: {venture.name}, contact email (add to VentureManifest or use placeholder), current date for 'Last updated'. Create src/pages/terms.astro with: Acceptance, License Grant, Restrictions, Disclaimers, Limitation of Liability, Governing Law, Contact. Both pages use Layout, have clear headings, readable prose styling hooks. Add telemetry opt-in disclosure: 'Anonymous usage statistics may be collected to improve the product. This is opt-in and can be disabled in settings.' Note: May need to extend VentureManifest with contactEmail or supportUrl field. Use venture.name throughout for product references.

### 7.6. Add Tailwind CSS, configure Cloudflare Pages deployment, and verify Lighthouse scores

**Status:** pending  
**Dependencies:** 7.3, 7.4, 7.5  

Integrate Tailwind CSS for styling, apply minimal responsive design to all components, create deployment configuration for Cloudflare Pages/GitHub Pages, and optimize for Lighthouse 90+ performance score.

**Details:**

Install @astrojs/tailwind integration: `npx astro add tailwind`. Configure tailwind.config.mjs with content paths. Apply Tailwind classes to all components: Hero (responsive text sizing, centered layout, button styles), PricingCard (card shadow, border, padding, responsive), Footer (muted colors, centered), Layout (max-width container, font-stack). Add wrangler.toml for Cloudflare Pages or configure in package.json scripts. Add deploy script: `astro build && wrangler pages deploy dist --project-name <name>`. Alternatively configure for GitHub Pages with base path. Performance optimizations: ensure no render-blocking CSS, minimal JS, preload fonts if used, optimize images. Add meta description, OG tags for SEO. Run Lighthouse audit, target 90+ on Performance, Accessibility, Best Practices, SEO. Fix any issues found.
