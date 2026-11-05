# Owner action request #038 — Leanpub: publish "Running Claude Code Unattended" (~15 min, plus a read that is yours to choose)

- **Date:** 2026-11-05
- **Status:** pending
- **Your time:** ~15 minutes of steps; the read before them is about two hours and is your choice (see below)
- **Cost:** £0 (a free Leanpub author account; Leanpub pays 80 % of each sale to your PayPal)
- **Blocks:** `claude-code-kit/leanpub-listing-live`

The book and its files are built and tested: a 21,000-word handbook of how this operation runs
unattended (EPUB + PDF + cover) and a zip of 44 of its files, scrubbed of anything that names you,
the ventures or the accounts. Leanpub is a developer bookshop that lists a book from day one and
pays 80 %; four handbooks of this shape sold 11–13 copies each there, the general guides 81–530. The
honest expectation is 10–40 copies in six months (US$150–900 net). Everything you paste is in
`ventures/claude-code-kit/LISTING.md`, in the order of Leanpub's form.

## Before the steps: the read (your choice, ~2 h)

Leanpub's rules say a book must be human-curated, and they do not let an AI agent use the service —
so the account is yours and the book is published by you. The preface tells the reader the book was
drafted by the operation, and that you read it against a review checklist before publishing. That
sentence has to be true. `ventures/claude-code-kit/MANUSCRIPT-REVIEW.md` is the checklist: every
chapter with the claims a reader would rely on marked **check**; the PDF in `release/` is the text.

- If you read it and want something changed or cut, send a note `038 changes: …` first; the next
  routine rebuilds the files, and you upload after that.
- If you would rather not spend the two hours, leave it unpublished and send `038 not now`. Nothing
  else depends on it, and no one is asked again. This request does not count the read against the
  15-minute rule — it is Leanpub's condition, not ours, and it is yours to decide.

## Actions

### 1. Create the free author account (~3 min)
- **Where:** https://leanpub.com/ → **Sign up** (email + password; no identity check, no card).
- **Give back:** nothing; no key or secret is needed by the operation.

### 2. Create the book and upload the files (~5 min)
- **Where:** the author dashboard → **Create a new book** → choose to upload your own files.
- **Steps:** title and subtitle, categories, the tagline and the "About the book" text — all paste-ready in
  `LISTING.md` §1. Upload `release/Running-Claude-Code-Unattended.epub`, `…pdf` and `release/cover.jpg`
  (`LISTING.md` §2).

### 3. Pricing, the Package and PayPal (~4 min)
- **Steps:** Book: minimum US$19, suggested US$19. Add one Package, "Book + the operation's files (Extras)",
  minimum US$29, suggested US$29, with `release/claude-code-kit-extras.zip` attached; its description is in
  `LISTING.md` §3. Royalties to **PayPal**. Tick the Weekly and Monthly Sale newsletters if the form offers them.

### 4. The AI Usage page (~2 min)
- **Steps:** paste `LISTING.md` §4 as it stands. It says what was done and that you read the book before
  publishing — if that is not what happened, stop and send `038 changes: …` instead.

### 5. Publish (~1 min)
- **Steps:** Publish (not Preview). Copy the book's URL.
- **Give back:** the note `leanpub done <book URL>`.

## When you're done
1. Set **Status** above to `done` and note anything that differed from the steps.
2. Send the note with the URL. The `leanpub-listing-live` item records the listing the same day and queues the
   day-60 read; Leanpub's sale and royalty mails are expected and already listed in `docs/ops/SELF-CAUSED.md`.
