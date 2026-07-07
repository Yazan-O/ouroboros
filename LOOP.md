# LOOP.md — agent-written iteration log

One line per iteration, written by the agent as the loop runs: maker first, then what ran, what broke, what got fixed. Structured mirror of every line lives in `data/loop.json` — which this app itself renders.

---

1. [claude] Baseline instrument panel (ring + stats + iteration log) — ran FE test "Homepage renders the loop instrument panel" against the live GitHub Pages deploy — nothing broke, 6/6 steps passed — test banked (bd2aa814).
2. [claude] Interactive ring (click a segment → iteration story card) — ran FE test "Clicking a ring segment reveals that iteration's detail card" against the Vercel deploy — FAILED: the testing agent saw no clickable arcs (svg role="img" flattened the subtree; segments not keyboard-focusable) — lesson L1 banked, then fixed with real accessible controls (tabIndex, Enter/Space handler, role=img dropped); rerun passed (209afd81).
