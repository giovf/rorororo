# Launch checklist — web micro-tool (static + Stripe Managed Payments)

- [ ] Static build deploys to Cloudflare Pages / GitHub Pages; custom domain optional.
- [ ] Pricing page: price, what's included, refund policy link, VAT-inclusive note
      ("tax calculated at checkout by our merchant of record").
- [ ] Stripe Managed Payments checkout link; success page tells the buyer to check email
      for the licence key; webhook → `@foundry/licensing` issues the key.
- [ ] Privacy and terms pages linked in the footer; support email `info@gankdat.com`.
- [ ] Lighthouse: performance ≥ 90, accessibility ≥ 95 on mobile.
- [ ] Listed on the landing site's product list; `venture.json` updated; ledger updated.
