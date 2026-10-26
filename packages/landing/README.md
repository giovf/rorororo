# @foundry/landing

Static site for foundry's public presence: product list, privacy policy, terms and
refund policy. Required by merchant-of-record applications and store listings.

- `site/` is deployed as-is to GitHub Pages by `.github/workflows/pages.yml` on every push
  to `main` (and on manual dispatch). No build step yet — task 7 upgrades this to Astro
  rendering from venture manifests.
- Support address: info@gankdat.com (owner's Resend-backed domain).
- `/diligence` (2026-10-26, hackathons `meta-global-ai-hackathon-entry`): the Meta Global AI Developer
  Hackathon entry — a public counterparty-check page that runs Muse Spark on Meta Model API over
  gankdat's seven UK registers through MCP and streams the report (`src/diligence.ts`, loop in
  `src/diligence-core.ts`, also the CLI `scripts/meta-diligence-agent.ts`). Secrets `DILIGENCE_API_KEY`
  (set by the landing workflow from the `META_MODEL_API_KEY` repository secret, owner action 032) and
  the optional `DILIGENCE_GANKDAT_KEY`; vars `DILIGENCE_BASE_URL`, `DILIGENCE_MODEL`. Caps in KV: six
  checks an hour per visitor, 150 a day.
