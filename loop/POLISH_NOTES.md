# Polish Notes

## 1. Meta

- Added full static metadata in `app/layout.tsx:29`: title, description, Open Graph title/description/type/url, and Twitter summary card.
- Added `app/icon.svg`: standalone 32px SVG favicon with `#0b0e0c` background, `#19c379` ring arc, small gap, and dot head.

## 2. Footer

- Added quiet mono footer at `app/layout.tsx:58` with `data-testid="footer"`, top border, muted text, repo link, `LOOP.md`, and `LESSONS.md`.

## 3. Mobile Bugs Found

- `app/page.tsx:9`: header was a single flex row at 375px; stacked on mobile and restored row at `md:`.
- `components/Replay.tsx:55` and `components/Replay.tsx:144`: transport readout was fixed in one row; it now drops below the rail on narrow screens and returns to right-aligned at `md:`.
- `components/LearningCurve.tsx:156` and `components/LearningCurve.tsx:159`: the 720px chart needed internal horizontal scroll; page width now stays fixed while the chart scrolls inside its panel.
- `components/LearningCurve.tsx:325` and `components/LearningCurve.tsx:329`: lesson text truncated too aggressively on mobile; it wraps on mobile and truncates again at `md:`.
- `components/Ring.tsx:93` and `components/Ring.tsx:177`: ring/detail widths now clamp to the small viewport and keep the existing 360px desktop max.

## 4. Entrance

- Kept the existing replay transport reveal at `components/LoopPanel.tsx:49`.
- Extended the existing reveal delay utilities at `app/globals.css:47` and `app/globals.css:48`.
- Added the same reveal pattern to the learning curve at `components/LearningCurve.tsx:122` and footer at `app/layout.tsx:58`.

## Verification

- `npm run build` passed with Next.js 16.2.10 after the final CSS change; static export includes `/icon.svg`.
- Headless Chrome reduced-motion check at 375px: document `scrollWidth` 375, client width 375; learning chart scrolls internally (`scrollWidth` 744, client width 341).
- Desktop 1280px check: no page horizontal overflow; ring remains beside stats, replay remains between the ring/stats area and iteration log.
- All existing `data-testid` hooks remain present; added only `footer`.

## Deviations

- In-app browser tooling was unavailable (`agent.browsers.list()` returned empty), so render verification used installed local Chrome headless instead.
- No behavior deviation in the app; `app/globals.css` only gained reveal delay steps using the existing animation tokens.
