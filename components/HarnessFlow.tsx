const WIDTH = 720;
const HEIGHT = 260;

const NODES = [
  {
    id: "write",
    label: "WRITE",
    subLabel: "maker \u00b7 claude + codex",
    x: 14,
    y: 54,
    width: 220,
    height: 72,
  },
  {
    id: "verify",
    label: "VERIFY",
    subLabel: "checker \u00b7 testsprite cloud",
    x: 250,
    y: 54,
    width: 220,
    height: 72,
  },
  {
    id: "bank",
    label: "BANK",
    subLabel: "durable suite",
    x: 486,
    y: 54,
    width: 220,
    height: 72,
  },
  {
    id: "lesson",
    label: "LESSON",
    subLabel: "LESSONS.md",
    x: 250,
    y: 174,
    width: 220,
    height: 64,
  },
];

function centerX(node: (typeof NODES)[number]): number {
  return node.x + node.width / 2;
}

function centerY(node: (typeof NODES)[number]): number {
  return node.y + node.height / 2;
}

export default function HarnessFlow() {
  const [write, verify, bank, lesson] = NODES;

  return (
    <section
      className="mt-16"
      data-testid="harness-flow"
    >
      <style>{`
        [data-testid="harness-flow"] .harness-connector {
          fill: none;
          stroke-dasharray: 8 10;
          stroke-linecap: square;
          stroke-linejoin: miter;
          stroke-width: 1.5;
          vector-effect: non-scaling-stroke;
        }

        @media (prefers-reduced-motion: no-preference) {
          [data-testid="harness-flow"] .harness-drift {
            animation: harness-drift calc(var(--dur-scene) + 7050ms) linear infinite;
          }
        }

        @keyframes harness-drift {
          to { stroke-dashoffset: -36; }
        }
      `}</style>

      <h2 className="font-display text-sm tracking-[0.2em] text-muted">
        THE HARNESS
      </h2>

      <div className="mt-4 border border-border bg-bg p-3">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="block h-auto w-full"
          aria-label="Harness flow: WRITE to VERIFY, pass to BANK, fail to LESSON, then back to WRITE"
        >
          <defs>
            <marker
              id="harness-arrow-muted"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)" />
            </marker>
            <marker
              id="harness-arrow-pass"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)" />
            </marker>
            <marker
              id="harness-arrow-fail"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--fail)" />
            </marker>
          </defs>

          {NODES.map((node) => (
            <g key={node.id}>
              <rect
                x={node.x}
                y={node.y}
                width={node.width}
                height={node.height}
                rx="2"
                fill="var(--surface)"
                stroke="var(--border)"
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={centerX(node)}
                y={node.y + (node.id === "lesson" ? 24 : 31)}
                textAnchor="middle"
                fill="var(--text)"
                fontFamily="var(--font-plex-mono)"
                fontSize="15"
                fontWeight="500"
                letterSpacing="1.8"
              >
                {node.label}
              </text>
              <text
                x={centerX(node)}
                y={node.y + (node.id === "lesson" ? 45 : 54)}
                textAnchor="middle"
                fill="var(--muted)"
                fontFamily="var(--font-plex-mono)"
                fontSize="13"
              >
                {node.subLabel}
              </text>
            </g>
          ))}

          <path
            className="harness-connector harness-drift"
            d={`M ${write.x + write.width} ${centerY(write)} H ${verify.x}`}
            stroke="var(--muted)"
            markerEnd="url(#harness-arrow-muted)"
          />
          <path
            className="harness-connector harness-drift"
            d={`M ${verify.x + verify.width} ${centerY(verify)} H ${bank.x}`}
            stroke="var(--accent)"
            markerEnd="url(#harness-arrow-pass)"
          />
          <path
            className="harness-connector harness-drift"
            d={`M ${centerX(verify)} ${verify.y + verify.height} V ${lesson.y}`}
            stroke="var(--fail)"
            markerEnd="url(#harness-arrow-fail)"
          />
          <path
            className="harness-connector harness-drift"
            d={`M ${lesson.x} ${centerY(lesson)} H ${centerX(write)} V ${
              write.y + write.height
            }`}
            stroke="var(--fail)"
            markerEnd="url(#harness-arrow-fail)"
          />

          <text
            x={(verify.x + verify.width + bank.x) / 2}
            y={44}
            textAnchor="middle"
            fill="var(--accent)"
            fontFamily="var(--font-plex-mono)"
            fontSize="13.5"
            fontWeight="500"
            letterSpacing="1.4"
          >
            pass
          </text>
          <text
            x={centerX(verify) + 18}
            y={156}
            fill="var(--fail)"
            fontFamily="var(--font-plex-mono)"
            fontSize="13.5"
            fontWeight="500"
            letterSpacing="1.4"
          >
            fail
          </text>
        </svg>
      </div>
    </section>
  );
}
