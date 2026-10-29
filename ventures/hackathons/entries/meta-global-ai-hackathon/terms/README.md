# Meta Model API terms — read 2026-10-29

Saved by the owner on 2026-10-29 while creating the model key (action 032), read in full the same day.

| File | What it is |
| --- | --- |
| `meta-hackathon-credit-terms-2026.pdf` | Global AI Developer Hackathon Credit Terms (26 Oct – 4 Nov 2026) |
| `meta-model-api-acceptable-use-policy.pdf` | Meta Model API Acceptable Use Policy |
| `meta-model-api-terms-of-service-2026-10-02.pdf` | Meta Model API Terms of Service, last updated 2 October 2026 |

What they mean for the entry:

- **Credits:** US$150, one claim per person, by 4 Nov 9:00 PM ET through the claim form (name, applying email, Team ID);
  once applied they do not expire (Credit Terms 2–3).
- **Card:** every Model API account needs a payment method on file (1.2), and use past the credit is charged at standard
  prices to it (3.6); no spending cap is offered. So `/diligence` carries a lifetime token cap in code
  (`TOTAL_TOKENS` in `packages/landing/src/diligence.ts`: 20M tokens ≈ US$85 even at the output price), and nothing
  else in the repo calls the Model API on a schedule.
- **Model tier:** `muse-spark-1.3` is Standard mode (dev.meta.ai/docs/models, read 2026-10-29), so the "Discounted
  Services" bar on personal information (6.2) does not apply; the discounted tier is `muse-spark-1.3-contributor`,
  which we never use.
- **End users:** must be 18+ (10.1); the page says so, and says that names and register records go to Meta, which may
  retain them (4.1).
- **Allowed:** a public page for anonymous users as an Integrated Product (10.1(i)); commercial use, and use of the credit
  outside the hackathon (Credit Terms 3.3).
- **Marks:** no Meta logos; plain factual mentions of the model and provider only (ToS 7, Credit Terms 6.1).
- **AUP, defamation:** a name matching several companies can yield a wrong-company HIGH verdict; the page's disclaimer
  asks for the company number, and the hackathons queue carries `diligence-name-only-unconfirmed` to label name-only
  verdicts as unconfirmed.
- IP and licence of the submission are in the Official Rules (action 032), not in these three documents.
