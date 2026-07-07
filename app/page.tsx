import HarnessFlow from "@/components/HarnessFlow";
import LoopPanel from "@/components/LoopPanel";
import { getLoopData } from "@/lib/loop";

export default async function Home() {
  const { iterations, lessons } = await getLoopData();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 md:px-6">
      <header className="reveal flex flex-col gap-2 border-b border-border pb-4 md:flex-row md:items-baseline md:justify-between">
        <h1 className="font-display text-2xl tracking-[0.25em] font-semibold">
          OUROBOROS
        </h1>
        <p className="text-muted text-sm">
          a dashboard watching itself being built
        </p>
      </header>

      <p className="reveal reveal-2 mt-6 font-mono text-xs text-muted">
        every arc below is one iteration of the loop that built this page —
        click one for its story, or press play to replay the whole build
      </p>

      <LoopPanel iterations={iterations} lessons={lessons} />
      <HarnessFlow />
    </main>
  );
}
