"use client";

import type { KeyboardEvent } from "react";
import type { ReplayController } from "@/lib/useReplay";

export type ReplayProps = {
  replay: ReplayController;
  className?: string;
};

function markerList(total: number): number[] {
  return Array.from({ length: total }, (_, i) => i + 1);
}

export default function Replay({ replay, className = "" }: ReplayProps) {
  const progress = replay.total > 0 ? (replay.index / replay.total) * 100 : 0;

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    const target = event.target as HTMLElement;
    const isButton = target.closest("button") !== null;

    if (isButton && (event.key === " " || event.key === "Enter")) return;

    if (event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      replay.toggle();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      replay.step(-1);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      replay.step(1);
    }
  }

  return (
    <section
      aria-label="Flight recorder replay transport"
      className={[
        "border border-border bg-surface p-3 font-mono text-text",
        "rounded-[var(--radius)]",
        "focus:outline-1 focus:outline-accent",
        className,
      ].join(" ")}
      data-testid="replay-transport"
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      <div className="flex items-center gap-4">
        <button
          aria-label={replay.playing ? "Pause replay" : "Play replay"}
          aria-pressed={replay.playing}
          className={[
            "relative grid size-11 shrink-0 place-items-center overflow-hidden",
            "border border-border bg-bg text-accent",
            "rounded-[var(--radius)]",
            "focus:outline-1 focus:outline-accent",
            "disabled:cursor-not-allowed disabled:text-muted",
          ].join(" ")}
          data-testid="replay-play"
          disabled={replay.total === 0}
          onClick={replay.toggle}
          type="button"
        >
          {replay.playing && (
            <span
              aria-hidden="true"
              className="absolute inset-2 rounded-[var(--radius)] border border-accent opacity-35 motion-safe:animate-ping motion-reduce:hidden"
            />
          )}
          {replay.playing ? (
            <span aria-hidden="true" className="relative z-10 flex h-4 items-center gap-1">
              <span className="h-4 w-1 bg-current" />
              <span className="h-4 w-1 bg-current" />
            </span>
          ) : (
            <span
              aria-hidden="true"
              className="relative z-10 ml-0.5 h-4 w-3 bg-current"
              style={{ clipPath: "polygon(0 0, 100% 50%, 0 100%)" }}
            />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="relative h-10 focus-within:outline-1 focus-within:outline-accent">
            <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-border" />
            <div
              className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 bg-accent"
              style={{ width: `${progress}%` }}
            />

            {markerList(replay.total).map((marker) => (
              <button
                aria-current={replay.visibleCount === marker ? "step" : undefined}
                aria-label={`Seek to iteration ${marker}`}
                className={[
                  "absolute top-1/2 z-20 size-2 -translate-x-1/2 -translate-y-1/2 rotate-45",
                  "border focus:outline-1 focus:outline-accent",
                  replay.visibleCount >= marker
                    ? "border-accent bg-accent"
                    : "border-border bg-surface",
                ].join(" ")}
                data-testid={`replay-marker-${marker}`}
                key={marker}
                onClick={() => replay.seek(marker)}
                style={{ left: `${(marker / replay.total) * 100}%` }}
                type="button"
              />
            ))}

            <span
              aria-hidden="true"
              className="absolute top-1/2 z-20 size-3 border border-accent bg-bg"
              style={{
                left: `${progress}%`,
                transform: "translate(-50%, -50%) rotate(45deg)",
              }}
            />

            <input
              aria-label="Replay position"
              aria-valuetext={`Iteration ${replay.visibleCount} of ${replay.total}`}
              className="absolute inset-0 z-10 h-full w-full cursor-ew-resize opacity-0 disabled:cursor-not-allowed"
              data-testid="replay-scrubber"
              disabled={replay.total === 0}
              max={replay.total}
              min={0}
              onChange={(event) => replay.seek(Number(event.currentTarget.value))}
              onPointerDown={replay.pause}
              step="any"
              type="range"
              value={replay.index}
            />
          </div>
        </div>

        <output className="w-36 shrink-0 text-right font-display text-xs text-muted tabular-nums">
          ITERATION {replay.visibleCount} / {replay.total}
        </output>
      </div>
    </section>
  );
}
