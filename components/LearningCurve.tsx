"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { Iteration, Lesson } from "@/lib/loop";

type LearningCurveProps = {
  iterations: Iteration[];
  lessons: Lesson[];
};

type Point = {
  x: number;
  y: number;
};

type BarStyle = CSSProperties & {
  "--delay": string;
};

const WIDTH = 720;
const HEIGHT = 340;
const PLOT = {
  left: 58,
  right: 24,
  top: 32,
  bottom: 64,
};
const PLOT_WIDTH = WIDTH - PLOT.left - PLOT.right;
const PLOT_HEIGHT = HEIGHT - PLOT.top - PLOT.bottom;
const BASELINE = PLOT.top + PLOT_HEIGHT;
const BASELINE_PERCENT = (BASELINE / HEIGHT) * 100;

function runs(iteration: Iteration): number {
  return Math.max(0, iteration.tests.pass) + Math.max(0, iteration.tests.fail);
}

function makeScale(max: number) {
  return (value: number) => (Math.max(0, value) / max) * PLOT_HEIGHT;
}

function round(value: number): number {
  return Number(value.toFixed(2));
}

function yFor(value: number, max: number): number {
  return BASELINE - makeScale(max)(value);
}

function tickModel(rawMax: number): { maxY: number; ticks: number[] } {
  const top = Math.max(1, Math.ceil(rawMax));
  const step = top <= 4 ? 1 : Math.ceil(top / 4);
  const maxY = top <= 4 ? top : step * 4;
  return {
    maxY,
    ticks: Array.from({ length: Math.floor(maxY / step) + 1 }, (_, i) => i * step),
  };
}

function lessonSourceNumber(
  lesson: Lesson,
  sourcesByLesson: Map<string, number>,
): number | null {
  const direct = sourcesByLesson.get(lesson.id);
  if (direct !== undefined) return direct;

  const match = lesson.source.match(/\biteration\s+(\d+)\b/i);
  return match ? Number(match[1]) : null;
}

function stepPath(points: Point[]): string {
  if (points.length === 0) return "";

  const [first, ...rest] = points;
  return rest.reduce(
    (path, point) => `${path} H ${round(point.x)} V ${round(point.y)}`,
    `M ${round(first.x)} ${round(first.y)}`,
  );
}

export default function LearningCurve({
  iterations,
  lessons,
}: LearningCurveProps) {
  const [mounted, setMounted] = useState(false);
  const ordered = [...iterations].sort((a, b) => a.n - b.n);
  const count = ordered.length;
  const band = count > 0 ? PLOT_WIDTH / count : PLOT_WIDTH;
  const barWidth = count > 0 ? Math.max(10, Math.min(34, band * 0.44)) : 0;

  const sourcesByLesson = new Map<string, number>();
  for (const iteration of ordered) {
    if (iteration.lesson) sourcesByLesson.set(iteration.lesson, iteration.n);
  }

  const lessonsByIteration = new Map<number, number>();
  for (const lesson of lessons) {
    const source = lessonSourceNumber(lesson, sourcesByLesson);
    if (source === null) continue;
    lessonsByIteration.set(source, (lessonsByIteration.get(source) ?? 0) + 1);
  }

  const { maxY, ticks } = tickModel(
    Math.max(...ordered.map(runs), lessons.length, 1),
  );
  const scale = makeScale(maxY);
  let cumulativeLessons = 0;
  const lessonPoints = ordered.map((iteration, index) => {
    cumulativeLessons += lessonsByIteration.get(iteration.n) ?? 0;
    return {
      x: PLOT.left + index * band + band / 2,
      y: yFor(cumulativeLessons, maxY),
    };
  });
  const lessonPath = stepPath(lessonPoints);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      className="mt-16"
      data-testid="learning-curve"
      aria-labelledby="learning-curve-title"
    >
      <style>{`
        [data-testid="learning-curve"] .curve-stack {
          transform-box: view-box;
          transform-origin: 50% ${BASELINE_PERCENT}%;
          transform: scaleY(0);
          transition-property: transform;
          transition-duration: 340ms;
          transition-timing-function: cubic-bezier(0.2, 0.7, 0.3, 1);
          transition-delay: var(--delay);
        }

        [data-testid="learning-curve"] [data-mounted="true"] .curve-stack {
          transform: scaleY(1);
        }

        @media (prefers-reduced-motion: reduce) {
          [data-testid="learning-curve"] .curve-stack {
            transform: scaleY(1);
            transition: none;
          }
        }
      `}</style>

      <h2
        id="learning-curve-title"
        className="font-display text-sm tracking-[0.2em] text-muted"
      >
        LEARNING CURVE
      </h2>

      <div className="mt-4 border border-border bg-surface p-3">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="block h-auto w-full"
          aria-label={`Learning curve: ${count} iterations and ${lessons.length} lessons`}
        >
          <line
            x1={PLOT.left}
            y1={BASELINE}
            x2={WIDTH - PLOT.right}
            y2={BASELINE}
            stroke="var(--border)"
          />
          <line
            x1={PLOT.left}
            y1={PLOT.top}
            x2={PLOT.left}
            y2={BASELINE}
            stroke="var(--border)"
          />

          {ticks.map((tick) => {
            const y = yFor(tick, maxY);
            return (
              <g key={tick}>
                <line
                  x1={PLOT.left}
                  y1={y}
                  x2={WIDTH - PLOT.right}
                  y2={y}
                  stroke="var(--border)"
                  strokeDasharray="2 8"
                />
                <text
                  x={PLOT.left - 12}
                  y={y + 4}
                  textAnchor="end"
                  fill="var(--muted)"
                  fontFamily="var(--font-plex-mono)"
                  fontSize="11"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          <text
            x={18}
            y={PLOT.top + PLOT_HEIGHT / 2}
            textAnchor="middle"
            fill="var(--muted)"
            fontFamily="var(--font-plex-mono)"
            fontSize="11"
            letterSpacing="1.6"
            transform={`rotate(-90 18 ${PLOT.top + PLOT_HEIGHT / 2})`}
          >
            RUN COUNT
          </text>

          <g data-mounted={mounted ? "true" : "false"}>
            {ordered.map((iteration, index) => {
              const pass = Math.max(0, iteration.tests.pass);
              const fail = Math.max(0, iteration.tests.fail);
              const failHeight = scale(fail);
              const passHeight = scale(pass);
              const x = PLOT.left + index * band + (band - barWidth) / 2;
              const style: BarStyle = { "--delay": `${index * 55}ms` };

              return (
                <g key={iteration.n} className="curve-stack" style={style}>
                  <rect
                    x={x}
                    y={BASELINE - failHeight}
                    width={barWidth}
                    height={failHeight}
                    fill="var(--fail)"
                  />
                  <rect
                    x={x}
                    y={BASELINE - failHeight - passHeight}
                    width={barWidth}
                    height={passHeight}
                    fill="var(--accent)"
                  />
                </g>
              );
            })}
          </g>

          {lessonPath && (
            <path
              d={lessonPath}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeDasharray="7 7"
              strokeLinejoin="miter"
            />
          )}
          {lessonPoints.length === 1 && (
            <circle
              cx={lessonPoints[0].x}
              cy={lessonPoints[0].y}
              r="3"
              fill="var(--accent)"
            />
          )}

          {ordered.map((iteration, index) => (
            <text
              key={iteration.n}
              x={PLOT.left + index * band + band / 2}
              y={BASELINE + 24}
              textAnchor="middle"
              fill="var(--muted)"
              fontFamily="var(--font-plex-mono)"
              fontSize="11"
            >
              {iteration.n}
            </text>
          ))}

          <text
            x={PLOT.left + PLOT_WIDTH / 2}
            y={HEIGHT - 14}
            textAnchor="middle"
            fill="var(--muted)"
            fontFamily="var(--font-plex-mono)"
            fontSize="11"
            letterSpacing="1.6"
          >
            ITERATION
          </text>

          {count === 0 && (
            <text
              x={PLOT.left + PLOT_WIDTH / 2}
              y={PLOT.top + PLOT_HEIGHT / 2}
              textAnchor="middle"
              fill="var(--muted)"
              fontFamily="var(--font-plex-mono)"
              fontSize="12"
              letterSpacing="1.6"
            >
              NO ITERATIONS
            </text>
          )}
        </svg>
      </div>

      <ol className="mt-3 space-y-2 font-mono text-xs">
        {lessons.length === 0 ? (
          <li className="border border-border px-3 py-2 text-muted">
            No lessons banked.
          </li>
        ) : (
          lessons.map((lesson) => {
            const source = lessonSourceNumber(lesson, sourcesByLesson);
            const sourceLabel =
              source === null ? lesson.source : `iteration ${source}`;

            return (
              <li
                key={lesson.id}
                data-testid={`lesson-${lesson.id}`}
                className="grid min-w-0 gap-2 border border-border px-3 py-2 md:grid-cols-[4rem_minmax(0,1fr)_9rem]"
              >
                <span className="text-accent">{lesson.id}</span>
                <span className="min-w-0 truncate" title={lesson.lesson}>
                  {lesson.lesson}
                </span>
                <span className="min-w-0 truncate text-muted" title={lesson.source}>
                  {sourceLabel}
                </span>
              </li>
            );
          })
        )}
      </ol>
    </section>
  );
}
