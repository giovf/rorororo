# Launch checklist — Chrome Web Store extension

## Build & code
- [ ] Manifest V3; permissions minimal and each justified in the listing's
      "permissions justification" field; no remote code; no broad host permissions
      unless the feature needs them.
- [ ] `npm run check` green; production build zipped from `dist/` only.
- [ ] Manual test in a fresh Chrome profile, free and licensed states.
- [ ] Privacy: single-purpose statement; data-use disclosure filled truthfully
      (what is collected, whether it leaves the device); privacy policy URL
      https://giovf.github.io/rorororo/privacy.html.

## Licensing (Stripe Managed Payments + @foundry/licensing)
- [x] Licence worker deployed at https://foundry-licenses.faceless-api.workers.dev; `LICENSE_SERVER` set (2026-09-18).
- [x] Payment Link https://buy.stripe.com/6oUdR2gdfcOtaJU22aefC00 (metadata venture=read-focus); webhook we_1UH12N31BoD8QU62rlTnQpiX → worker → key by email (2026-09-18).
- [ ] Extension verifies the key offline; grace period on verification failure.
- [ ] Refund policy linked; licence terms stated ("per person, your devices").

## Listing
- [ ] Icon 128×128; screenshots 1280×800 (min 1, aim 5); optional promo tile 440×280.
- [ ] Name ≤ 45 chars, front-loaded with the searched term; summary ≤ 132 chars.
- [ ] Category, language, support email `info@gankdat.com`, website link.
- [ ] ★ Trader account details complete (name, address, phone shown publicly).

## Submit & after
- [ ] ★ Upload zip in the developer dashboard; submit for review (typically 1–3 days).
- [ ] Record in `venture.json` / `docs/LEDGER.md`; day 1/7/30 metrics in `RESEARCH.md`.
