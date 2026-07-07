# LESSONS.md — what the loop learned

The learning half of the loop: no failure gets fixed without its root-cause pattern distilled here, and every new maker spec starts with a digest of this file. Structured mirror in `data/lessons.json`, rendered by the app.

Format per lesson: `## Lx — <one-line pattern>` then **From:** (iteration + failure) and **Rule:** (what future specs must do differently).

---

## L1 — Interactive SVG parts must be real accessible controls, and never live under role="img"

**From:** iteration 2 — test "Clicking a ring segment reveals that iteration's detail card" failed: the cloud testing agent found no clickable arc segments; only non-ring controls were exposed as interactive.

**Rule:** every clickable SVG element gets `role="button"` + `tabIndex={0}` + an Enter/Space key handler — and the ancestor `<svg>` must NOT carry `role="img"`, which flattens its whole subtree to presentational and hides the controls from the accessibility tree (what testing agents and screen readers read). Specs for interactive SVG must state this explicitly.

## L2 — Never cloud-assert continuous ambient motion; assert end-states

**From:** iteration 3 — test "Ring intro completes..." failed only on "verify the dot changes position over time": the cloud browser may run with prefers-reduced-motion (where a static dot is the CORRECT, accessible behavior), and screenshot-sampled motion checks are flaky by construction.

**Rule:** test plans assert the settled end-state a user lands on (all segments visible, count correct, controls present), never that decoration is currently animating. Ambient motion is progressive enhancement — verified locally, not in the checker.

## L3 — Audit the checker's verdict against its observations

**From:** iterations 3 and 5 — runs came back status `blocked` while the testing agent's own conclusion read "PASS — all checks succeeded" with every observation verified (reported upstream).

**Rule:** never consume the status flag alone. Read the run's observations and step counts; a verdict that contradicts its own evidence gets one fresh run, then is recorded as what the evidence shows, with the discrepancy logged and reported. The checker keeps the loop honest — and the loop keeps the checker honest.

## L4 — Diagram labels must be legible at screenshot scale

**From:** iteration 6 — the harness diagram's 'pass' connector label rendered at 11px SVG (≈14px on screen); the cloud tester verified the boxes and connectors but could not read the label in its screenshots.

**Rule:** text that carries meaning in a data graphic renders at ≥13px SVG in a 720-wide viewBox (≈17px on screen). If a label is only legible because you know what it says, it isn't legible — for vision-based checkers or for humans.
