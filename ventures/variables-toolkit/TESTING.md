# Testing Variables Toolkit — walkthrough for someone who has never used Figma

You don't need to know Figma. The plugin can build its own demo page; you click buttons and
compare what you see with the "expect" lines. Send me screenshots of anything that differs.

## A. One-time setup (5 min)
1. Open the **Figma desktop app** and sign in. Click **+ Create new → Design file**. A blank
   canvas opens. (Left panel = layers/pages, right panel = properties, top = tools.)
2. Menu **Plugins → Development → Import plugin from manifest…** and pick
   `ventures/variables-toolkit/manifest.json` from your checkout. It appears under
   **Plugins → Development → Variables Toolkit**.
3. Run **Plugins → Development → Variables Toolkit → Create demo page (testing only)**.
   *Expect:* a toast "Created page …", and the canvas now shows a white card with coloured
   bars, a red "chip", and a note. The left panel lists a page "Variables Toolkit demo".
   *(If instead a toast says "Demo failed: …", screenshot it and stop — that's a bug.)*

## B. Link tab (the main feature)
4. Run **Plugins → Development → Variables Toolkit → Open**. A panel appears with three
   tabs: **Link**, **Styles → Variables**, **Clean up**.
   *Expect:* top-right badge reads "free · 25 links left today"; bottom button "Unlock — $12 once".
5. Click **Scan page**.
   *Expect:* a line like "N layers scanned · 6 values can be linked · 1 colours and 0
   numbers have no matching variable", then rows:
   - **Colours**: `brand/primary` (count 3), `brand/danger` (1) — or `brand/primary-copy`
     may appear instead of `brand/primary` for the 3 blue ones: that's fine, both have the
     same value (the Clean up tab flags them as duplicates).
   - **Numbers**: `space/4` (padding, 4), `space/2` (1), `radius/md` (4).
   The magenta bar is the one with "no matching variable".
6. Click **Link selected**.
   *Expect:* footer says "Linked N." and a toast at the bottom of Figma. Now click the
   blue bar on the canvas and look at the right panel under **Fill**: instead of a plain
   colour it shows a pill/chip named `brand/primary` — that's a "variable chip". Under
   **Auto layout** the padding fields show chips too.
7. Click **Scan page** again. *Expect:* "0 values can be linked" (already-linked values are
   never offered twice).
8. Tick **Include hidden** and scan. *Expect:* one more colour (the hidden bar). Untick.
9. Tick **Skip instances** and scan. *Expect:* the red "Chip instance" is no longer offered.
10. Click **Scan selection** with nothing selected. *Expect:* "Select something first."

## C. Styles → Variables tab
11. Click **Preview**. *Expect:* a checkbox list of the demo styles: `Light/Brand/Primary`,
    `Dark/Brand/Primary`, `Brand/Accent` ticked; `Gradient/Hero` unticked with reason "not a
    solid colour". Summary says "… variables … · modes: Light, Dark".
12. Untick `Brand/Accent`. *Expect:* the variable count in the summary drops by one.
13. Click **Create & bind**. *Expect:* footer "Created 1, reused 0, bound 2." (one variable
    `brand/primary` with two modes). If your Figma plan is the free one, expect instead a
    toast saying modes couldn't be added — tell me which you got.
    To see the result: right panel → click the **Local variables** icon (four small squares
    near the top of the right panel, or menu **Design → Local variables**). Collection
    "Tokens" should contain `brand/primary`.
14. Text/Effect styles: tick **Text styles** and **Preview**. *Expect:* summary ends with
    "text styles need the unlock" and nothing text-related is listed.

## D. Clean up tab
15. Click **Analyse file**. *Expect:* "… local variables · 1 unused (`unused/old-teal`) ·
    1 duplicate groups (`brand/primary = brand/primary-copy`) · 0 broken aliases · unlock to
    delete". The Delete button is disabled.

## E. Paid mode (simulated)
16. Menu **Plugins → Development → Variables Toolkit** — look for a **Set payment status**
    or **Payments** item and choose **Paid** (Figma provides this for development builds).
    Re-open the plugin. *Expect:* badge "unlocked"; Unlock button gone; in Clean up the
    unused row has a working checkbox and **Delete selected** works; Text/Effect styles now
    convert (Preview lists `Body/Regular` and `Shadow/Card`).
17. Set payment status back to **Unpaid**.

## F. Robustness (2 min)
18. Draw a big page: select the white card (click it), press **Ctrl/Cmd+D** ten times to
    duplicate it, then **Scan page**. *Expect:* it completes with the status line counting
    up, no freeze.
19. Open the console (**Plugins → Development → Open console**) and repeat a scan.
    *Expect:* no red errors.

Send: screenshots of steps 5, 6 (right panel with the chip), 11, 13, 15, 16, and any step
whose "expect" didn't match.
