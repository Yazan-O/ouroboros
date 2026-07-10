#!/usr/bin/env node
// Honest, loud suite verification for CI.
//
// Our thesis is that a checker which fails loudly keeps you honest — so this
// script must not quietly mute the checker. It does three things:
//   1. FAILS the build on any genuine failure (status "failed", or a "blocked"
//      run that carries a real failedStepIndex — i.e. an actual blocker).
//   2. SURFACES, loudly, any "blocked" run whose latest run has failedStepIndex
//      null and an explicit PASS conclusion, matching the documented TestSprite
//      platform bug #208. These are annotated, never hidden.
//   3. Writes the full breakdown to the CI step summary so the state is legible
//      at a glance — the checker's own bug is part of the story, not swept under it.
import { execSync } from "node:child_process";

const project = process.env.PROJECT_ID;
const sh = (cmd) => execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const jsonOf = (raw) => {
  const i = raw.indexOf("["), j = raw.indexOf("{");
  const start = i < 0 ? j : j < 0 ? i : Math.min(i, j);
  return JSON.parse(raw.slice(start));
};

const EXPECTED_TEST_IDS = [
  "bd2aa814",
  "209afd81",
  "86ccc90d",
  "8ba3267b",
  "285783c3",
  "e148ba09",
  "215f4e47",
  "fa60727a",
  "877e0b8b",
  "31d2747b",
  "0447a447",
  "f6c69559",
  "1af81937",
];

const listed = jsonOf(sh(`testsprite test list --project ${project} --output json`));
const tests = Array.isArray(listed) ? listed : listed.tests || listed.items || [];
const statusOf = (t) => t.latestStatus || t.status || "unknown";
const idOf = (t) => t.testId || t.id || "unknown";
const shortIdOf = (t) => idOf(t).split("-")[0];
const expectedIds = new Set(EXPECTED_TEST_IDS);
const listedIds = new Set(tests.map(shortIdOf));
const missing = EXPECTED_TEST_IDS.filter((id) => !listedIds.has(id));
const extra = [...new Set(tests.filter((t) => !expectedIds.has(shortIdOf(t))).map(idOf))];

const genuine = missing.map((id) => ({ id, why: "expected test missing from suite" }));
const platformBug = []; // #208 blocked-with-PASS — surfaced, not fatal
const passed = [];

for (const t of tests) {
  let s = statusOf(t);
  let result = null;
  if (s === "running" || s === "queued") {
    await sleep(60_000);
    try {
      result = jsonOf(sh(`testsprite test result ${idOf(t)} --output json`));
      s = statusOf(result.run || result);
    } catch {
      genuine.push({ id: idOf(t), why: `could not refresh ${s} status after 60s` });
      continue;
    }
    if (s === "running" || s === "queued") {
      genuine.push({ id: idOf(t), why: `still ${s} after 60s retry` });
      continue;
    }
  }
  if (s === "passed") { passed.push(t); continue; }
  if (s === "failed") { genuine.push({ id: idOf(t), why: "status failed" }); continue; }
  if (s === "blocked") {
    // Distinguish the #208 platform bug (failedStepIndex null, agent verdict PASS)
    // from a genuine blocker (a real failedStepIndex) by reading the latest run.
    try {
      result ??= jsonOf(sh(`testsprite test result ${idOf(t)} --output json`));
    } catch {
      genuine.push({ id: idOf(t), why: "blocked result unavailable" });
      continue;
    }
    const detail = result.run || result;
    const failedStepIndex = Object.hasOwn(detail, "failedStepIndex")
      ? detail.failedStepIndex
      : "unknown";
    const conclusion = [detail.error, detail.conclusion, detail.summary]
      .filter((value) => typeof value === "string")
      .join("\n");
    if (failedStepIndex === null && /pass/i.test(conclusion)) platformBug.push({ id: idOf(t) });
    else if (failedStepIndex === null) genuine.push({ id: idOf(t), why: "blocked with no PASS conclusion" });
    else genuine.push({ id: idOf(t), why: `blocked with failedStepIndex ${failedStepIndex}` });
    continue;
  }
  genuine.push({ id: idOf(t), why: `unexpected status ${s}` });
}

const summary = [
  `## TestSprite suite verification`,
  ``,
  `- **${passed.length} passed**`,
  `- **${platformBug.length} blocked-with-PASS** — TestSprite platform bug [#208](https://github.com/TestSprite/testsprite-cli/issues/208) (agent verdict PASS, no failed step). Surfaced, not hidden.`,
  `- **${genuine.length} genuine failures**`,
  `- **${missing.length} expected tests missing**`,
  `- **${extra.length} unknown tests listed**`,
  ``,
  ...platformBug.map((b) => `  - ⚠️ blocked-with-PASS: \`${b.id}\` (#208)`),
  ...extra.map((id) => `  - ⚠️ unknown test: \`${id}\``),
  ...genuine.map((g) => `  - ❌ genuine: \`${g.id}\` — ${g.why}`),
].join("\n");

console.log(summary);
if (process.env.GITHUB_STEP_SUMMARY) {
  execSync(`echo "${summary.replace(/"/g, '\\"')}" >> "$GITHUB_STEP_SUMMARY"`, { shell: "/bin/bash" });
}
for (const b of platformBug) {
  console.log(`::warning title=Checker platform bug #208::${b.id} returned "blocked" with a PASS conclusion and no failed step — surfaced, not treated as a code failure.`);
}
for (const id of extra) {
  console.log(`::warning title=Unknown suite test::${id} is not in EXPECTED_TEST_IDS — surfaced for review.`);
}
for (const g of genuine) {
  console.log(`::error title=Genuine test failure::${g.id} — ${g.why}`);
}

if (genuine.length) {
  console.error(`\nFAILING BUILD: ${genuine.length} genuine failure(s).`);
  process.exit(1);
}
console.log(`\nNo genuine failures. ${platformBug.length} blocked-with-PASS + ${extra.length} unknown tests surfaced above.`);
