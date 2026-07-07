# Replay Integration

```tsx
"use client";

import Ring from "@/components/Ring";
import Replay from "@/components/Replay";
import type { Iteration } from "@/lib/loop";
import { useReplay } from "@/lib/useReplay";

export function LoopReplay({ iterations }: { iterations: Iteration[] }) {
  const replay = useReplay(iterations.length);
  const visibleIterations = iterations.slice(0, replay.visibleCount);

  return (
    <>
      <Ring iterations={visibleIterations} />
      <Replay replay={replay} />

      <section data-testid="iteration-log">
        {visibleIterations.length === 0 ? (
          <p>No iterations yet. The loop starts when the checker comes online.</p>
        ) : (
          <ol>
            {[...visibleIterations].reverse().map((it) => (
              <li key={it.n}>
                #{it.n} {it.verdict} {it.feature}
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
```

## Edge Cases

- `visibleIterations` is always `iterations.slice(0, replay.visibleCount)`, where `visibleCount = ceil(index)` clamped to `0..N`.
- `seek`, `step`, RAF advancement, and total changes clamp `index` to `0..N`; non-finite seeks resolve to `0`.
- Playback advances by `elapsedMs / 1200 * speed`, using one `requestAnimationFrame` loop only while `playing`.
- Reaching `N` clamps exactly to the end and pauses; pressing play at the end restarts from `0`.
- Arrow stepping lands on integer visible positions with `ceil(index) + delta`, so fractional playback does not drift keyboard steps.
- Pointer-down on the hidden native range pauses before dragging; range changes only seek.
- All rendered state derives from `index`, so seeking backward then forward produces the same Ring/log slice.
- Keyboard handling is scoped to `Replay`; no `window` listeners are installed.
- The play ripple uses motion-safe Tailwind animation and is hidden under `prefers-reduced-motion`.

## Verification

- `npm run build` passed with `Replay` temporarily mounted and wired to `Ring` plus the iteration log through the slice contract.
- `app/page.tsx` was reverted after verification and its SHA-256 restored to `4654B4F45FC9083C23162FCB0BBA17CD1ABE4463CD61B3427AF4C8498233C0A2`.

## Deviations

- None.
