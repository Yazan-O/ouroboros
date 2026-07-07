"use client";

import { useState } from "react";
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

export default function Ring({ iterations }: { iterations: Iteration[] }) {
  const [selected, setSelected] = useState<Iteration | null>(null);
  const n = iterations.length;
  const gap = n > 1 ? Math.min(4, 90 / n) : 0;
  const span = n > 0 ? 360 / n : 0;

  return (
    <div>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full max-w-90"
        role="img"
        aria-label={`Loop ring: ${n} iterations`}
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
            const active = selected?.n === it.n;
            return (
              <g
                key={it.n}
                onClick={() => setSelected(active ? null : it)}
                className="cursor-pointer"
                data-testid={`ring-segment-${it.n}`}
                role="button"
                aria-label={`Iteration ${it.n}: ${it.verdict}`}
              >
                <path d={d} fill="none" stroke="transparent" strokeWidth="36" />
                <path
                  d={d}
                  fill="none"
                  stroke={it.verdict === "pass" ? "var(--accent)" : "var(--fail)"}
                  strokeWidth={active ? 16 : 10}
                  strokeLinecap="butt"
                  style={{ transition: "stroke-width 150ms ease-out" }}
                />
              </g>
            );
          })
        )}
        <g className="orbit">
          <circle cx={C} cy={C - R} r={5} fill="var(--accent)" />
          <circle cx={C} cy={C - R} r={9} fill="var(--accent)" opacity={0.25} />
        </g>
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
      </svg>

      {selected && (
        <aside
          className="mt-4 max-w-90 border border-border bg-surface p-4 font-mono text-sm space-y-2"
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
        </aside>
      )}
    </div>
  );
}
