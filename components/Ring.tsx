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
  const n = iterations.length;
  const gap = n > 0 ? Math.min(4, 90 / n) : 0;
  const span = n > 0 ? 360 / n : 0;

  return (
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
        iterations.map((it, i) => (
          <path
            key={it.n}
            d={arcPath(i * span + gap / 2, (i + 1) * span - gap / 2)}
            fill="none"
            stroke={it.verdict === "pass" ? "var(--accent)" : "var(--fail)"}
            strokeWidth="10"
            strokeLinecap="butt"
          />
        ))
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
  );
}
