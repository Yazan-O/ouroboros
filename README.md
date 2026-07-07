# Ouroboros

**A dashboard watching itself being built.**

**Live: https://ouroboros-phi.vercel.app/** (mirror: https://yazan-o.github.io/ouroboros/)
TestSprite S3 hackathon — *Build the Loop*.

> **The app is its own build log** · **no fix without a lesson** · **the loop audited its checker**
> 13 loop iterations · 7 lessons (L1–L7), every failure distilled into a rule before its fix · 11 banked cloud tests, **full run histories committed** in [`.testsprite/results/`](.testsprite/results) · a 21/21-step replay test · deep-linkable iterations, a failures-only filter, and full keyboard nav · a hostile red-team's findings folded back in as iteration 10 · CI waits until the live site serves the exact commit SHA, then re-runs the whole suite · 2 upstream PRs + 1 issue (5 documented occurrences) on the checker itself

## The idea

Every feature of this app was shipped by a maker–checker loop: **Claude** (spec + judge + integrator) and **Codex** (implementation) as makers, the **TestSprite CLI** as the checker, running real cloud browser tests against this live URL. Each iteration writes a record into `data/loop.json` — and the app renders that data. The loop's own history *is* the app's content. The snake eats its tail.

**The twist — a loop that learns.** No failure may be fixed before its root-cause pattern is distilled into [LESSONS.md](LESSONS.md), and every subsequent maker spec opens with those lessons. The dashboard charts it: failures per iteration against the cumulative lessons line.

## What the loop caught (real failures, all in the run history)

- **L1** — the cloud tester couldn't click the SVG ring: `role="img"` flattened the accessibility tree and the arcs weren't focusable. Fixed with real accessible controls; rerun green.
- **L2** — an assertion that the orbit dot "must visibly move" failed: cloud browsers can run reduced-motion, where a static dot is *correct*. Test plans now assert settled end-states only.
- **L3** — the checker returned `blocked` while its own conclusion said *"PASS — all checks succeeded."* The loop learned to audit its checker's verdict against its evidence — and reported the bug upstream ([testsprite-cli#208](https://github.com/TestSprite/testsprite-cli/issues/208)).

## Try it (60 seconds)

1. Open the [live site](https://ouroboros-phi.vercel.app/) — the ring draws in; each arc is one loop iteration (green pass / red fail).
2. Click a segment — its story card: what ran, what broke, what got fixed, plus the **checker's own evidence** (run id, root cause from the failure bundle).
3. Press **play** on the flight recorder — scrub the dashboard back through its own history and watch it *unlearn* its lessons.
4. The **learning curve** shows lessons accumulating; **THE HARNESS** diagram shows the loop that did all of it.

## The proof

| Artifact | What it shows |
|---|---|
| [LOOP.md](LOOP.md) | Agent-written, one line per iteration — maker, what ran, what broke, what got fixed |
| [LESSONS.md](LESSONS.md) | The learning half: every failure distilled into a rule before its fix |
| [loop/HARNESS.md](loop/HARNESS.md) | The protocol (two makers, one checker, one memory) |
| `.testsprite/failure/` | A real committed failure bundle (root cause, DOM snapshot, video) |
| `.testsprite/plans/` | Every cloud-test plan, as authored |
| `.testsprite/results/` | **Full run history per test, committed** — the greens are machine-checkable, not claimed |
| Commit history | Labeled per-iteration SHAs in LOOP.md (feature / fix / bank), cross-checkable against the run history |
| **AUDIT TRAIL** (on the live site) | The app renders the whole mapping — iteration → commits → test → artifact → lesson — as a table; it does the auditing for you |
| [deploy.yml](.github/workflows/deploy.yml) | CI: every push → deploy → **wait until the live site serves this exact commit SHA** → rerun the whole suite against it |

Upstream contributions made along the way: [PR #207](https://github.com/TestSprite/testsprite-cli/pull/207) (Windows test-harness portability — the unpatched suite clobbered our real credentials mid-hackathon) and [issue #208](https://github.com/TestSprite/testsprite-cli/issues/208).

## Run locally

```bash
npm install && npm run dev
```

Static export (`next build` → `out/`), no server, no secrets: the dashboard is rebuilt by CI from committed loop data on every push.
