# Manual test checklist — ReadFocus (Chrome)

Setup: (already built by Claude) chrome://extensions → **Developer mode** →
**Load unpacked** → pick `ventures/read-focus/dist`. Pin the icon.

## Free tier
- [x] Install opens the popup page once (welcome).
	- [ ] Add welcome page instead of just opening the extension. it is a bit confusing.
	- [ ] make a better looking icon
- [x] On a news article: popup shows the hostname; "On for this site" off by default.
- [x] Switch on → word starts become bold within ~1 s; long pages (e.g. a Wikipedia
      article) finish progressively without freezing the tab.
- [x] Light / Medium / Heavy change the bolding; Strength slider is greyed out (pro).
	- [ ] Strength slider should increase the intensity of the boldness, not how far into the word it is bold, there should still be a slider for the latter though
- [ ] Reading ruler follows the mouse; `Alt+Shift+R` toggles it; `Alt+Shift+F` toggles the site.
	- [ ] no shortcuts for mac, cannot test
- [x] Infinite-scroll pages (Reddit, Twitter/X): newly loaded posts get bolded too.
- [x] Editing is untouched: textareas, Google Docs body, Gmail compose, code blocks, inputs.
- [x] Switch off → page text restored exactly (no leftover bold, no duplicated text).
- [x] Reload the page → the site's setting persisted. Another site → off.
- [x] Popup in dark mode looks right; no console errors (chrome://extensions → Errors).

## Unlock
- [x] Paste a garbage key → "not valid" message.
- [x] Paste a real key (I'll issue one with the private key) → badge "pro"; Strength,
      Paragraph focus and Font become active.
- [x] Paragraph focus dims everything but the paragraph under the cursor.
	- [ ] when scrolling the page, the cursor is moving relative to the page, should highlight the paragraphs the cursor goes over 
- [x] Font OpenDyslexic / Atkinson applies to body text; icons/logos not broken.
- [x] Remove the key (clear storage) → back to free, pro features drop off on next reload.

## Round 2 (2026-09-18) — what changed after your comments, please re-check
- [ ] **Welcome page**: remove and re-add the unpacked extension (or click *Reload* then
      install fresh) → a real welcome tab opens: pin instructions, your actual shortcuts, and a
      "Try it here" paragraph with Off/Light/Medium/Heavy buttons.
- [ ] **Icon**: new design (three text lines with bright word-starts over a ruler band).
      Say if you still don't like it and what you'd want instead.
- [ ] **Two sliders (pro)**: *Coverage* = how far into each word the bold reaches;
      *Weight* = how heavy the bold is (500–900). Each changes the page immediately.
- [ ] **Shortcuts on Mac**: now **Control+Shift+F** (site) and **Control+Shift+R** (ruler) —
      the popup footer and the welcome page show whatever is actually bound; "change
      shortcuts" opens Chrome's shortcut settings. If it still says "not set", set them there
      once and tell me — Chrome sometimes refuses suggested keys that clash with another
      extension.
- [ ] **Paragraph focus while scrolling**: leave the mouse still and scroll → the highlighted
      paragraph follows the one under the pointer.

## Round 3 (2026-09-19) — bolding fixes, please re-check
- [ ] Words that were already bold on the page keep their start bold (now heavier, never lighter).
- [ ] Pro **Weight** slider: 700 = plain bold; sliding towards 900 visibly thickens the bold
      part on any site (it adds a hairline stroke, so lines don't reflow).
- [ ] With **OpenDyslexic** or **Atkinson** selected, word starts are clearly bold (real bold
      faces are now bundled).

## Round 4 (2026-09-19) — text size
- [ ] Free **Text size** slider (100–150%): article paragraphs, lists and quotes grow as you
      drag; site navigation, buttons and anything you type in do not; nested lists don't
      grow twice. Slider at 100% → page back to normal. Persists per site.
