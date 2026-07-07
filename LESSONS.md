# LESSONS.md — what the loop learned

The learning half of the loop: no failure gets fixed without its root-cause pattern distilled here, and every new maker spec starts with a digest of this file. Structured mirror in `data/lessons.json`, rendered by the app.

Format per lesson: `## Lx — <one-line pattern>` then **From:** (iteration + failure) and **Rule:** (what future specs must do differently).

---

## L1 — Interactive SVG parts must be real accessible controls, and never live under role="img"

**From:** iteration 2 — test "Clicking a ring segment reveals that iteration's detail card" failed: the cloud testing agent found no clickable arc segments; only non-ring controls were exposed as interactive.

**Rule:** every clickable SVG element gets `role="button"` + `tabIndex={0}` + an Enter/Space key handler — and the ancestor `<svg>` must NOT carry `role="img"`, which flattens its whole subtree to presentational and hides the controls from the accessibility tree (what testing agents and screen readers read). Specs for interactive SVG must state this explicitly.
