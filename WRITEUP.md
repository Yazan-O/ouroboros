# The loop that learned — building Ouroboros

*Long-form write-up for TestSprite Hackathon S3.*

## The bet

Most agent demos hide their failures. We bet the opposite way: build a dashboard whose **only content is its own build loop** — every iteration, every failure, every fix, rendered live by the app they produced. If the loop is real, the app gets richer with every mistake. If it isn't, there's nothing to show. The checker keeps you honest by design.

## The harness

Two makers, one checker, one memory:

- **Claude** writes each feature spec, judges every diff, integrates, and writes LOOP.md as the loop runs.
- **Codex** implements specs in isolated clones — up to four jobs in parallel.
- **TestSprite CLI** is the only definition of done: real cloud-browser tests against the live deploy. No local green counts.
- **LESSONS.md** is the memory. The invariant: *no failure gets fixed before its lesson is recorded, and every new spec opens with the lessons digest.*

## What the checker actually caught

**Iteration 2.** Locally, clicking the SVG ring worked perfectly. The cloud tester reported: *"no clickable arc segments are present in the interactive elements."* Root cause (from the failure bundle, committed in-repo): `role="img"` on the svg flattens its entire subtree to presentational — invisible to testing agents *and screen readers*. Our local checks missed this class of bug entirely; a cloud agent driving the accessibility tree caught it immediately. That became **L1**, and the fix made the app more accessible for humans too.

**Iteration 3.** We asserted the ambient orbit dot "must visibly move." Failed — cloud browsers can run `prefers-reduced-motion`, where a static dot is the *correct* behavior. **L2**: assert settled end-states, never that decoration is currently animating.

**Iteration 5.** The checker returned `blocked` while its own conclusion read *"PASS — all checks succeeded."* **L3**: audit the checker's verdict against its observations. We recorded the verdict from the evidence and filed [testsprite-cli#208](https://github.com/TestSprite/testsprite-cli/issues/208). The checker keeps the loop honest; the loop keeps the checker honest.

## The learning curve, measured

Each lesson is injected into every subsequent maker spec. Some features then passed first-try with those specs (the 21/21-step replay transport, the 4/4 deep-link test) — and where new failure *classes* appeared anyway (L4–L8), the loop caught and banked those too, including one lesson that re-tripped (L7, recorded, not hidden). That's the honest version of the hackathon's tagline: *a loop with no real checker doesn't fail loudly — it hallucinates progress.* Ours failed loudly seven times, and wrote down the rule every time. We claim durable, reused rules — not a guarantee of no recurrence; the chart shows both.

## The part we didn't plan

Validating a bounty fix for the CLI's own repo, the unpatched test suite **overwrote our real `~/.testsprite/credentials` with a test fixture** mid-hackathon — every CLI call suddenly failed with `fetch failed` against `127.0.0.1`. Twenty minutes of forensics later, that war story became the motivation section of [PR #207](https://github.com/TestSprite/testsprite-cli/pull/207) (Windows test-harness portability — evidence in the PR thread; currently open). The loop's tooling improved the checker's tooling.

## The audit we ran on ourselves

Near the end we turned the harness inward: a second agent, prompted as a hostile judge, cross-examined every LOOP.md claim against git and the committed artifacts. It found what we couldn't see from inside: our greens were *under-evidenced* (we had committed failure bundles but not passing run results — the repo could prove our failures and only claim our successes), the ring rendered every arc green even though the story was about failures, and CI re-ran the suite without proving the deploy it tested was fresh. Iteration 10 fixed all of it: full run histories committed per test (`.testsprite/results/`), red failure-rims on fixed-after-failure arcs, and a CI gate that refuses to verify until the live site serves the exact commit SHA. The lesson generalizes: **a loop that only archives its failures is still telling a curated story — bank the proof of the passes too.**

## Numbers

See [LOOP.md](LOOP.md) for the full iteration log, `.testsprite/plans/` for every test as authored, and the commit history for the one-commit-per-iteration audit trail. CI reruns the entire suite against every fresh deploy.
