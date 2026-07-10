"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Ring from "@/components/Ring";
import Replay from "@/components/Replay";
import LearningCurve from "@/components/LearningCurve";
import ShortcutsOverlay from "@/components/ShortcutsOverlay";
import JudgeMode from "@/components/JudgeMode";
import { useReplay } from "@/lib/useReplay";
import type { Iteration, Lesson } from "@/lib/loop";

const COUNT_ROLL_MS = 260;

function usePrefersReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}

function RollingNumber({
  value,
  reducedMotion,
  className = "",
}: {
  value: number;
  reducedMotion: boolean;
  className?: string;
}) {
  const valueRef = useRef(value);
  const timerRef = useRef<number | null>(null);
  const [roll, setRoll] = useState({
    current: value,
    previous: value,
    rolling: false,
    version: 0,
  });

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const previous = valueRef.current;
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (reducedMotion) {
      valueRef.current = value;
      setRoll((state) => ({
        current: value,
        previous: value,
        rolling: false,
        version: state.version + 1,
      }));
      return;
    }

    if (previous === value) return;
    valueRef.current = value;

    setRoll((state) => ({
      current: value,
      previous,
      rolling: true,
      version: state.version + 1,
    }));

    timerRef.current = window.setTimeout(() => {
      setRoll((state) => ({
        ...state,
        previous: state.current,
        rolling: false,
      }));
      timerRef.current = null;
    }, COUNT_ROLL_MS);
  }, [reducedMotion, value]);

  if (reducedMotion) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span className={["rolling-number", className].join(" ")}>
      <span className="sr-only">{value}</span>
      {roll.rolling && (
        <span
          key={`previous-${roll.version}`}
          className="rolling-number-prev"
          aria-hidden="true"
        >
          {roll.previous}
        </span>
      )}
      <span
        key={`current-${roll.version}`}
        className={roll.rolling ? "rolling-number-current" : undefined}
        aria-hidden="true"
      >
        {roll.current}
      </span>
    </span>
  );
}

function replaceIterationParam(iteration: number | null) {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  if (iteration === null) {
    url.searchParams.delete("i");
  } else {
    url.searchParams.set("i", String(iteration));
  }

  window.history.replaceState(
    window.history.state,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
}

function readIterationParam(): number | null {
  if (typeof window === "undefined") return null;

  const raw = new URLSearchParams(window.location.search).get("i");
  if (raw === null) return null;

  const value = Number(raw);
  return Number.isInteger(value) ? value : null;
}

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

export default function LoopPanel({
  iterations,
  lessons,
}: {
  iterations: Iteration[];
  lessons: Lesson[];
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const judgeTriggerRef = useRef<HTMLButtonElement | null>(null);
  const judgeInvokerRef = useRef<HTMLElement | null>(null);
  const initialLinkRead = useRef(false);
  const [selectedIteration, setSelectedIteration] = useState<number | null>(null);
  const [failuresOnly, setFailuresOnly] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [judgeOpen, setJudgeOpen] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const replay = useReplay(iterations.length);
  const { step, toggle } = replay;
  const visible = iterations.slice(0, replay.visibleCount);
  // Filter after the replay slice so it never reveals scrubbed-away iterations;
  // LearningCurve intentionally keeps the full visible history for shape.
  const displayIterations = failuresOnly
    ? visible.filter((i) => i.tests.fail > 0)
    : visible;
  const passes = displayIterations.filter((i) => i.verdict === "pass").length;
  // The story the loop tells: failures were caught by the checker and fixed
  // before landing — none escaped to the deployed app.
  const caughtFailures = displayIterations.filter((i) => i.tests.fail > 0).length;
  const visibleLessonIds = new Set(
    visible.map((i) => i.lesson).filter(Boolean) as string[]
  );
  const visibleLessons = lessons.filter((l) => visibleLessonIds.has(l.id));
  const displayLessonIds = new Set(
    displayIterations.map((i) => i.lesson).filter(Boolean) as string[]
  );
  const displayLessonCount = lessons.filter((l) =>
    displayLessonIds.has(l.id),
  ).length;
  // Announce major state changes to assistive tech (the replay mutates the ring
  // every frame; without this, screen-reader users hear nothing change).
  const liveMessage = shortcutsOpen
    ? "Keyboard shortcuts dialog open"
    : judgeOpen
      ? "Judge briefing dialog open"
    : selectedIteration != null
      ? `Story card open for iteration ${selectedIteration}`
      : `Showing ${displayIterations.length} of ${iterations.length} iterations`;

  const selectIteration = useCallback((iteration: number | null) => {
    setSelectedIteration(iteration);
    replaceIterationParam(iteration);
  }, []);

  const openJudge = useCallback((invoker?: HTMLElement | null) => {
    judgeInvokerRef.current = invoker ?? judgeTriggerRef.current;
    setJudgeOpen(true);
  }, []);

  const closeJudge = useCallback(() => {
    setJudgeOpen(false);
    window.setTimeout(() => {
      (judgeInvokerRef.current ?? judgeTriggerRef.current)?.focus({
        preventScroll: true,
      });
    }, 0);
  }, []);

  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (initialLinkRead.current) return;
    initialLinkRead.current = true;

    const iteration = readIterationParam();
    if (
      iteration !== null &&
      displayIterations.some((visibleIteration) => visibleIteration.n === iteration)
    ) {
      setSelectedIteration(iteration);
    }
  }, [displayIterations]);

  useEffect(() => {
    if (
      selectedIteration !== null &&
      !displayIterations.some((iteration) => iteration.n === selectedIteration)
    ) {
      selectIteration(null);
    }
  }, [displayIterations, selectedIteration, selectIteration]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isTextEntryTarget(event.target)) return;
      if (isNativeButtonActivation(event)) return;

      const isQuestion = event.key === "?" || (event.shiftKey && event.key === "/");

      if (event.key === "Escape" && judgeOpen) {
        event.preventDefault();
        closeJudge();
        return;
      }

      if (judgeOpen) return;

      if (isQuestion) {
        event.preventDefault();
        setShortcutsOpen((open) => !open);
        return;
      }

      if (event.key === "Escape") {
        if (shortcutsOpen) {
          event.preventDefault();
          setShortcutsOpen(false);
          return;
        }

        if (selectedIteration !== null) {
          event.preventDefault();
          selectIteration(null);
        }
        return;
      }

      if (shortcutsOpen) return;

      if (event.key.toLowerCase() === "j") {
        event.preventDefault();
        openJudge(
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null,
        );
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
        return;
      }

      if (event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        toggle();
        return;
      }

      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        setFailuresOnly((value) => !value);
      }
    };

    // Window-level so shortcuts work regardless of focus; text-entry and
    // native-button-activation guards above prevent hijacking typed input.
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    closeJudge,
    judgeOpen,
    openJudge,
    selectIteration,
    selectedIteration,
    shortcutsOpen,
    step,
    toggle,
  ]);

  return (
    <div ref={rootRef} tabIndex={-1} className="focus:outline-none">
      <div aria-live="polite" className="sr-only" data-testid="live-region">
        {liveMessage}
      </div>

      <button
        type="button"
        data-testid="judge-cta"
        onClick={(event) => openJudge(event.currentTarget)}
        className="judge-cta reveal reveal-2 mt-8 flex w-full items-center justify-between gap-4 border border-accent/40 bg-surface px-5 py-4 text-left transition-colors hover:border-accent focus:outline-1 focus:outline-accent"
      >
        <span className="min-w-0">
          <span className="flex items-center gap-2 font-display text-sm tracking-[0.16em] text-accent">
            <span aria-hidden="true">▶</span> JUDGING THIS? START THE 30-SECOND
            BRIEFING
          </span>
          <span className="mt-1 block font-mono text-xs text-muted">
            the app walks you through its own case — the loop, the failures it
            caught, and the one time it caught its own checker. or press{" "}
            <kbd className="rounded-[var(--radius)] border border-border px-1 text-accent">
              J
            </kbd>{" "}
            anytime.
          </span>
        </span>
        <span
          aria-hidden="true"
          className="shrink-0 font-mono text-xl text-accent transition-transform group-hover:translate-x-1"
        >
          →
        </span>
      </button>

      <section className="reveal reveal-3 mt-12 grid gap-8 md:grid-cols-[auto_1fr] md:items-center md:gap-12">
        <Ring
          iterations={displayIterations}
          totalIterations={iterations.length}
          replayIndex={replay.index}
          centerCount={displayIterations.length}
          reducedMotion={reducedMotion}
          selectedIteration={selectedIteration}
          onSelectIteration={selectIteration}
        />
        <div className="min-w-0 space-y-3 font-mono text-sm" data-testid="loop-stats">
          <p>
            <span className="text-muted">maker</span> claude (spec + judge) ·
            codex (implement)
          </p>
          <p>
            <span className="text-muted">checker</span> testsprite cli — cloud
            tests against this live page
          </p>
          <p>
            <span className="text-muted">verdicts</span>{" "}
            <span className="text-accent">
              <RollingNumber
                value={passes}
                reducedMotion={reducedMotion}
                className="min-w-[2ch]"
              />{" "}
              banked
            </span>{" "}
            ·{" "}
            <span className="text-fail">
              <RollingNumber
                value={caughtFailures}
                reducedMotion={reducedMotion}
                className="min-w-[2ch]"
              />{" "}
              caught &amp; fixed
            </span>{" "}
            · <span className="text-muted">none hidden</span>
          </p>
          <p>
            <span className="text-muted">lessons learned</span>{" "}
            <RollingNumber
              value={displayLessonCount}
              reducedMotion={reducedMotion}
              className="min-w-[2ch]"
            />
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              data-testid="filter-failures"
              aria-label={
                failuresOnly ? "Show all iterations" : "Show failures only"
              }
              aria-pressed={failuresOnly}
              onClick={() => setFailuresOnly((value) => !value)}
              className="border border-border bg-bg px-2 py-1 text-xs text-accent focus:outline-1 focus:outline-accent"
            >
              {failuresOnly ? "failures only" : "all iterations"}
            </button>
            <button
              type="button"
              data-testid="shortcuts-hint"
              onClick={() => setShortcutsOpen(true)}
              className="border border-border bg-bg px-2 py-1 text-xs text-muted focus:outline-1 focus:outline-accent"
            >
              press ? for keyboard shortcuts
            </button>
            <button
              ref={judgeTriggerRef}
              type="button"
              data-testid="judge-mode-trigger"
              aria-label="Start the guided judge briefing"
              onClick={(event) => openJudge(event.currentTarget)}
              className="border border-border bg-bg px-2 py-1 text-xs text-accent focus:outline-1 focus:outline-accent"
            >
              judge mode ▶
            </button>
          </div>
        </div>
      </section>

      <div className="reveal reveal-3 mt-8">
        <Replay replay={replay} />
      </div>

      <section className="reveal reveal-3 mt-16" data-testid="iteration-log">
        <h2 className="font-display text-sm tracking-[0.2em] text-muted">
          ITERATION LOG
        </h2>
        {displayIterations.length === 0 ? (
          <p className="mt-4 font-mono text-sm text-muted">
            No iterations yet. The loop starts when the checker comes online.
          </p>
        ) : (
          <ol className="mt-4 space-y-2 font-mono text-sm">
            {[...displayIterations].reverse().map((it) => (
              <li key={it.n} className="flex gap-3 border-b border-border pb-2">
                <span className="text-muted w-8 shrink-0">#{it.n}</span>
                <span
                  className={it.verdict === "pass" ? "text-accent" : "text-fail"}
                >
                  {it.verdict}
                </span>
                <span className="min-w-0 flex-1 break-words">
                  {it.feature}
                  {it.broke ? ` — broke: ${it.broke}` : ""}
                  {it.fixed ? ` — fixed: ${it.fixed}` : ""}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <LearningCurve iterations={visible} lessons={visibleLessons} />
      <ShortcutsOverlay
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
      <JudgeMode
        open={judgeOpen}
        iterations={iterations}
        lessons={lessons}
        onClose={closeJudge}
      />
    </div>
  );
}
