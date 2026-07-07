# Ouroboros

A dashboard watching itself being built.

**Live:** _URL pending first deploy_ · **Hackathon:** TestSprite S3 — Build the Loop

## What it is

Every feature of this app was shipped by a maker-checker loop — Claude (spec + judge) and Codex (implementation) as makers, the TestSprite CLI as checker, testing the live deployment in the cloud. Each iteration writes a record into `data/loop.json`, and the app renders that data: the loop's own history *is* the app's content.

The twist: a **learning loop**. Every TestSprite failure is distilled into a rule in [LESSONS.md](LESSONS.md) before it may be fixed, and every subsequent maker spec starts with those rules. The dashboard charts failures falling over time — the loop provably learns.

## The proof

- [LOOP.md](LOOP.md) — agent-written, one line per iteration.
- [LESSONS.md](LESSONS.md) — what the loop learned, and when.
- [loop/HARNESS.md](loop/HARNESS.md) — the protocol.
- `.testsprite/` — failure bundles from real failed runs.
- Commit history — one commit per iteration.
- `.github/workflows/testsprite.yml` — the checker gates every PR.

## Run locally

```bash
npm install && npm run dev
```
