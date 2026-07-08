# A11y Fix Notes

## Focus Trap

- Added `lib/useFocusTrap.ts` and wired it into `components/JudgeMode.tsx` and `components/ShortcutsOverlay.tsx`.
- The hook listens for `Tab` on `document` capture while a dialog is open, finds visible focusable descendants, and keeps focus inside the active dialog.
- Trace:
  - Focus outside dialog + `Tab` -> first focusable element.
  - Focus outside dialog + `Shift+Tab` -> last focusable element.
  - Focus inside dialog but not on a focusable child, including JudgeMode's initial container focus -> first or last focusable based on direction.
  - First focusable + `Shift+Tab` -> last focusable.
  - Last focusable + `Tab` -> first focusable.
  - Middle focusable elements use native tab order.
- JudgeMode still starts focus on the dialog container and `LoopPanel` still returns focus to the judge trigger on close.
- ShortcutsOverlay still starts focus on the close button and now restores focus to the opener when it closes.
- Background inert was skipped because the dashboard root in `LoopPanel` also contains the dialogs; applying `aria-hidden` there would hide the active dialog too.

## Learning Curve Text

- Added an adjacent `sr-only` HTML table in `components/LearningCurve.tsx`.
- The table states each iteration's passing runs, failing runs, and cumulative lessons.
- Kept `data-testid="learning-curve"` and every `data-testid={`lesson-${lesson.id}`}` row intact.

## LoopCard Stat Variants

- Replaced value-string styling checks in `components/LoopCard.tsx` with per-stat `tone` and `size` fields.
- Current visuals stay identical: escaped-to-prod is still fail red, and `CAUGHT` still uses the compact value size.

## Verification

- `npm run build` passes with Next.js 16.2.10 static export.
- Confirmed the touched data-testids remain present: `judge-mode`, `judge-beat`, `shortcuts-overlay`, `learning-curve`, lesson rows, `loop-card`, `loopcard-download`, and `loop-card-text`.
- No new runtime dependencies were added.
