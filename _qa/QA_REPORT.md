# QA Report: Handoff

**Final status: PASS.** `_qa/test/report.json` shows `"ok": true` with 0 JS errors, and `assembleRelease` succeeded (`app/build/outputs/apk/release/app-release.apk`).

## How it was tested
- `_qa/scenario.js` is a Playwright scenario with about 90 checks. Each check throws an error if it fails. It runs at 390×844, with one step at 360px.
- `_qa/shots.js` uses the sample family to make the store screenshots that were copied to `screenshots/`.
- I looked at every screenshot by hand.

### Coverage (all 10 `test_scenarios` + edge cases)
1. **First run:** the empty state shows "Add your first kid". Saving with an empty name shows a validation message and nothing is saved. A rapid double-tap on Save adds exactly 1 kid. Ava (4, 19:30, severe peanuts) and Leo (7, 20:15) are both still there after a reload, and the default weekend bedtime is +30.
2. **Routine math:** I built Bath -45 (preset), Books -15 (custom step and stepper) and Lights out 0. On a Monday the timeline shows 6:45, 7:15 and 7:30 PM. Overriding the bedtime to 20:00 moves them to 7:15, 7:45 and 8:00 PM, both in the timeline and in the briefing.
3. **Merged timeline:** entries are sorted across kids, and every step has a kid avatar. Unticking Leo removes his steps. 4 rapid toggles leave the state correct.
4. **Briefing levels:** a New briefing has the address, Wi-Fi, urgent care and both contacts, with "PEANUTS — SEVERE" before every other section. Switching to Family drops the house info and keeps the allergies at the top. Section toggles work.
5. **Share/copy:** in a plain browser it falls back to the clipboard and shows a toast. With a mocked `window.Android.share`, the bridge receives the exact full text. The handoff is saved once and visits go to 1. Repeated "Share again" taps don't create duplicates.
6. **What changed:** after a new Wi-Fi password and a cashew allergy, the briefing has exactly 2 "New since last time" lines plus a banner. A brand-new caregiver gets no changes section.
7. **Staleness:** the 3-month threshold persists. A contact backdated to 120 days ago shows exactly one alert. "Still accurate" clears it, and it stays cleared after a reload.
8. **Reuse night:** caregiver, kids, extras, the 20:00 bedtime override, and leave/back times are all prefilled, and the date is set to today.
9. **Export/import:** a bad paste shows an error. Cancelling a reset keeps the data. Reset clears everything. Importing then restores kids, routines, allergies, contacts, house, caregivers and history, and the restored data survives a reload.
10. **Edge cases:** a kid with no routine shows just "Bedtime". A back-by time earlier than leave time shows a validation message and blocks the preview. A very long note (including a long URL with no spaces) wraps with no horizontal overflow at 360px. Very long kid names cause no overflow on Kids, the kid detail page, the builder or Caregivers.
- **Other checks:**
  - The draft persists across reloads.
  - Tap-to-copy on a phone number shows a toast.
  - The Android back button closes the top sheet first, then goes preview → builder → home, and does nothing harmful on the root screen.
  - Double-tapping a confirm dialog while deleting a kid leaves no stray overlays.

## Bugs found and fixed
| # | Severity | Bug | Fix |
|---|----------|-----|-----|
| 1 | High (visible) | In the builder's "Bedtimes tonight" rows, the kid names were squeezed to one letter (e.g. "A") and the time input was clipped ("07:30 PI") on a 390px phone. | `styles.css`: each row is now a two-line grid (avatar, name, reset / −, time, +). The time input has room to show in full and long names wrap. |
| 2 | Medium | Tapping a sheet's Save/Delete repeatedly during the 220ms close animation could run the save twice (for example, duplicate kids or rules). | `openSheet` ignores clicks while it is saving or closing. |
| 3 | Medium | Closing a confirm dialog twice (a double-tap, or a tap plus back) ran `overlays.splice(-1, 1)`, which removed the wrong overlay from the back stack. | Added a once-only guard to the dialog's `close`. |
| 4 | Low | The Home "handoffs this month" count used the UTC month, so it was wrong around month boundaries in non-UTC timezones. | It now uses the local `todayStr()`. |
| 5 | Low (polish) | A long night note made handoff cards on Home/History very tall. | `.ho-extras` is clamped to 3 lines and wraps long words. The full text is still available under "Briefing". |

## Known limitations
- The real Android share sheet and clipboard can't be exercised in headless Chromium. The bridge was checked with a mock and the fallback path was tested.
- Times are clock-only. A night that crosses midnight relies on the "We're back after midnight" checkbox. Bedtimes after midnight are handled with a heuristic (anything more than 6h before the leave time sorts as the next day).
- In the routine editor, the ↑/↓ reorder buttons change the list order, but the timeline always sorts by time offset, so reordering has no effect on the plan.
- The staleness alert rounds months down, so an item 120 days old says "3 months ago" when the threshold is 3 months. That's correct, but it reads a little oddly.
- The build sometimes fails on OneDrive with "Unable to delete directory …packageRelease/tmp" because of a file lock. Deleting that tmp folder and re-running fixes it.
