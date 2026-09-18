# Owner action request #5 — publish ReadFocus to the Chrome Web Store

- **Date:** 2026-09-18
- **Status:** ready once the £0 test purchase (action #3, item 2) has delivered a key
- **Your time:** ~25 minutes
- **Cost:** £0.00 (the $5 developer fee was paid in action #1 — tell me the GBP amount charged so the ledger row moves from planned to cost)
- **Blocks:** task 14.6–14.8

## Prepared for you
- **Zip to upload:** `ventures/read-focus/read-focus.zip` (built from `dist/`; I rebuild it
  whenever code changes and say so).
- **All listing text:** `ventures/read-focus/LISTING.md` — name, summary, description,
  category, single-purpose statement, permission justifications, data-use answers,
  privacy policy URL, support email.
- **Icon:** `ventures/read-focus/dist/icons/icon-128.png`.

## Screenshots (1280×800, at least 1, ideally 5) — the only thing I can't make
With the unpacked extension loaded, capture (Cmd+Shift+4 on a Mac, drag):
1. An article with Medium bolding on, popup open.
2. The reading ruler on a dense page.
3. Paragraph focus on a long article (pro — use your key).
4. OpenDyslexic font applied to a news site.
5. The welcome page's "Try it here" section.
Chrome wants exactly 1280×800 or 640×400; if a capture is off, open it in Preview → Tools →
Adjust Size, or crop to 16:10 and I'll resize it — drop files in
`ventures/read-focus/assets/screenshots/` and tell me.

## Steps
1. https://chrome.google.com/webstore/devconsole → **+ New item** → upload the zip.
2. **Store listing**: paste from LISTING.md; icon; screenshots; category *Accessibility*;
   language English.
3. **Privacy practices**: single purpose + permission justifications from LISTING.md;
   data-use certification: tick "does not collect user data" — and, since activation sends
   the order id once, if the form insists, declare "Authentication information" is *not*
   collected and add the sentence from LISTING.md's data-use line in the justification box.
   Privacy policy URL: https://giovf.github.io/rorororo/privacy.html.
4. **Distribution**: public, all regions, free (the unlock is sold outside the store).
5. **Submit for review**. Typical review: 1–3 days, sometimes longer for host permissions.
- **Give back:** "submitted" + date, and later the approval email. I'll flip the venture to
  `launched`, publish the buy link on the landing page, and start the day-1/7/30 metrics.
