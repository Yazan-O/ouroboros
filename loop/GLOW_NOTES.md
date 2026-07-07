# Glow Notes

## RING GLOW

- `components/Ring.tsx:157` adds a non-interactive `ouro-ring-bloom` layer behind the existing aria-hidden SVG.
- `components/Ring.tsx:183-202` keeps the red-rim device and 10/16 segment strokes intact while adding glow classes to the fail rim and colored segment paths.
- `components/Ring.tsx:208-221` keeps the orbit group and adds a three-dot fading motion trail plus glow classes for the orbit dot and halo.
- `app/globals.css:48-60` uses the prototype bloom values: `inset: -13%`, `radial-gradient(circle at 50% 50%, rgba(var(--accent-rgb), 0.28), rgba(var(--fail-rgb), 0.08) 38%, transparent 69%)`, `blur(18px)`, `opacity: 0.72`.
- `app/globals.css:63-78` uses `drop-shadow(0 0 24px rgba(var(--accent-rgb), 0.16))` on the SVG, `drop-shadow(0 0 10px rgba(var(--accent-rgb), 0.4))` on colored pass/orbit elements, and `drop-shadow(0 0 10px rgba(var(--fail-rgb), 0.36))` on fail paths.

## HYDRATION FIX

- `components/Ring.tsx:12-24` adds `fixed4()` and routes every computed `arcPath()` coordinate through `.toFixed(4)` before it enters the SVG `d` string.
- `components/Ring.tsx:251-264` rounds the HTML button hit-target `left` and `top` percentages with `.toFixed(4)` before appending `%`.
- Grep check: `rg -n '\$\{[^}]*[+*/%-][^}]*\}' components` was reviewed. `HarnessFlow.tsx` uses fixed integer geometry, `LearningCurve.tsx` already rounds path coordinates, and `Replay.tsx` only has non-trig marker percentage math outside the ring hydration issue and allowed touch scope.

## INSTRUMENT GRID

- `app/globals.css:37-43` replaces the imperceptible `#ffffff03` texture with a visible 96px instrument grid: vertical border lines at `rgba(var(--border-rgb), 0.22)`, horizontal border lines at `rgba(var(--border-rgb), 0.18)`, and a subdued surface radial behind it.

## INVARIANTS

- `data-testid ring-segment-N` is intact as `data-testid={\`ring-segment-${it.n}\`}` at `components/Ring.tsx:257`.
- The ring controls are still real absolutely positioned HTML `<button>` hit-targets over the aria-hidden SVG at `components/Ring.tsx:158-268`.
- `prefers-reduced-motion` behavior is intact at `app/globals.css:87-113`: orbit/reveal animation remains gated to `no-preference`; new bloom, glow, and trail elements are static.
- `npm run build` passed with Next.js 16.2.10.
- Browser render was not available in this Codex session: the in-app browser list returned `[]`, so no screenshot claim is made.
