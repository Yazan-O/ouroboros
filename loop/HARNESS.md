# The Harness — how this loop runs

Two makers, one checker, one memory.

## Roles

- **Claude (Fable 5)** — orchestrator. Writes each feature spec, judges Codex's diff, integrates, distills lessons, writes LOOP.md.
- **Codex (gpt-5.5, xhigh)** — executor. Implements each spec via `codex exec` in this repo.
- **TestSprite CLI** — checker. Cloud tests against the live Vercel URL. Its verdict is the only "done."
- **LESSONS.md** — memory. The loop's learned rules, injected into every subsequent spec.

## One iteration

1. Claude writes a spec for the next feature — prefixed with the current LESSONS digest.
2. Codex implements. Claude reads the diff (never the summary) and integrates.
3. Push → Vercel deploys → `testsprite test create/rerun --wait` against the live URL.
4. **Fail** → `testsprite test failure get` → Claude distills the root cause into a lesson (LESSONS.md + data/lessons.json), fixes, reruns.
5. **Pass** → the test banks into the durable suite.
6. Claude appends one line to LOOP.md and one record to data/loop.json, commits.

The dashboard reads data/loop.json — so every iteration of the loop becomes visible content in the app the loop is building. The snake eats its tail.

## The learning invariant

A failure may only be fixed after its lesson is recorded. Specs without the lessons digest are invalid. This is what makes failures-per-feature fall over time — the curve the app charts.
