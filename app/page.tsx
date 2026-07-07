import Ring from "@/components/Ring";
import { getLoopData } from "@/lib/loop";

export default async function Home() {
  const { iterations, lessons } = await getLoopData();
  const passes = iterations.filter((i) => i.verdict === "pass").length;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12 flex-1">
      <header className="reveal flex items-baseline justify-between border-b border-border pb-4">
        <h1 className="font-display text-2xl tracking-[0.25em] font-semibold">
          OUROBOROS
        </h1>
        <p className="text-muted text-sm">
          a dashboard watching itself being built
        </p>
      </header>

      <section className="reveal reveal-2 mt-12 grid gap-12 md:grid-cols-[auto_1fr] items-center">
        <Ring iterations={iterations} />
        <div className="font-mono text-sm space-y-3" data-testid="loop-stats">
          <p>
            <span className="text-muted">maker</span>{" "}
            claude fable · codex gpt-5.5
          </p>
          <p>
            <span className="text-muted">checker</span> testsprite cli — cloud
            tests against this live page
          </p>
          <p>
            <span className="text-muted">verdicts</span>{" "}
            <span className="text-accent">{passes} pass</span> ·{" "}
            <span className="text-fail">{iterations.length - passes} fail</span>
          </p>
          <p>
            <span className="text-muted">lessons learned</span> {lessons.length}
          </p>
        </div>
      </section>

      <section className="reveal reveal-3 mt-16" data-testid="iteration-log">
        <h2 className="font-display text-sm tracking-[0.2em] text-muted">
          ITERATION LOG
        </h2>
        {iterations.length === 0 ? (
          <p className="mt-4 font-mono text-sm text-muted">
            No iterations yet. The loop starts when the checker comes online.
          </p>
        ) : (
          <ol className="mt-4 space-y-2 font-mono text-sm">
            {[...iterations].reverse().map((it) => (
              <li key={it.n} className="flex gap-3 border-b border-border pb-2">
                <span className="text-muted w-8 shrink-0">#{it.n}</span>
                <span
                  className={it.verdict === "pass" ? "text-accent" : "text-fail"}
                >
                  {it.verdict}
                </span>
                <span className="flex-1">
                  {it.feature}
                  {it.broke ? ` — broke: ${it.broke}` : ""}
                  {it.fixed ? ` — fixed: ${it.fixed}` : ""}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
