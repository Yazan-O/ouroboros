# Ouroboros

### The brief was *build the loop.* So we pointed the loop at itself.

**An app whose only content is its own build.** Claude writes each feature, Codex implements, and the TestSprite CLI is the only thing that calls it done — real cloud tests against the live site. The app renders that loop's own history: 15 iterations, every failure the checker caught, every lesson it learned, checkable down to the commit. It even audited its own checker — catching a run that reported `blocked` while the agent's own conclusion said PASS — flagged it upstream as #208, and shipped two more fixes back into the CLI along the way.

**Live: https://yazan-o.github.io/ouroboros/** (mirror: https://ouroboros-phi.vercel.app/)
TestSprite S3 hackathon — *Build the Loop*.

> **The app is its own build log** · **no fix without a lesson** · **the loop audited its checker**
> 15 loop iterations · 8 lessons (L1–L8), every failure distilled into a rule before its fix · 13 banked cloud tests · press **J** on the live site for a self-narrating briefing that ends on the loop auditing its own checker · **full run histories committed** in [`.testsprite/results/`](.testsprite/results) · a multi-step replay test that passed end-to-end · deep-linkable iterations, a failures-only filter, and full keyboard nav · a hostile red-team's findings folded back in as iteration 10 · CI waits until the live site serves the exact commit SHA, then re-runs the whole suite — **0 regressions, 0 escaped to prod** · 2 upstream PRs + 1 issue (5 documented occurrences) on the checker itself

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
| [deploy.yml](.github/workflows/deploy.yml) + [verify-suite.mjs](.github/scripts/verify-suite.mjs) | CI: every push → deploy → **wait until the live site serves this exact commit SHA** → rerun the whole suite against it. The verify step is honest and loud (lesson L3): it **fails the build on any genuine failure** — including a `blocked` run that carries a real `failedStepIndex` — and it **surfaces** the checker's own documented blocked-with-PASS bug ([#208](https://github.com/TestSprite/testsprite-cli/issues/208)) as a visible warning in the step summary rather than hiding behind it. We don't mute our checker — we explain it. |

Upstream contributions made along the way: [PR #207](https://github.com/TestSprite/testsprite-cli/pull/207) (Windows test-harness portability — the unpatched suite clobbered our real credentials mid-hackathon), [PR #213](https://github.com/TestSprite/testsprite-cli/pull/213) (validate `doctor --output` through the shared output-mode validator), and [issue #208](https://github.com/TestSprite/testsprite-cli/issues/208) (the blocked-with-PASS status bug). The two PRs are separate CLI fixes we shipped back; #208 is the bug our loop caught.

## Run locally

```bash
npm install && npm run dev
```

Static export (`next build` → `out/`), no server, no secrets: the dashboard is rebuilt by CI from committed loop data on every push.
