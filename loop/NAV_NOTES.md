# Navigation Feature Notes

## Feature 11 - Deep-linkable iterations

- `components/LoopPanel.tsx:11` updates `?i=N` with `history.replaceState`; `components/LoopPanel.tsx:28` reads the initial query from `window.location`.
- `components/LoopPanel.tsx:91` centralizes selection so opening a story card writes `?i=N` and closing removes `i`.
- `components/Ring.tsx:230` keeps the ring segment as a real button; `components/Ring.tsx:69` builds the absolute permalink from `location.origin + location.pathname + ?i=N`.
- `components/Ring.tsx:268` adds `data-testid="copy-permalink"` with copied-state feedback.

## Feature 12 - Failures-only filter

- `components/LoopPanel.tsx:71` creates the replay-visible slice first; `components/LoopPanel.tsx:74` filters that slice only when failures-only is active.
- `components/LoopPanel.tsx:185` sends the filtered slice to `Ring`; `components/LoopPanel.tsx:241` and `components/LoopPanel.tsx:247` apply it to the iteration log.
- `components/LoopPanel.tsx:201` and `components/LoopPanel.tsx:205` count stats from the filtered slice; `components/LoopPanel.tsx:210` adds `data-testid="filter-failures"`.
- `components/LoopPanel.tsx:266` leaves `LearningCurve` on the unfiltered visible history.

## Feature 13 - Shortcuts overlay

- `components/LoopPanel.tsx:124` handles root keydown events, ignoring text inputs, native button activation, and ctrl/meta/alt shortcuts.
- `components/LoopPanel.tsx:129` toggles shortcuts with `?`; `components/LoopPanel.tsx:137` resolves Escape as overlay first, then story card.
- `components/LoopPanel.tsx:153`, `components/LoopPanel.tsx:159`, `components/LoopPanel.tsx:165`, and `components/LoopPanel.tsx:171` handle Left, Right, Space, and `f`.
- `components/LoopPanel.tsx:177` attaches the listener to the LoopPanel root and `components/LoopPanel.tsx:178` removes it on unmount.
- `components/LoopPanel.tsx:222` adds `data-testid="shortcuts-hint"`; `components/ShortcutsOverlay.tsx:33` adds `data-testid="shortcuts-overlay"`.

## Interaction resolutions

- Filter-after-slice: `visible = iterations.slice(0, replay.visibleCount)` is computed before `displayIterations`, so filtering never reveals scrubbed-away iterations.
- Deep-link respects filter: `components/LoopPanel.tsx:113` closes the selected card if its iteration is missing from `displayIterations`, removing the URL param through `selectIteration(null)`.
- Overlay-then-card Escape: `components/LoopPanel.tsx:137` checks `shortcutsOpen` before `selectedIteration`, so Escape closes the overlay first.
- Replay keyboard ownership: `components/Replay.tsx:28` keeps the transport focusable, while the shortcut handler lives in `LoopPanel`; this avoids duplicate replay steps.

## Added data-testids

- `filter-failures`
- `copy-permalink`
- `shortcuts-overlay`
- `shortcuts-hint`

Build check: `npm run build` passed with static routes for `/`, `/_not-found`, and `/icon.svg`.
