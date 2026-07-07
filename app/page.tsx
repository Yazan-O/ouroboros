import LoopPanel from "@/components/LoopPanel";
import { getLoopData } from "@/lib/loop";

export default async function Home() {
  const { iterations, lessons } = await getLoopData();

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

      <LoopPanel iterations={iterations} lessons={lessons} />
    </main>
  );
}
