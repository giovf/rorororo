# Manual test checklist — Variables Toolkit

Test file: a file with a small **colour** collection (e.g. `brand/primary` = #3B82F6) and a
**spacing** collection (`space/4` = 16, `radius/md` = 8), plus a few auto-layout frames with
padding 16, gap 16 and corner radius 8, and rectangles filled #3B82F6 and #FF0000.

## Link (tab 1)
- [ ] Header badge reads "free · 25 links left today"; footer shows "Unlock — $12 once".
- [ ] "Scan selection" with nothing selected → "Select something first."
- [ ] "Scan page" → summary "N layers scanned · M values can be linked · …"; rows grouped
      under **Colours** (`brand/primary`) and **Numbers** (`space/4`, `radius/md`).
- [ ] Untick "Numbers" and rescan → only colours listed.
- [ ] "Link selected" → fills show the variable chip; padding/gap/radius show variable
      chips in the right panel; toast "Linked N values"; badge count drops by N.
- [ ] Rescan → already-linked values are not offered again.
- [ ] Put a **widget** or a FigJam **connector/sticky** on the page → scan still works.
- [ ] Hide a frame → not scanned; tick "Include hidden" → scanned.
- [ ] Tick "Skip instances" → component instances are not offered.
- [ ] A frame with gap set to **Auto** (space-between) is not offered as a gap link.
- [ ] Big page (thousands of layers): status line counts up, **Cancel** stops it.
- [ ] Exceed 25 links in a day → toast says free limit reached; **Set payment status →
      paid** in the dev menu → badge "unlocked", no limit.

## Styles → Variables (tab 2)
- [ ] With colour styles ticked, **Preview** lists variables to create (`reuse` tag if a
      variable with that name exists); **Create & bind** makes the collection ("Tokens")
      and paint styles now reference the variables.
- [ ] Text/Effect styles: unpaid → summary says they "need the unlock"; paid → font
      family/style/size/line-height and shadow colour/radius/spread/offset variables are
      created and bound (check the style's properties show chips).

## Clean up (tab 3)
- [ ] **Analyse file** → counts of unused, duplicate values and broken aliases; unused
      rows have checkboxes (disabled when free). Paid: delete works and the list refreshes.

Errors appear in the footer line; also check **Plugins → Development → Open console**.
