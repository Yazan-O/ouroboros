# LOOP CARD Notes

- Renders a bottom-page `LOOP CARD` section with `data-testid="loop-card"` after `AuditTrail`.
- Uses the house tokens from `app/globals.css`: bg, surface, text, muted, accent, fail, border, Chakra Petch, and IBM Plex Mono.
- Reads proof data from `data/loop.json`, `data/lessons.json`, and unique committed cloud test IDs from `data/commits.json`.
- Shows 14 iterations, 6 red-rim caught failures, 7 lessons L1-L7, 12 cloud tests, 0 escaped to prod, the checker proof line, PR #207, PR #213, issue #208, and `ouroboros-phi.vercel.app`.
- The on-page trophy is one fixed 1200x630 SVG layout scaled responsively inside a bordered panel.
- The PNG button is a real HTML button with `data-testid="loopcard-download"` and accessible text.
- Download uses native Canvas 2D only: it creates a 1200x630 canvas, draws the same background, ring arcs, stat grid, proof text, and URL, calls `toBlob("image/png")`, then clicks a temporary anchor.
- No html2canvas, no new dependency, and no animation. Reduced-motion users get the complete static card.
