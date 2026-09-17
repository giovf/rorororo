# @foundry/landing

Static site for foundry's public presence: product list, privacy policy, terms and
refund policy. Required by merchant-of-record applications and store listings.

- `site/` is deployed as-is to GitHub Pages by `.github/workflows/pages.yml` on every push
  to `main` (and on manual dispatch). No build step yet — task 7 upgrades this to Astro
  rendering from venture manifests.
- Replace `CONTACT_EMAIL` (3 files) with the support address before the URL is shared.
