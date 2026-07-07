# The loop that learned — building Ouroboros

*Long-form write-up for TestSprite Hackathon S3.*

## The bet

Most agent demos hide their failures. We bet the opposite way: build a dashboard whose **only content is its own build loop** — every iteration, every failure, every fix, rendered live by the app they produced. If the loop is real, the app gets richer with every mistake. If it isn't, there's nothing to show. The checker keeps you honest by design.

## The harness

Two makers, one checker, one memory:

- **Claude** writes each feature spec, judges every diff, integrates, and writes LOOP.md as the loop runs.
- **Codex** implements specs in isolated clones — up to four jobs in parallel.
- **TestSprite CLI** is the only definition of done: real cloud-browser tests against the live Vercel deploy. No local green counts.
- **LESSONS.md** is the memory. The invariant: *no failure gets fixed before its lesson is recorded, and every new spec opens with the lessons digest.*

## What the checker actually caught

**Iteration 2.** Locally, clicking the SVG ring worked perfectly. The cloud tester reported: *"no clickable arc segments are present in the interactive elements."* Root cause (from the failure bundle, committed in-repo): `role="img"` on the svg flattens its entire subtree to presentational — invisible to testing agents *and screen readers*. A local click test can never catch this class of bug; a cloud agent driving the accessibility tree catches it immediately. That became **L1**, and the fix made the app more accessible for humans too.

**Iteration 3.** We asserted the ambient orbit dot "must visibly move." Failed — cloud browsers can run `prefers-reduced-motion`, where a static dot is the *correct* behavior. **L2**: assert settled end-states, never that decoration is currently animating.

**Iteration 5.** The checker returned `blocked` while its own conclusion read *"PASS — all checks succeeded."* **L3**: audit the checker's verdict against its observations. We recorded the verdict from the evidence and filed [testsprite-cli#208](https://github.com/TestSprite/testsprite-cli/issues/208). The checker keeps the loop honest; the loop keeps the checker honest.

## The learning curve, measured

Each lesson is injected into every subsequent maker spec. The effect is visible in the app's own chart: failures cluster in early iterations; later features (replay transport — 21/21 steps, harness diagram, evidence cards) passed first-try because their specs carried L1–L3. That's the compounding the hackathon's tagline points at: *a loop with no real checker doesn't fail loudly — it hallucinates progress.* Ours failed loudly three times, and each failure made the next feature cheaper.

## The part we didn't plan

Validating a bounty fix for the CLI's own repo, the unpatched test suite **overwrote our real `~/.testsprite/credentials` with a test fixture** mid-hackathon — every CLI call suddenly failed with `fetch failed` against `127.0.0.1`. Twenty minutes of forensics later, that war story became the motivation section of [PR #207](https://github.com/TestSprite/testsprite-cli/pull/207) (Windows test-harness portability, 1846/1846 tests green). The loop's tooling improved the checker's tooling.

## Numbers

See [LOOP.md](LOOP.md) for the full iteration log, `.testsprite/plans/` for every test as authored, and the commit history for the one-commit-per-iteration audit trail. CI reruns the entire suite against every fresh deploy.
