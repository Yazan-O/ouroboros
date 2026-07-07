# implementation-notes.md

Working notes for the Ouroboros build (TestSprite S3 hackathon, deadline Jul 10 2026 4:59 PM PDT).

## Decisions

- **Data flow:** loop harness commits `data/loop.json` + `data/lessons.json`; app reads them server-side via `fs` at render; each push → Vercel rebuild → dashboard updates. No DB, no runtime secrets.
- **Design spec (locked):** bg `#0B0E0C` · surface `#131A15` · text `#DCE7DC` · accent `#19C379` · fail `#D9553F` · border `#1E2A20` · radius 2px · display Chakra Petch · body IBM Plex Sans · mono IBM Plex Mono. Signature element: the ouroboros ring (SVG, iterations as arc segments). Everything else quiet.
- **v0 kept deliberately small** so features arrive via the loop and the commit history tells that story.
- **Test hooks:** stable `data-testid` attributes (`loop-stats`, `iteration-log`) for the checker.

## Deviations

(none yet)

## Open items

- Live URL + TestSprite project id pending user account setup.
- CI workflow needs `TESTSPRITE_API_KEY` secret + `TESTSPRITE_PROJECT_ID` repo variable.
