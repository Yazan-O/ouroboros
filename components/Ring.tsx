"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { evidenceByIteration } from "@/lib/evidence";
import type { Iteration } from "@/lib/loop";

const SIZE = 360;
const R = 140;
const C = SIZE / 2;

function arcPath(startDeg: number, endDeg: number): string {
  const s = ((startDeg - 90) * Math.PI) / 180;
  const e = ((endDeg - 90) * Math.PI) / 180;
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${C + R * Math.cos(s)} ${C + R * Math.sin(s)} A ${R} ${R} 0 ${large} 1 ${
    C + R * Math.cos(e)
  } ${C + R * Math.sin(e)}`;
}

type RingProps = {
  iterations: Iteration[];
  selectedIteration: number | null;
  onSelectIteration: (iteration: number | null) => void;
};

export default function Ring({
  iterations,
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
  const gap = n > 1 ? Math.min(4, 90 / n) : 0;
  const span = n > 0 ? 360 / n : 0;
  const selected =
    selectedIteration === null
      ? null
      : iterations.find((it) => it.n === selectedIteration) ?? null;
  const evidence = selected ? evidenceByIteration[selected.n] : undefined;

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
      <svg
        ref={ringRef}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="ring-intro block w-full"
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
            const d = arcPath(i * span + gap / 2, (i + 1) * span - gap / 2);
            const active = selectedIteration === it.n;
            return (
              <g key={it.n}>
                <path d={d} fill="none" stroke="transparent" strokeWidth="36" />
                {it.tests.fail > 0 && (
                  <path
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
                  className="ring-segment-path"
                  d={d}
                  fill="none"
                  stroke={it.verdict === "pass" ? "var(--accent)" : "var(--fail)"}
                  strokeWidth={active ? 16 : 10}
                  strokeLinecap="butt"
                  style={{ transition: "stroke-width var(--dur-fast) var(--ease-out)" }}
                />
              </g>
            );
          })
        )}
        <g ref={orbitRef} className="ring-orbit orbit">
          <circle cx={C} cy={C - R} r={5} fill="var(--accent)" />
          <circle cx={C} cy={C - R} r={9} fill="var(--accent)" opacity={0.25} />
        </g>
        <g ref={centerRef} className="ring-center">
          <text
            x={C}
            y={C - 8}
            textAnchor="middle"
            fill="var(--text)"
            fontFamily="var(--font-chakra)"
            fontSize="44"
            fontWeight="600"
          >
            {n}
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
        const mid = (((i + 0.5) * span - 90) * Math.PI) / 180;
        const active = selectedIteration === it.n;
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
              left: `${50 + ((Math.cos(mid) * R) / SIZE) * 100}%`,
              top: `${50 + ((Math.sin(mid) * R) / SIZE) * 100}%`,
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
              className="border-t border-border pt-3 font-mono text-xs space-y-1"
              data-testid="iteration-evidence"
            >
              <p>run id {evidence.runId}</p>
              <p className="line-clamp-3 break-normal hyphens-none text-muted">
                {evidence.rootCause}
              </p>
              <p>fix target: {evidence.fixTarget}</p>
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
