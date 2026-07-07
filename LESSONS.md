# LESSONS.md — what the loop learned

The learning half of the loop: no failure gets fixed without its root-cause pattern distilled here, and every new maker spec starts with a digest of this file. Structured mirror in `data/lessons.json`, rendered by the app.

Format per lesson: `## Lx — <one-line pattern>` then **From:** (iteration + failure) and **Rule:** (what future specs must do differently).

---

## L1 — Interactive SVG parts must be real accessible controls, and never live under role="img"

**From:** iteration 2 — test "Clicking a ring segment reveals that iteration's detail card" failed: the cloud testing agent found no clickable arc segments; only non-ring controls were exposed as interactive.

**Rule:** every clickable SVG element gets `role="button"` + `tabIndex={0}` + an Enter/Space key handler — and the ancestor `<svg>` must NOT carry `role="img"`, which flattens its whole subtree to presentational and hides the controls from the accessibility tree (what testing agents and screen readers read). Specs for interactive SVG must state this explicitly.

**Update (iteration 9):** even compliant SVG-child controls index *unreliably* in agent tooling — the same DOM was indexed in some runs and invisible in others. The robust pattern: overlay real HTML `<button>` elements on the graphic (absolutely positioned hit-targets) and leave the SVG decorative. Native buttons never miss.

## L2 — Never cloud-assert continuous ambient motion; assert end-states

**From:** iteration 3 — test "Ring intro completes..." failed only on "verify the dot changes position over time": the cloud browser may run with prefers-reduced-motion (where a static dot is the CORRECT, accessible behavior), and screenshot-sampled motion checks are flaky by construction.

**Rule:** test plans assert the settled end-state a user lands on (all segments visible, count correct, controls present), never that decoration is currently animating. Ambient motion is progressive enhancement — verified locally, not in the checker.

## L3 — Audit the checker's verdict against its observations

**From:** iterations 3 and 5 — runs came back status `blocked` while the testing agent's own conclusion read "PASS — all checks succeeded" with every observation verified (reported upstream).

**Rule:** never consume the status flag alone. Read the run's observations and step counts; a verdict that contradicts its own evidence gets one fresh run, then is recorded as what the evidence shows, with the discrepancy logged and reported. The checker keeps the loop honest — and the loop keeps the checker honest.

## L4 — Diagram labels must be legible at screenshot scale

**From:** iteration 6 — the harness diagram's 'pass' connector label rendered at 11px SVG (≈14px on screen); the cloud tester verified the boxes and connectors but could not read the label in its screenshots.

**Rule:** text that carries meaning in a data graphic renders at ≥13px SVG in a 720-wide viewBox (≈17px on screen). If a label is only legible because you know what it says, it isn't legible — for vision-based checkers or for humans.

## L5 — When two controls share an entity name, the plan must name the widget type and exclude the look-alike

**From:** iteration 7 — the plan said "click the ring arc segment for iteration 2"; the testing agent clicked the replay rail's diamond marker instead (aria-label "Seek to iteration 2") — both controls reference the same entity.

**Rule:** plan steps targeting a control on a page with same-entity look-alikes name the widget type AND exclude the sibling ("the colored arc of the large circular ring — not the small diamond markers on the replay rail"). Accessible names should diverge too: actions ("Seek to…") vs. reveals ("Open story card…").

## L6 — Entrance choreography must scale sub-linearly with data and never gate interactivity

**From:** iteration 9 — the ring intro drew each segment for 0.5s with fixed overlap; at 2 iterations the invisible window was ~1s, at 8 iterations 3+ seconds. The cloud tester indexed the page mid-intro and found no clickable arcs — the L1 symptom returned, caused by the app's own data growth.

**Rule:** cap the TOTAL duration of any data-driven entrance (divide a fixed time budget by item count, don't multiply). Interactive controls must be present and visible within ~1 second regardless of how much the data grows — an intro that lengthens with content is a regression ratchet.

## L7 — A control's aria-label overrides its visible text; never let it hide load-bearing information

**From:** iteration 13 — the "press ? for shortcuts" hint carried `aria-label="Open keyboard shortcuts"`. The visible text names the key; the aria-label doesn't. The cloud tester reads the accessibility tree (the L1 lesson), where the aria-label *replaces* the visible text — so the "?" the test needed to confirm was invisible to it.

**Rule:** when a control's visible text is itself the information (a hint, a value, a status), do not add an aria-label that omits it — the aria-label wins in the accessibility tree and hides the text from testing agents and screen-reader users alike. Omit the label so the text is the accessible name, or mirror the same information in it. (Third of the a11y trio: L1 hid controls, L5 confused their names, L7 hid their content.)
