# REVIEWFIX_NOTES

- Fix 1: `components/Ring.tsx` renders `--fail` 18px under-halo arcs for iterations with caught failures, plus the `ring-legend` caption.
- Fix 2: `components/Ring.tsx` clears a selected iteration when replay removes it from the visible `iterations` prop.
- Fix 3: `components/Ring.tsx` keeps the ring SVG `aria-hidden="true"` only and changes evidence copy to `run id {id}`.
- Fix 4: `app/globals.css` changes only `--muted` to `#778877`.
- Fix 5: `components/Replay.tsx` adds the `replay-speed` 1x/2x toggle after the readout.
- Fix 6: `components/HarnessFlow.tsx` raises all diagram text to 13px+ and widens/reflows nodes inside the 720 viewBox.
- Fix 7: `components/AuditTrail.tsx` adds the server-rendered audit table and `app/page.tsx` mounts it after `HarnessFlow`.

Contrast: `#778877` measures 5.148:1 on `#0b0e0c` and 4.697:1 on `#131a15`.

Deviations: no browser target was available (`agent.browsers.list()` returned `[]`), so 375px horizontal overflow was checked from the generated static output structure. `.testsprite/results/iter9-215f4e47.json` is absent locally; the audit table keeps the requested `iter<n>-<first8>.json` URL pattern and `.testsprite/` was out of scope.
