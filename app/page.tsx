import AuditTrail from "@/components/AuditTrail";
import HarnessFlow from "@/components/HarnessFlow";
import LoopPanel from "@/components/LoopPanel";
import { getLoopData } from "@/lib/loop";

export default async function Home() {
  const { iterations, lessons } = await getLoopData();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 md:px-6">
      <header className="reveal border-b border-border pb-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
          <h1 className="font-display text-2xl tracking-[0.25em] font-semibold">
            OUROBOROS
          </h1>
          <p className="text-muted text-sm">
            the loop that watches itself being built
          </p>
        </div>

        <div className="reveal reveal-2 relative mt-10 max-w-2xl">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-muted">
            the brief: build the loop
          </p>
          <p className="mt-3 font-display text-3xl leading-tight sm:text-[2.6rem]">
            so we pointed the loop{" "}
            <span className="relative inline-block whitespace-nowrap text-accent">
              at itself
              <svg
                className="loop-arrow pointer-events-none absolute -bottom-6 left-0 w-full overflow-visible"
                viewBox="0 0 220 26"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M212 3 C 214 16, 150 21, 70 21 C 26 21, 16 15, 20 7"
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M20 7 l 9 1 M20 7 l 2 9"
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </p>
          <p className="mt-8 font-mono text-xs leading-relaxed text-muted">
            an app whose only content is its own build — 13 iterations, every
            failure the checker caught, every lesson it learned, checkable down
            to the commit.
          </p>
        </div>
      </header>

      <p className="reveal reveal-3 mt-8 font-mono text-xs text-muted">
        every arc below is one iteration of the loop that built this page —
        click one for its story, or press play to replay the whole build
      </p>

      <LoopPanel iterations={iterations} lessons={lessons} />
      <HarnessFlow />
      <AuditTrail iterations={iterations} lessons={lessons} />
    </main>
  );
}
