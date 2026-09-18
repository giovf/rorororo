# Manual test checklist — ReadFocus (Chrome)

Setup: (already built by Claude) chrome://extensions → **Developer mode** →
**Load unpacked** → pick `ventures/read-focus/dist`. Pin the icon.

## Free tier
- [x] Install opens the popup page once (welcome).
	- [ ] Add welcome page instead of just opening the extension. it is a bit confusing.
- [x] On a news article: popup shows the hostname; "On for this site" off by default.
- [x] Switch on → word starts become bold within ~1 s; long pages (e.g. a Wikipedia
      article) finish progressively without freezing the tab.
- [x] Light / Medium / Heavy change the bolding; Strength slider is greyed out (pro).
	- [ ] Strength slider should increase the intensity of the boldness, not how far into the word it is bold, there should still be a slider for the latter though
- [ ] Reading ruler follows the mouse; `Alt+Shift+R` toggles it; `Alt+Shift+F` toggles the site.
	- [ ] no shortcuts for mac
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
