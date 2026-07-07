# Judge Mode Notes

## Beats

1. `THE LOOP` pulls `iterations.length` from `data/loop.json`: `13 iterations`, framed as the app's own build log.
2. `CAUGHT, NOT HIDDEN` pulls `tests.fail > 0` from `data/loop.json`: `6 failures`, plus iteration 2 `broke` and `fixed` fossil text.
3. `NO FIX WITHOUT A LESSON` pulls all 7 ids and lesson rules from `data/lessons.json`.
4. `THE CHECKER ON TRIAL` renders the contradiction: status `blocked` versus `PASS — all checks succeeded`, `failedStepIndex null`, with links to issue #208, PR #207, and PR #213.
5. `EVERY CLAIM CHECKABLE` pulls committed run count from unique non-null `test` ids in `data/commits.json` (`11`, because iterations 7 and 9 share one run id) and linked commit entries (`13`).
6. `THE VERDICT` renders `13 ITERATIONS · 7 LESSONS · 0 ESCAPED TO PROD` from loop and lesson counts, with the zero escaped stat fixed by the project claim.

## Test IDs

- `judge-mode-trigger`: visible dashboard button, closed-state additive trigger.
- `judge-mode`: full-viewport dialog overlay.
- `judge-beat`: current beat container, with zero-based `data-beat="0"` through `data-beat="5"`.

## Checks

- Additive: `JudgeMode` returns `null` when closed and is rendered after the existing dashboard, so closed-state dashboard nodes and controls stay mounted.
- Reduced motion: the component starts in reduced-motion-safe mode, only enables requestAnimationFrame auto-advance after `matchMedia("(prefers-reduced-motion: reduce)")` confirms no reduction, and renders each beat fully without animation dependencies.
- Accessibility: the dialog has `role="dialog"`, `aria-modal="true"`, `aria-label="Judge briefing"`, focuses on open, returns focus to `judge-mode-trigger` on close, announces beat changes with `aria-live="polite"`, and uses real buttons for close, dots, back, next, and trigger.
