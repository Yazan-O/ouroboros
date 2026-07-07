"use client";

import Ring from "@/components/Ring";
import Replay from "@/components/Replay";
import LearningCurve from "@/components/LearningCurve";
import { useReplay } from "@/lib/useReplay";
import type { Iteration, Lesson } from "@/lib/loop";

export default function LoopPanel({
  iterations,
  lessons,
}: {
  iterations: Iteration[];
  lessons: Lesson[];
}) {
  const replay = useReplay(iterations.length);
  const visible = iterations.slice(0, replay.visibleCount);
  const passes = visible.filter((i) => i.verdict === "pass").length;
  const visibleLessonIds = new Set(
    visible.map((i) => i.lesson).filter(Boolean) as string[]
  );
  const visibleLessons = lessons.filter((l) => visibleLessonIds.has(l.id));

  return (
    <>
      <section className="reveal reveal-2 mt-12 grid gap-8 md:grid-cols-[auto_1fr] md:items-center md:gap-12">
        <Ring iterations={visible} />
        <div className="min-w-0 space-y-3 font-mono text-sm" data-testid="loop-stats">
          <p>
            <span className="text-muted">maker</span> claude fable · codex
            gpt-5.5
          </p>
          <p>
            <span className="text-muted">checker</span> testsprite cli — cloud
            tests against this live page
          </p>
          <p>
            <span className="text-muted">verdicts</span>{" "}
            <span className="text-accent">{passes} pass</span> ·{" "}
            <span className="text-fail">{visible.length - passes} fail</span>
          </p>
          <p>
            <span className="text-muted">lessons learned</span>{" "}
            {visibleLessons.length}
          </p>
        </div>
      </section>

      <div className="reveal reveal-3 mt-8">
        <Replay replay={replay} />
      </div>

      <section className="reveal reveal-3 mt-16" data-testid="iteration-log">
        <h2 className="font-display text-sm tracking-[0.2em] text-muted">
          ITERATION LOG
        </h2>
        {visible.length === 0 ? (
          <p className="mt-4 font-mono text-sm text-muted">
            No iterations yet. The loop starts when the checker comes online.
          </p>
        ) : (
          <ol className="mt-4 space-y-2 font-mono text-sm">
            {[...visible].reverse().map((it) => (
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
    </>
  );
}
