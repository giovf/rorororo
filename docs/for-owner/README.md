# For the owner — everything you may need to read

Claude runs the project; this folder is the only part written for you. Read top to bottom.

## Right now
| Read | Why |
| --- | --- |
| [actions/002-figma-dev-test.md](actions/002-figma-dev-test.md) | Load the Figma plugin — one-time setup |
| [testing/variables-toolkit.md](testing/variables-toolkit.md) | Click-by-click test of the Figma plugin (no Figma knowledge needed) |
| [actions/004-publish-figma-plugin.md](actions/004-publish-figma-plugin.md) | Publish the Figma plugin (after the paid steps pass) |
| [actions/003-v2-test-and-payments.md](actions/003-v2-test-and-payments.md) | **Now:** three API keys so Claude can set up Stripe, Cloudflare and Resend itself |
| [testing/read-focus.md](testing/read-focus.md) | Chrome extension walkthrough (rounds 1–2 passed) |

## Background (optional)
| Read | Why |
| --- | --- |
| [actions/001-phase0-accounts.md](actions/001-phase0-accounts.md) | The accounts you already created and why |
| [../OPERATIONS.md](../OPERATIONS.md) | How the work loop runs, review cadence, kill criteria, the `/loop` command |
| [../LEDGER.md](../LEDGER.md) | Every pound in and out (the £100 cap is enforced by the build) |
| [../ARCHITECTURE.md](../ARCHITECTURE.md) | What is being built and with what |

## How to reply to a request
Say the file/step number and what you saw ("003 part 2 done, link is …", "walkthrough step 6:
no chip appeared", screenshot). Secrets go into `.env`, never into chat.

## Conventions
- `actions/NNN-*.md` — one batched request per topic, numbered; status line at the top.
- `testing/<venture>.md` — walkthroughs; Claude rebuilds the product in the container, so the
  files on your disk are always current — no npm on your side, ever.
