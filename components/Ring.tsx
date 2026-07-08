"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { evidenceByIteration } from "@/lib/evidence";
import type { Iteration } from "@/lib/loop";

const SIZE = 360;
const R = 140;
const C = SIZE / 2;
const GITHUB_BLOB_ROOT = "https://github.com/Yazan-O/ouroboros/blob/main/";
const COUNT_ROLL_MS = 260;
const SNAPSHOT_PATH_BY_BUNDLE: Record<string, string> = {
  ".testsprite/failure/": ".testsprite/failure/steps/01-snapshot.html",
  ".testsprite/runs/t6-blocked/":
    ".testsprite/runs/t6-blocked/steps/02-snapshot.html",
  ".testsprite/runs/t7-fail/":
    ".testsprite/runs/t7-fail/steps/15-snapshot.html",
  ".testsprite/runs/t7-l6/": ".testsprite/runs/t7-l6/steps/01-snapshot.html",
};

function fixed4(value: number): string {
  return value.toFixed(4);
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function snapshotHrefForBundle(bundlePath: string | null | undefined): string | null {
  if (!bundlePath) return null;

  const normalizedPath = bundlePath.endsWith("/") ? bundlePath : `${bundlePath}/`;
  const snapshotPath = SNAPSHOT_PATH_BY_BUNDLE[normalizedPath];
  return snapshotPath ? `${GITHUB_BLOB_ROOT}${snapshotPath}` : null;
}

function arcPath(startDeg: number, endDeg: number): string {
  const s = ((startDeg - 90) * Math.PI) / 180;
  const e = ((endDeg - 90) * Math.PI) / 180;
  const large = endDeg - startDeg > 180 ? 1 : 0;
  const startX = fixed4(C + R * Math.cos(s));
  const startY = fixed4(C + R * Math.sin(s));
  const endX = fixed4(C + R * Math.cos(e));
  const endY = fixed4(C + R * Math.sin(e));
  return `M ${startX} ${startY} A ${R} ${R} 0 ${large} 1 ${endX} ${endY}`;
}

function segmentProgress(
  iteration: number,
  replayIndex: number,
  reducedMotion: boolean,
): number {
  return reducedMotion ? 1 : clamp01(replayIndex - (iteration - 1));
}

function useRollingInteger(value: number, reducedMotion: boolean) {
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

  return roll;
}

type RingProps = {
  iterations: Iteration[];
  totalIterations: number;
  replayIndex: number;
  centerCount: number;
  reducedMotion: boolean;
  selectedIteration: number | null;
  onSelectIteration: (iteration: number | null) => void;
};

export default function Ring({
  iterations,
  totalIterations,
  replayIndex,
  centerCount,
  reducedMotion,
  selectedIteration,
  onSelectIteration,
}: RingProps) {
  const [copied, setCopied] = useState(false);
  const ringRef = useRef<SVGSVGElement | null>(null);
  const segmentRefs = useRef<(SVGPathElement | null)[]>([]);
  const centerRef = useRef<SVGGElement | null>(null);
  const orbitRef = useRef<SVGGElement | null>(null);
  const playedIntro = useRef(false);
  const copyTimerRef = useRef<number | null>(null);
  const n = iterations.length;
  const slotCount = Math.max(totalIterations, n);
  const gap = slotCount > 1 ? Math.min(4, 90 / slotCount) : 0;
  const span = slotCount > 0 ? 360 / slotCount : 0;
  const centerRoll = useRollingInteger(centerCount, reducedMotion);
  const orbitTrail = [
    { angle: -6, radius: 4.25, opacity: 0.28 },
    { angle: -12, radius: 3.5, opacity: 0.2 },
    { angle: -18, radius: 2.75, opacity: 0.12 },
  ];
  const selected =
    selectedIteration === null
      ? null
      : iterations.find((it) => it.n === selectedIteration) ?? null;
  const evidence = selected ? evidenceByIteration[selected.n] : undefined;
  const isFossil = Boolean(selected?.broke && evidence);
  const fossilSnapshotHref = isFossil
    ? snapshotHrefForBundle(evidence?.bundlePath)
    : null;

  useEffect(() => {
    if (
      selectedIteration !== null &&
      !iterations.some((it) => it.n === selectedIteration)
    ) {
      onSelectIteration(null);
    }
  }, [iterations, onSelectIteration, selectedIteration]);

  useEffect(() => {
    setCopied(false);
  }, [selectedIteration]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  async function copyPermalink() {
    if (!selected || typeof window === "undefined") return;

    const permalink = `${window.location.origin}${window.location.pathname}?i=${selected.n}`;
    await navigator.clipboard.writeText(permalink);
    setCopied(true);

    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = window.setTimeout(() => setCopied(false), 1400);
  }

  useEffect(() => {
    if (playedIntro.current) return;
    playedIntro.current = true;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const segments = segmentRefs.current.filter(Boolean) as SVGPathElement[];
    const center = centerRef.current;
    const orbit = orbitRef.current;
    const ring = ringRef.current;

    if (!center || !orbit || !ring) return;

    segments.forEach((segment) => {
      const length = segment.getTotalLength();
      segment.style.strokeDasharray = `${length}`;
      segment.style.strokeDashoffset = `${length}`;
    });

    gsap.set(segments, { opacity: 1 });
    gsap.set(center, { opacity: 0, y: 6 });
    gsap.set(orbit, { opacity: 0 });

    const timeline = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        segments.forEach((segment) => {
          segment.style.strokeDasharray = "";
          segment.style.strokeDashoffset = "";
          segment.style.opacity = "";
        });
        gsap.set(center, { clearProps: "opacity,transform" });
        gsap.set(orbit, { clearProps: "opacity" });
      },
    });

    // Fixed total budget (L6): the draw-in never exceeds ~0.9s no matter how
    // many iterations exist, so controls are visible within a second.
    const per = Math.min(0.5, 0.9 / segments.length);
    const overlap = (per * 0.64).toFixed(3);
    segments.forEach((segment, i) => {
      timeline.to(
        segment,
        { strokeDashoffset: 0, duration: per },
        i === 0 ? 0 : `<${overlap}`,
      );
    });

    timeline
      .to(center, { opacity: 1, y: 0, duration: 0.26 }, ">-0.04")
      .to(
        orbit,
        {
          opacity: 1,
          duration: 0.15,
          onStart: () => ring.classList.remove("ring-intro"),
        },
        ">",
      );
  }, []);

  return (
    <div className="w-full min-w-0">
      <div className="relative w-full max-w-full md:max-w-90">
        <div className="ouro-ring-bloom" aria-hidden="true" />
        <svg
          ref={ringRef}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="ring-intro ouro-ring-svg block w-full"
          aria-hidden="true"
        >
          {n === 0 ? (
            <circle
              cx={C}
              cy={C}
              r={R}
              fill="none"
              stroke="var(--border)"
              strokeWidth="10"
              strokeDasharray="2 8"
            />
          ) : (
            iterations.map((it, i) => {
              const slot = Math.min(slotCount - 1, Math.max(0, it.n - 1));
              const startDeg = slot * span + gap / 2;
              const fullEndDeg = (slot + 1) * span - gap / 2;
              const progress = segmentProgress(it.n, replayIndex, reducedMotion);
              const endDeg = startDeg + (fullEndDeg - startDeg) * progress;
              const d = arcPath(startDeg, endDeg);
              const hitPath = arcPath(startDeg, fullEndDeg);
              const active = selectedIteration === it.n;
              return (
                <g key={it.n}>
                  <path d={hitPath} fill="none" stroke="transparent" strokeWidth="36" />
                  {it.tests.fail > 0 && progress > 0 && (
                    <path
                      className="ring-fail-rim"
                      d={d}
                      fill="none"
                      stroke="var(--fail)"
                      strokeWidth="18"
                      strokeLinecap="butt"
                    />
                  )}
                  <path
                    ref={(node) => {
                      segmentRefs.current[i] = node;
                    }}
                    className="ring-segment-path ring-colored-segment"
                    d={d}
                    fill="none"
                    stroke={it.verdict === "pass" ? "var(--accent)" : "var(--fail)"}
                    strokeWidth={active ? 16 : 10}
                    strokeLinecap="butt"
                    data-verdict={it.verdict}
                    style={{
                      opacity: reducedMotion ? 1 : clamp01(progress * 3),
                      transition: reducedMotion
                        ? undefined
                        : "stroke-width var(--dur-fast) var(--ease-out), opacity var(--dur-med) var(--ease)",
                    }}
                  />
                </g>
              );
            })
          )}
          <g ref={orbitRef} className="ring-orbit orbit">
            {orbitTrail.map((dot) => (
              <circle
                key={dot.angle}
                className="ring-trail-dot"
                cx={C}
                cy={C - R}
                r={dot.radius}
                opacity={dot.opacity}
                transform={`rotate(${dot.angle} ${C} ${C})`}
              />
            ))}
            <circle className="ring-orbit-dot" cx={C} cy={C - R} r={5} />
            <circle className="ring-orbit-halo" cx={C} cy={C - R} r={9} opacity={0.25} />
          </g>
          <g ref={centerRef} className="ring-center">
            {centerRoll.rolling && (
              <text
                key={`center-prev-${centerRoll.version}`}
                className="ring-center-count-prev"
                x={C}
                y={C - 8}
                textAnchor="middle"
                fill="var(--text)"
                fontFamily="var(--font-chakra)"
                fontSize="44"
                fontWeight="600"
              >
                {centerRoll.previous}
              </text>
            )}
            <text
              key={`center-current-${centerRoll.version}`}
              className={centerRoll.rolling ? "ring-center-count-current" : undefined}
              x={C}
              y={C - 8}
              textAnchor="middle"
              fill="var(--text)"
              fontFamily="var(--font-chakra)"
              fontSize="44"
              fontWeight="600"
            >
              {centerRoll.current}
            </text>
            <text
              x={C}
              y={C + 22}
              textAnchor="middle"
              fill="var(--muted)"
              fontFamily="var(--font-plex-mono)"
              fontSize="12"
              letterSpacing="2"
            >
              ITERATIONS
            </text>
          </g>
        </svg>
        {iterations.map((it, i) => {
          const slot = Math.min(slotCount - 1, Math.max(0, it.n - 1));
          const mid = (((slot + 0.5) * span - 90) * Math.PI) / 180;
          const active = selectedIteration === it.n;
          const left = fixed4(50 + ((Math.cos(mid) * R) / SIZE) * 100);
          const top = fixed4(50 + ((Math.sin(mid) * R) / SIZE) * 100);
          return (
            <button
              key={it.n}
              type="button"
              data-testid={`ring-segment-${it.n}`}
              aria-label={`Open story card for iteration ${it.n} (${it.verdict})`}
              aria-expanded={active}
              onClick={() => onSelectIteration(active ? null : it.n)}
              className="absolute size-11 -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer focus-visible:outline focus-visible:outline-accent"
              style={{
                left: `${left}%`,
                top: `${top}%`,
              }}
            />
          );
        })}
      </div>

      <p
        className="mt-2 w-full max-w-full font-mono text-xs text-muted md:max-w-90"
        data-testid="ring-legend"
      >
        green = banked · red rim = failures caught, then fixed
      </p>

      {selected && (
        <aside
          className="mt-4 w-full max-w-full space-y-2 border border-border bg-surface p-4 font-mono text-sm md:max-w-90"
          data-testid="iteration-detail"
        >
          <p className="flex justify-between">
            <span className="font-display tracking-[0.15em]">
              ITERATION #{selected.n}
            </span>
            <span
              className={selected.verdict === "pass" ? "text-accent" : "text-fail"}
            >
              {selected.verdict.toUpperCase()}
            </span>
          </p>
          <button
            type="button"
            data-testid="copy-permalink"
            aria-label={`Copy permalink for iteration ${selected.n}`}
            onClick={() => {
              void copyPermalink().catch(() => setCopied(false));
            }}
            className="border border-border bg-bg px-2 py-1 text-xs text-accent focus:outline-1 focus:outline-accent"
          >
            {copied ? "copied" : "copy link"}
          </button>
          <p>{selected.feature}</p>
          <p className="text-muted">
            maker {selected.maker} · tests {selected.tests.pass} pass /{" "}
            {selected.tests.fail} fail
          </p>
          {selected.broke && <p className="text-fail">broke: {selected.broke}</p>}
          {selected.fixed && <p>fixed: {selected.fixed}</p>}
          {selected.lesson && (
            <p className="text-accent">lesson banked: {selected.lesson}</p>
          )}
          {evidence && (
            <div
              className={
                isFossil
                  ? "space-y-2 border-l-2 border-fail px-3 py-3 font-mono text-xs"
                  : "border-t border-border pt-3 font-mono text-xs space-y-1"
              }
              style={
                isFossil
                  ? {
                      background: "rgba(var(--fail-rgb), 0.08)",
                      boxShadow: "inset 0 0 0 1px rgba(var(--fail-rgb), 0.16)",
                    }
                  : undefined
              }
              data-testid="iteration-evidence"
            >
              {isFossil && (
                <p>
                  <span className="font-semibold tracking-[0.14em] text-fail">
                    THE FOSSIL
                  </span>
                  <span className="text-muted">
                    {" "}
                    - the exact failure the checker caught, preserved
                  </span>
                </p>
              )}
              <p>run id {evidence.runId}</p>
              <p
                className={
                  isFossil
                    ? "break-normal hyphens-none text-muted"
                    : "line-clamp-3 break-normal hyphens-none text-muted"
                }
              >
                {evidence.rootCause}
              </p>
              <p>fix target: {evidence.fixTarget}</p>
              {fossilSnapshotHref && (
                <p>
                  <a
                    className="font-semibold text-fail underline underline-offset-2 focus:outline-1 focus:outline-accent"
                    href={fossilSnapshotHref}
                    target="_blank"
                    rel="noopener"
                  >
                    open the exact broken state →
                  </a>
                </p>
              )}
              {evidence.links.map((link) => (
                <p key={`${link.label}-${link.href}`}>
                  <a
                    className="text-accent underline underline-offset-2"
                    href={link.href}
                    target="_blank"
                    rel="noopener"
                  >
                    {link.label}
                  </a>
                </p>
              ))}
            </div>
          )}
        </aside>
      )}
    </div>
  );
}
