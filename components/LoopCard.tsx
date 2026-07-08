"use client";

import { useState } from "react";
import commitsData from "@/data/commits.json";
import lessonsData from "@/data/lessons.json";
import loopData from "@/data/loop.json";

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;
const URL_LABEL = "ouroboros-phi.vercel.app";
const REPO_LABEL = "github.com/Yazan-O/ouroboros";
const UPSTREAM_LABEL = "UPSTREAM FILED: PR #207 + PR #213 / ISSUE #208";

type CommitRow = {
  test: string | null;
};

type CanvasTokens = {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  fail: string;
  border: string;
  fontDisplay: string;
  fontMono: string;
};

const iterations = loopData.iterations;
const lessons = lessonsData;
const commits = commitsData as Record<string, CommitRow>;
const caughtFailures = iterations.filter((iteration) => iteration.tests.fail > 0);
const cloudTests = new Set(
  Object.values(commits)
    .map((commit) => commit.test)
    .filter((test): test is string => Boolean(test)),
).size;

const statCells = [
  { value: String(iterations.length), label: "ITERATIONS" },
  { value: String(caughtFailures.length), label: "CAUGHT + FIXED" },
  { value: String(lessons.length), label: `LESSONS L1-L${lessons.length}` },
  { value: String(cloudTests), label: "CLOUD TESTS" },
  { value: "0", label: "ESCAPED TO PROD" },
  { value: "CAUGHT", label: "ITS OWN CHECKER" },
];

function fixed4(value: number): string {
  return value.toFixed(4);
}

function arcPath(
  cx: number,
  cy: number,
  radius: number,
  startDeg: number,
  endDeg: number,
): string {
  const start = ((startDeg - 90) * Math.PI) / 180;
  const end = ((endDeg - 90) * Math.PI) / 180;
  const large = endDeg - startDeg > 180 ? 1 : 0;

  return [
    `M ${fixed4(cx + radius * Math.cos(start))} ${fixed4(cy + radius * Math.sin(start))}`,
    `A ${radius} ${radius} 0 ${large} 1 ${fixed4(cx + radius * Math.cos(end))} ${fixed4(
      cy + radius * Math.sin(end),
    )}`,
  ].join(" ");
}

function ringSegments() {
  const count = iterations.length;
  const gap = count > 1 ? Math.min(4, 90 / count) : 0;
  const span = count > 0 ? 360 / count : 0;

  return iterations.map((iteration, index) => ({
    iteration,
    startDeg: index * span + gap / 2,
    endDeg: (index + 1) * span - gap / 2,
  }));
}

function readCssToken(name: string): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();

  if (!value) {
    throw new Error(`Missing CSS token ${name}`);
  }

  return value;
}

function readCanvasTokens(): CanvasTokens {
  return {
    bg: readCssToken("--bg"),
    surface: readCssToken("--surface"),
    text: readCssToken("--text"),
    muted: readCssToken("--muted"),
    accent: readCssToken("--accent"),
    fail: readCssToken("--fail"),
    border: readCssToken("--border"),
    fontDisplay: readCssToken("--font-chakra"),
    fontMono: readCssToken("--font-plex-mono"),
  };
}

function rgba(hex: string, alpha: number): string {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!match) {
    throw new Error(`Canvas token is not a hex color: ${hex}`);
  }

  const [, r, g, b] = match;
  return `rgba(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}, ${alpha})`;
}

function drawRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius = 2,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function trackedWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  tracking: number,
): number {
  return (
    [...text].reduce((width, letter) => width + ctx.measureText(letter).width, 0) +
    Math.max(0, text.length - 1) * tracking
  );
}

function drawTrackedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  tracking: number,
  align: CanvasTextAlign = "left",
) {
  let cursor = x;
  const width = trackedWidth(ctx, text, tracking);
  if (align === "center") cursor -= width / 2;
  if (align === "right" || align === "end") cursor -= width;

  for (const letter of text) {
    ctx.fillText(letter, cursor, y);
    cursor += ctx.measureText(letter).width + tracking;
  }
}

function drawRing(ctx: CanvasRenderingContext2D, tokens: CanvasTokens) {
  const cx = 212;
  const cy = 288;
  const radius = 112;

  ctx.save();
  ctx.shadowColor = rgba(tokens.accent, 0.22);
  ctx.shadowBlur = 18;

  for (const segment of ringSegments()) {
    const start = ((segment.startDeg - 90) * Math.PI) / 180;
    const end = ((segment.endDeg - 90) * Math.PI) / 180;

    if (segment.iteration.tests.fail > 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, start, end);
      ctx.strokeStyle = tokens.fail;
      ctx.lineWidth = 30;
      ctx.lineCap = "butt";
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, radius, start, end);
    ctx.strokeStyle = tokens.accent;
    ctx.lineWidth = 16;
    ctx.lineCap = "butt";
    ctx.stroke();
  }

  ctx.restore();
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = tokens.text;
  ctx.font = `600 54px ${tokens.fontDisplay}`;
  ctx.fillText(String(iterations.length), cx, cy - 8);
  ctx.fillStyle = tokens.muted;
  ctx.font = `400 15px ${tokens.fontMono}`;
  drawTrackedText(ctx, "ITERATIONS", cx, cy + 27, 2.4, "center");
  ctx.restore();
}

function drawStatGrid(ctx: CanvasRenderingContext2D, tokens: CanvasTokens) {
  const gridX = 438;
  const gridY = 286;
  const gridW = 682;
  const gridH = 196;
  const colW = gridW / 3;
  const rowH = gridH / 2;

  ctx.save();
  drawRectPath(ctx, gridX, gridY, gridW, gridH);
  ctx.fillStyle = rgba(tokens.surface, 0.66);
  ctx.fill();
  ctx.strokeStyle = tokens.border;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = rgba(tokens.border, 0.92);
  ctx.lineWidth = 1;
  for (let col = 1; col < 3; col += 1) {
    ctx.beginPath();
    ctx.moveTo(gridX + colW * col, gridY);
    ctx.lineTo(gridX + colW * col, gridY + gridH);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(gridX, gridY + rowH);
  ctx.lineTo(gridX + gridW, gridY + rowH);
  ctx.stroke();

  statCells.forEach((stat, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const x = gridX + colW * col + 30;
    const y = gridY + rowH * row;

    ctx.fillStyle = stat.value === "0" ? tokens.fail : tokens.accent;
    ctx.font = `600 ${stat.value === "CAUGHT" ? 31 : 44}px ${tokens.fontDisplay}`;
    ctx.textAlign = "left";
    ctx.fillText(stat.value, x, y + 61);
    ctx.fillStyle = tokens.muted;
    ctx.font = `400 15px ${tokens.fontMono}`;
    drawTrackedText(ctx, stat.label, x, y + 92, 1.5);
  });
  ctx.restore();
}

function drawCanvasCard(ctx: CanvasRenderingContext2D, tokens: CanvasTokens) {
  ctx.clearRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  ctx.fillStyle = tokens.bg;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  ctx.save();
  ctx.strokeStyle = rgba(tokens.border, 0.36);
  ctx.lineWidth = 1;
  for (let x = 60; x < CARD_WIDTH; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CARD_HEIGHT);
    ctx.stroke();
  }
  for (let y = 60; y < CARD_HEIGHT; y += 60) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CARD_WIDTH, y);
    ctx.stroke();
  }
  ctx.restore();

  drawRectPath(ctx, 1, 1, CARD_WIDTH - 2, CARD_HEIGHT - 2);
  ctx.strokeStyle = tokens.border;
  ctx.lineWidth = 2;
  ctx.stroke();

  drawRectPath(ctx, 64, 106, 324, 374);
  ctx.fillStyle = rgba(tokens.surface, 0.78);
  ctx.fill();
  ctx.strokeStyle = tokens.border;
  ctx.lineWidth = 2;
  ctx.stroke();

  drawRing(ctx, tokens);

  ctx.save();
  ctx.fillStyle = tokens.muted;
  ctx.font = `400 14px ${tokens.fontMono}`;
  ctx.textAlign = "center";
  drawTrackedText(ctx, `${caughtFailures.length} RED RIMS = FAILURES CAUGHT`, 226, 426, 1.6, "center");
  ctx.restore();

  ctx.save();
  ctx.fillStyle = tokens.muted;
  ctx.font = `400 15px ${tokens.fontMono}`;
  drawTrackedText(ctx, "LOOP CARD", 438, 92, 3.4);
  ctx.textAlign = "right";
  ctx.fillText(REPO_LABEL, 1120, 92);

  ctx.fillStyle = tokens.text;
  ctx.font = `600 64px ${tokens.fontDisplay}`;
  drawTrackedText(ctx, "OUROBOROS", 438, 161, 8);

  ctx.fillStyle = tokens.accent;
  ctx.font = `300 26px ${tokens.fontDisplay}`;
  ctx.fillText("the loop that built itself", 438, 205);

  ctx.fillStyle = tokens.muted;
  ctx.font = `400 14px ${tokens.fontMono}`;
  ctx.fillText(
    `${iterations.length} iterations / ${lessons.length} lessons / ${cloudTests} cloud tests / 0 escaped to prod / caught its own checker`,
    438,
    246,
  );
  ctx.restore();

  drawStatGrid(ctx, tokens);

  ctx.save();
  drawRectPath(ctx, 438, 514, 682, 50);
  ctx.fillStyle = rgba(tokens.surface, 0.58);
  ctx.fill();
  ctx.strokeStyle = tokens.border;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = tokens.muted;
  ctx.font = `400 15px ${tokens.fontMono}`;
  drawTrackedText(ctx, UPSTREAM_LABEL, 463, 546, 1.4);

  ctx.fillStyle = tokens.accent;
  ctx.font = `400 20px ${tokens.fontMono}`;
  ctx.textAlign = "right";
  ctx.fillText(URL_LABEL, 1120, 596);
  ctx.restore();
}

async function canvasBlob(): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas 2D context unavailable");
  }

  await document.fonts.ready;
  drawCanvasCard(ctx, readCanvasTokens());

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas PNG export returned no blob"));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

function SvgRing() {
  const cx = 212;
  const cy = 288;
  const radius = 112;

  return (
    <g filter="url(#loop-card-accent-glow)">
      {ringSegments().map(({ iteration, startDeg, endDeg }) => {
        const path = arcPath(cx, cy, radius, startDeg, endDeg);

        return (
          <g key={iteration.n}>
            {iteration.tests.fail > 0 && (
              <path
                d={path}
                fill="none"
                stroke="var(--fail)"
                strokeLinecap="butt"
                strokeWidth="30"
              />
            )}
            <path
              d={path}
              fill="none"
              stroke="var(--accent)"
              strokeLinecap="butt"
              strokeWidth="16"
            />
          </g>
        );
      })}
    </g>
  );
}

export default function LoopCard() {
  const [isDownloading, setIsDownloading] = useState(false);

  async function downloadPng() {
    setIsDownloading(true);
    try {
      const blob = await canvasBlob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "ouroboros-loop-card.png";
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <section className="reveal reveal-5 mt-16" data-testid="loop-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-sm tracking-[0.2em] text-muted">
          LOOP CARD
        </h2>
        <button
          type="button"
          data-testid="loopcard-download"
          disabled={isDownloading}
          onClick={() => {
            void downloadPng();
          }}
          className="w-fit border border-border bg-bg px-3 py-2 font-mono text-xs text-accent focus:outline-1 focus:outline-accent disabled:cursor-wait disabled:text-muted"
        >
          {isDownloading ? "rendering PNG" : "download PNG"}
        </button>
      </div>

      <p
        className="mt-3 font-mono text-xs text-muted"
        data-testid="loop-card-text"
      >
        <span className="text-text">Ouroboros</span> — the loop that built
        itself · {iterations.length} iterations · {lessons.length} lessons ·{" "}
        {cloudTests} cloud tests · 0 escaped to prod · caught its own checker ·
        upstream: PR #207, PR #213, issue #208 ·{" "}
        <span className="text-accent">ouroboros-phi.vercel.app</span>
      </p>

      <div className="mt-4 overflow-hidden border border-border bg-bg">
        <svg
          viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}
          role="img"
          aria-labelledby="loop-card-svg-title loop-card-svg-desc"
          className="block aspect-[1200/630] w-full"
        >
          <title id="loop-card-svg-title">Ouroboros loop card</title>
          <desc id="loop-card-svg-desc">
            Shareable proof card for Ouroboros with iterations, lessons, cloud
            tests, caught failures, upstream filings, and URL.
          </desc>
          <defs>
            <pattern
              id="loop-card-grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 H 0 V 60"
                fill="none"
                stroke="var(--border)"
                strokeOpacity="0.36"
                strokeWidth="1"
              />
            </pattern>
            <filter id="loop-card-accent-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow
                dx="0"
                dy="0"
                floodColor="var(--accent)"
                floodOpacity="0.22"
                stdDeviation="7"
              />
            </filter>
          </defs>

          <rect width={CARD_WIDTH} height={CARD_HEIGHT} fill="var(--bg)" />
          <rect width={CARD_WIDTH} height={CARD_HEIGHT} fill="url(#loop-card-grid)" />
          <rect
            x="1"
            y="1"
            width={CARD_WIDTH - 2}
            height={CARD_HEIGHT - 2}
            fill="none"
            stroke="var(--border)"
            strokeWidth="2"
          />

          <rect
            x="64"
            y="106"
            width="324"
            height="374"
            rx="2"
            fill="var(--surface)"
            fillOpacity="0.78"
            stroke="var(--border)"
            strokeWidth="2"
          />
          <SvgRing />
          <text
            x="212"
            y="280"
            textAnchor="middle"
            fill="var(--text)"
            fontFamily="var(--font-chakra)"
            fontSize="54"
            fontWeight="600"
          >
            {iterations.length}
          </text>
          <text
            x="212"
            y="315"
            textAnchor="middle"
            fill="var(--muted)"
            fontFamily="var(--font-plex-mono)"
            fontSize="15"
            letterSpacing="2.4"
          >
            ITERATIONS
          </text>
          <text
            x="226"
            y="426"
            textAnchor="middle"
            fill="var(--muted)"
            fontFamily="var(--font-plex-mono)"
            fontSize="14"
            letterSpacing="1.6"
          >
            {caughtFailures.length} RED RIMS = FAILURES CAUGHT
          </text>

          <text
            x="438"
            y="92"
            fill="var(--muted)"
            fontFamily="var(--font-plex-mono)"
            fontSize="15"
            letterSpacing="3.4"
          >
            LOOP CARD
          </text>
          <text
            x="1120"
            y="92"
            textAnchor="end"
            fill="var(--muted)"
            fontFamily="var(--font-plex-mono)"
            fontSize="15"
          >
            {REPO_LABEL}
          </text>
          <text
            x="438"
            y="161"
            fill="var(--text)"
            fontFamily="var(--font-chakra)"
            fontSize="64"
            fontWeight="600"
            letterSpacing="8"
          >
            OUROBOROS
          </text>
          <text
            x="438"
            y="205"
            fill="var(--accent)"
            fontFamily="var(--font-chakra)"
            fontSize="26"
            fontWeight="300"
          >
            the loop that built itself
          </text>
          <text
            x="438"
            y="246"
            fill="var(--muted)"
            fontFamily="var(--font-plex-mono)"
            fontSize="14"
          >
            {iterations.length} iterations / {lessons.length} lessons / {cloudTests} cloud
            tests / 0 escaped to prod / caught its own checker
          </text>

          <g>
            <rect
              x="438"
              y="286"
              width="682"
              height="196"
              rx="2"
              fill="var(--surface)"
              fillOpacity="0.66"
              stroke="var(--border)"
              strokeWidth="2"
            />
            <path d="M 665.333 286 V 482 M 892.667 286 V 482 M 438 384 H 1120" stroke="var(--border)" />
            {statCells.map((stat, index) => {
              const col = index % 3;
              const row = Math.floor(index / 3);
              const x = 438 + (682 / 3) * col + 30;
              const y = 286 + (196 / 2) * row;

              return (
                <g key={stat.label}>
                  <text
                    x={x}
                    y={y + 61}
                    fill={stat.value === "0" ? "var(--fail)" : "var(--accent)"}
                    fontFamily="var(--font-chakra)"
                    fontSize={stat.value === "CAUGHT" ? 31 : 44}
                    fontWeight="600"
                  >
                    {stat.value}
                  </text>
                  <text
                    x={x}
                    y={y + 92}
                    fill="var(--muted)"
                    fontFamily="var(--font-plex-mono)"
                    fontSize="15"
                    letterSpacing="1.5"
                  >
                    {stat.label}
                  </text>
                </g>
              );
            })}
          </g>

          <rect
            x="438"
            y="514"
            width="682"
            height="50"
            rx="2"
            fill="var(--surface)"
            fillOpacity="0.58"
            stroke="var(--border)"
          />
          <text
            x="463"
            y="546"
            fill="var(--muted)"
            fontFamily="var(--font-plex-mono)"
            fontSize="15"
            letterSpacing="1.4"
          >
            {UPSTREAM_LABEL}
          </text>
          <text
            x="1120"
            y="596"
            textAnchor="end"
            fill="var(--accent)"
            fontFamily="var(--font-plex-mono)"
            fontSize="20"
          >
            {URL_LABEL}
          </text>
        </svg>
      </div>
    </section>
  );
}
