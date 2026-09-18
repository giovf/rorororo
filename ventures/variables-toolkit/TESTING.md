# Manual test checklist — Variables Toolkit

Test file: any file with a few local **colour variables** and layers using those exact
colours as hard-coded fills. A quick one: create a collection with `brand/primary`
(#3B82F6), draw three rectangles filled #3B82F6 and one filled #FF0000.

## Link raw values (feature 1)
- [ ] Open plugin → header shows "free" badge; Unlock button visible.
- [ ] "Scan selection" with nothing selected → message "Select something first."
- [ ] "Scan page" → summary "N paints scanned · 3 can be linked · 1 have no matching variable";
      one row `brand/primary` with count 3.
- [ ] "Link selected" → rectangles now show the variable chip on their fill; toast
      "Linked 3 paints".
- [ ] Scan again → "0 can be linked" (already-bound paints are skipped).
- [ ] Make 30 rectangles with the variable colour, scan, link → only 25 linked, toast says
      free limit reached; Unlock button works (opens Figma checkout).
- [ ] Set payment status to paid (dev menu) → badge "unlocked"; linking 30 links all 30.

## Report anything odd
Errors show in the plugin's summary line; also check **Plugins → Development → Open console**.
