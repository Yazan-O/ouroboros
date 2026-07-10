"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import commitsData from "@/data/commits.json";
import { useFocusTrap } from "@/lib/useFocusTrap";
import type { CommitsByIteration, Iteration, Lesson } from "@/lib/loop";

const BEAT_COUNT = 6;
const BEAT_MS = 6000;
const commits = commitsData as CommitsByIteration;

type JudgeModeProps = {
  open: boolean;
  iterations: Iteration[];
  lessons: Lesson[];
  onClose: () => void;
};

type BeatMeta = {
  heading: string;
  fact: string;
  caption: string;
};

function isTextEntryTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
}

function isNativeButtonActivation(event: KeyboardEvent): boolean {
  if (!(event.target instanceof HTMLElement)) return false;
  if (event.key !== " " && event.key !== "Spacebar" && event.key !== "Enter") {
    return false;
  }

  return event.target.closest("button,a") !== null;
}

function sortLessons(a: Lesson, b: Lesson): number {
  return a.id.localeCompare(b.id, undefined, { numeric: true });
}

export default function JudgeMode({
  open,
  iterations,
  lessons,
  onClose,
}: JudgeModeProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [beatIndex, setBeatIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(true);
  const iterationCount = iterations.length;
  const caughtFailures = iterations.filter((it) => it.tests.fail > 0).length;
  const fossil = iterations.find((it) => it.n === 2);
  const orderedLessons = useMemo(() => [...lessons].sort(sortLessons), [lessons]);
  const committedRunCount = new Set(
    Object.values(commits)
      .map((entry) => entry.test)
      .filter((test): test is string => Boolean(test)),
  ).size;
  const linkedCommitCount = Object.keys(commits).length;

  const beats: BeatMeta[] = useMemo(
    () => [
      {
        heading: "THE LOOP",
        fact: "THE APP IS ITS OWN BUILD LOG",
        caption: `${iterationCount} iterations, each shipped by a maker–checker loop and rendered by the app itself.`,
      },
      {
        heading: "CAUGHT, NOT HIDDEN",
        fact: "THE CHECKER CAUGHT WHAT LOCAL TESTING CAN'T",
        caption: `${caughtFailures} failures caught by cloud tests and fixed before they shipped`,
      },
      {
        heading: "NO FIX WITHOUT A LESSON",
        fact: `${orderedLessons.length} LESSONS, EACH BANKED BEFORE ITS FIX`,
        caption: "A fix only counts after the loop writes down the rule it learned.",
      },
      {
        heading: "THE LOOP CHECKS ITS OWN CHECKER",
        fact: "STATUS SAID BLOCKED — EVIDENCE SAID PASS",
        caption:
          "We read the checker's own evidence, not just its status flag — flagged the contradiction as #208, and opened two separate CLI PRs along the way:",
      },
      {
        heading: "EVERY CLAIM CHECKABLE",
        fact: "DON'T TRUST US — CHECK US",
        caption: "every iteration → commit → cloud test → committed artifact → lesson",
      },
      {
        heading: "THE VERDICT",
        fact: "THE LOOP CLOSED",
        caption:
          "built for the TestSprite loop — real cloud tests the only gate, every failure caught and fixed in the open, and it even audited its own checker. Verified output is the only output that ships.",
      },
    ],
    [caughtFailures, iterationCount, orderedLessons.length],
  );

  const atLastBeat = beatIndex === BEAT_COUNT - 1;
  useFocusTrap(dialogRef, open);

  const previousBeat = useCallback(() => {
    setBeatIndex((index) => Math.max(0, index - 1));
  }, []);

  const nextBeat = useCallback(() => {
    setBeatIndex((index) => Math.min(BEAT_COUNT - 1, index + 1));
  }, []);

  useEffect(() => {
    if (!open) return;
    setBeatIndex(0);
    setProgress(0);
    dialogRef.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    if (!open || typeof window === "undefined") return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setReducedMotion(media.matches);
    syncPreference();
    media.addEventListener("change", syncPreference);

    return () => media.removeEventListener("change", syncPreference);
  }, [open]);

  useEffect(() => {
    if (!open || reducedMotion) {
      setProgress(0);
      return;
    }

    if (atLastBeat) {
      setProgress(100);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const nextProgress = Math.min(100, ((now - start) / BEAT_MS) * 100);
      setProgress(nextProgress);

      if (nextProgress >= 100) {
        nextBeat();
        return;
      }

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [atLastBeat, beatIndex, nextBeat, open, reducedMotion]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isTextEntryTarget(event.target)) return;

      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        nextBeat();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        previousBeat();
        return;
      }

      if (event.key === " " || event.key === "Spacebar") {
        if (isNativeButtonActivation(event)) return;
        event.preventDefault();
        nextBeat();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [nextBeat, onClose, open, previousBeat]);

  if (!open) return null;

  const beat = beats[beatIndex];

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 overflow-y-auto bg-bg/92 px-4 py-6 text-text backdrop-blur-[2px] focus:outline-none md:px-6"
      data-testid="judge-mode"
      role="dialog"
      aria-modal="true"
      aria-label="Judge briefing"
      tabIndex={-1}
    >
      <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col justify-between gap-6 border border-border bg-surface/95 p-4 shadow-[0_0_60px_rgba(var(--accent-rgb),0.16)] md:p-6">
        <div className="flex items-start justify-between gap-4 font-mono text-xs text-muted">
          <span>beat {beatIndex + 1} / {BEAT_COUNT}</span>
          <button
            type="button"
            aria-label="Close judge briefing"
            onClick={onClose}
            className="border border-border bg-bg px-2 py-1 text-accent focus:outline-1 focus:outline-accent"
          >
            close
          </button>
        </div>

        <section
          className="grid min-h-[28rem] content-center gap-6"
          data-testid="judge-beat"
          data-beat={beatIndex}
          aria-live="polite"
          aria-labelledby="judge-beat-heading"
        >
          <div className="space-y-3">
            <h2
              id="judge-beat-heading"
              className="max-w-4xl font-display text-4xl font-semibold leading-[0.95] tracking-[0.08em] text-text md:text-7xl"
            >
              {beat.heading}
            </h2>
            <p className="font-mono text-sm uppercase tracking-[0.16em] text-accent md:text-base">
              {beat.fact}
            </p>
            <p className="max-w-3xl font-mono text-sm leading-6 text-muted md:text-base">
              {beat.caption}
            </p>
          </div>

          {beatIndex === 1 && fossil && (
            <div className="grid gap-3 font-mono text-sm md:grid-cols-2">
              <div className="border border-fail bg-bg p-3">
                <p className="mb-2 font-display text-xs tracking-[0.18em] text-fail">
                  ITERATION 2 BROKE
                </p>
                <p className="text-muted">{fossil.broke}</p>
              </div>
              <div className="border border-accent bg-bg p-3">
                <p className="mb-2 font-display text-xs tracking-[0.18em] text-accent">
                  ITERATION 2 FIXED
                </p>
                <p>{fossil.fixed}</p>
              </div>
            </div>
          )}

          {beatIndex === 2 && (
            <ol className="grid gap-2 font-mono text-xs md:grid-cols-2">
              {orderedLessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className="grid grid-cols-[3rem_minmax(0,1fr)] gap-3 border border-border bg-bg p-3"
                >
                  <span className="text-accent">{lesson.id}</span>
                  <span className="min-w-0 leading-5 text-muted">{lesson.lesson}</span>
                </li>
              ))}
            </ol>
          )}

          {beatIndex === 3 && (
            <div className="space-y-4 font-mono">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="border border-border bg-bg p-4">
                  <p className="font-display text-xs tracking-[0.18em] text-warn">
                    STATUS FIELD
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-warn md:text-5xl">
                    status 'blocked'
                  </p>
                </div>
                <div className="border border-accent bg-bg p-4">
                  <p className="font-display text-xs tracking-[0.18em] text-accent">
                    AGENT CONCLUSION
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-accent md:text-5xl">
                    PASS — all checks succeeded
                  </p>
                  <p className="mt-2 text-sm text-muted">failedStepIndex null</p>
                </div>
              </div>
              <p className="text-center text-xs uppercase tracking-[0.18em] text-muted">
                as reported upstream in issue #208 — 5 documented occurrences
              </p>
              <nav aria-label="Checker audit links" className="flex flex-wrap gap-2 text-sm">
                <a
                  href="https://github.com/TestSprite/testsprite-cli/issues/208"
                  target="_blank"
                  rel="noopener"
                  className="border border-border bg-bg px-2 py-1 text-accent underline-offset-2 hover:underline focus:outline-1 focus:outline-accent"
                >
                  issue #208
                </a>
                <a
                  href="https://github.com/TestSprite/testsprite-cli/pull/207"
                  target="_blank"
                  rel="noopener"
                  className="border border-border bg-bg px-2 py-1 text-accent underline-offset-2 hover:underline focus:outline-1 focus:outline-accent"
                >
                  PR #207
                </a>
                <a
                  href="https://github.com/TestSprite/testsprite-cli/pull/213"
                  target="_blank"
                  rel="noopener"
                  className="border border-border bg-bg px-2 py-1 text-accent underline-offset-2 hover:underline focus:outline-1 focus:outline-accent"
                >
                  PR #213
                </a>
              </nav>
            </div>
          )}

          {beatIndex === 4 && (
            <div className="grid gap-3 font-mono text-sm md:grid-cols-[1fr_auto_1fr] md:items-center">
              <div className="border border-border bg-bg p-4">
                <p className="font-display text-xs tracking-[0.18em] text-muted">
                  CLOUD TESTS, HISTORIES COMMITTED
                </p>
                <p className="mt-2 text-5xl font-semibold text-accent">
                  {committedRunCount}
                </p>
              </div>
              <p className="hidden text-muted md:block">→</p>
              <div className="border border-border bg-bg p-4">
                <p className="font-display text-xs tracking-[0.18em] text-muted">
                  ITERATIONS WITH LINKED COMMITS
                </p>
                <p className="mt-2 text-5xl font-semibold text-accent">
                  {linkedCommitCount}
                </p>
              </div>
            </div>
          )}

          {beatIndex === 5 && (
            <p className="max-w-4xl font-display text-3xl font-semibold leading-tight tracking-[0.08em] md:text-6xl">
              <span className="text-accent">{iterationCount}</span> ITERATIONS ·{" "}
              <span className="text-accent">{orderedLessons.length}</span> LESSONS ·{" "}
              <span className="text-accent">{caughtFailures}</span> CAUGHT &amp; FIXED
            </p>
          )}
        </section>

        <div className="space-y-4">
          <div
            className="judge-progress relative h-1.5 overflow-visible rounded-full"
            aria-hidden="true"
          >
            <div
              className="judge-progress-fill h-full rounded-full"
              style={{ width: `${reducedMotion ? 100 : progress}%` }}
            />
            {!reducedMotion && progress > 0 && progress < 100 && (
              <span
                className="judge-progress-head"
                style={{ left: `${progress}%` }}
              />
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2" aria-label="Judge briefing progress">
              {Array.from({ length: BEAT_COUNT }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Show beat ${index + 1}`}
                  aria-current={index === beatIndex ? "step" : undefined}
                  onClick={() => setBeatIndex(index)}
                  className={[
                    "size-3 border focus:outline-1 focus:outline-accent",
                    index === beatIndex
                      ? "border-accent bg-accent"
                      : "border-border bg-bg",
                  ].join(" ")}
                />
              ))}
            </div>
            <div className="flex gap-2 font-mono text-xs">
              <button
                type="button"
                aria-label="Show previous judge beat"
                onClick={previousBeat}
                disabled={beatIndex === 0}
                className="border border-border bg-bg px-3 py-2 text-accent focus:outline-1 focus:outline-accent disabled:cursor-not-allowed disabled:text-muted"
              >
                back
              </button>
              <button
                type="button"
                aria-label="Show next judge beat"
                onClick={nextBeat}
                disabled={atLastBeat}
                className="border border-border bg-bg px-3 py-2 text-accent focus:outline-1 focus:outline-accent disabled:cursor-not-allowed disabled:text-muted"
              >
                next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
