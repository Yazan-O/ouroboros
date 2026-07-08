# Fossil evidence treatment

## Treatment

Failed iterations with a `broke` value and an `evidence` entry keep
`data-testid="iteration-evidence"` and render as a fossil block:

- Header: `THE FOSSIL - the exact failure the checker caught, preserved`
- Left border: `--fail` via `border-fail`
- Background: faint `--fail-rgb` tint
- Typography: existing monospace story-card treatment
- Proof link: `open the exact broken state →` when a committed snapshot is known

No global CSS token was added; the treatment uses the existing house tokens.

## Iterations

The fossil treatment applies to iterations 2, 3, 5, 6, 7, 9, and 13.

Iteration 10 has a `broke` value but no evidence entry, so it does not render an
evidence block.

Iterations without a `broke` value are unaffected.

## Snapshot links

Snapshot links are keyed by `bundlePath` and only emitted for committed snapshot
files verified with `git ls-files`.

- `.testsprite/failure/` -> `.testsprite/failure/steps/01-snapshot.html`
- `.testsprite/runs/t6-blocked/` -> `.testsprite/runs/t6-blocked/steps/02-snapshot.html`
- `.testsprite/runs/t7-fail/` -> `.testsprite/runs/t7-fail/steps/15-snapshot.html`
- `.testsprite/runs/t7-l6/` -> `.testsprite/runs/t7-l6/steps/01-snapshot.html`

Iteration 2 resolves to:
`https://github.com/Yazan-O/ouroboros/blob/main/.testsprite/failure/steps/01-snapshot.html`

Existing `failure bundle` and `run artifact` links are still rendered. Video URLs
from the committed result files are not embedded.

## Reduced motion and tests

The fossil treatment adds no animation. Reduced-motion rendering stays static.

The ring controls remain absolutely positioned HTML buttons over an
`aria-hidden` SVG, and `iteration-evidence` remains intact.
