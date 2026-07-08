# Smooth Replay Notes

## Fix 1: replay no longer pops

- `components/LoopPanel.tsx:14` adds one `prefers-reduced-motion` reader; `components/LoopPanel.tsx:376` passes `replay.index`, total iteration count, center count, and the motion flag into `Ring`.
- `components/Ring.tsx:50` computes per-iteration progress as `clamp01(replayIndex - (iteration - 1))`. At index `4.25`, iteration 5 is 25% drawn; earlier slots are complete; later slots are absent.
- `components/Ring.tsx:144` fixes ring geometry to the full iteration count, so adding a replayed iteration fills its stable slot instead of re-dividing existing arcs.
- `components/Ring.tsx:280` maps each iteration to slot `it.n - 1`; `components/Ring.tsx:283` scales the arc end angle by the fractional progress; `components/Ring.tsx:305` keeps the real HTML button hit targets intact.
- `components/Ring.tsx:339` rolls the center count; `components/LoopPanel.tsx:394`, `components/LoopPanel.tsx:403`, and `components/LoopPanel.tsx:414` roll banked, caught, and lesson counts.
- `app/globals.css:139` defines the count roll; `app/globals.css:147` defines the SVG center-count roll. Both run only inside `prefers-reduced-motion: no-preference`; reduced motion renders the current final values with no roll and full visible arcs.

## Fix 2: audit table fits desktop

- `components/AuditTrail.tsx:56` adds `audit-trail-wide`; `app/globals.css:99` breaks the section out to `min(calc(100vw - 2rem), 80rem)`, then `app/globals.css:107` uses `min(calc(100vw - 3rem), 80rem)` from `md` up.
- At a 1280px viewport, the audit section content width is 1232px (`100vw - 3rem`), below the 80rem cap and wider than the page's 64rem main column.
- `components/AuditTrail.tsx:65` keeps `overflow-x-auto` for narrow screens and disables desktop scrolling with `lg:overflow-x-visible`.
- `components/AuditTrail.tsx:66` changes the table from `min-w-[70rem]` to `min-w-[56rem] lg:min-w-0` with `table-fixed`; `components/AuditTrail.tsx:67` adds explicit column widths.
- Tightened columns: headers are shortened to `feat`/`by`/`result`/`lesson`/`shas` at `components/AuditTrail.tsx:82`, `components/AuditTrail.tsx:85`, `components/AuditTrail.tsx:88`, `components/AuditTrail.tsx:91`, and `components/AuditTrail.tsx:94`; feature text truncates at `components/AuditTrail.tsx:121` with `max-w-[26ch]`; commit labels are shortened at `components/AuditTrail.tsx:148` while SHAs stay 7-char in `CommitLink`; the fallback test link is `suite` at `components/AuditTrail.tsx:170`.
