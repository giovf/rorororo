# Launch checklist — Figma Community plugin

Run top to bottom before every submission. Owner does the starred (★) steps.

## Build & code
- [ ] `npm run check` green; `npm run build:release -w @foundry/<venture>` produces `dist/` with a manifest that has **no** testing-only menu commands.
- [ ] `manifest.json`: real plugin `id`; `documentAccess: "dynamic-page"`; `networkAccess`
      lists only domains actually used (`none` if none); `permissions` only what's used.
- [ ] Manual test checklist (`TESTING.md`) passed in Figma desktop, free **and** paid state.
- [ ] Free-trial wording: description states exactly what is free and what the unlock adds
      (Figma requires this when the trial is customised).
- [ ] No console errors on open, on an empty page, on a page with widgets/FigJam nodes.

## Listing assets
- [ ] Icon 128×128 PNG (no text, readable at 32px).
- [ ] Cover 1920×960 PNG (safe area centre 1600×800). Shows the plugin doing its job.
- [ ] 3–5 screenshots or a 15–30 s GIF of the core flow.
- [ ] Name ≤ 40 chars, front-loaded with the searched term (e.g. "Variables Toolkit — …").
- [ ] Tagline ≤ 100 chars: the outcome, not the feature.
- [ ] Description: first line = the job; then bullets per feature; "Free vs unlock" section;
      "Privacy: runs entirely in your file, no network"; support email `info@gankdat.com`;
      link to https://giovf.github.io/rorororo/terms.html for refunds.
- [ ] Tags/category chosen (Design tools / Design systems); editor type Figma Design only.

## Payments (Figma checkout)
- [ ] ★ Creator payout (Stripe) complete in Figma profile.
- [ ] Price set (whole USD, ≥ $2); one-time vs subscription decided and stated in listing.
- [ ] `figma.payments` status handled for UNPAID / PAID / dev toggle.

## Submit & after
- [ ] ★ Publish from Figma desktop → Community → submit for review (5–10 business days,
      often longer).
- [ ] Record submission date in `venture.json` (`status: launched` on approval) and any
      cost in `docs/LEDGER.md`.
- [ ] Day 1 / 7 / 30: note users, likes, purchases from fig-stats and the Figma
      dashboard in `RESEARCH.md` §6 (metrics).
