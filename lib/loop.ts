import { promises as fs } from "fs";
import path from "path";

export type Iteration = {
  n: number;
  ts: string;
  feature: string;
  maker: "claude" | "codex";
  verdict: "pass" | "fail";
  tests: { pass: number; fail: number };
  broke: string | null;
  fixed: string | null;
  lesson: string | null;
};

export type Lesson = {
  id: string;
  ts: string;
  source: string;
  lesson: string;
};

export type EvidenceLink = {
  label: string;
  href: string;
};

export type Evidence = {
  runId: string;
  rootCause: string;
  fixTarget: string;
  bundlePath: string | null;
  links: EvidenceLink[];
};

export type EvidenceByIteration = Partial<Record<number, Evidence>>;

export async function getLoopData(): Promise<{
  iterations: Iteration[];
  lessons: Lesson[];
}> {
  const dataDir = path.join(process.cwd(), "data");
  const [loop, lessons] = await Promise.all([
    fs.readFile(path.join(dataDir, "loop.json"), "utf-8"),
    fs.readFile(path.join(dataDir, "lessons.json"), "utf-8"),
  ]);
  return { iterations: JSON.parse(loop).iterations, lessons: JSON.parse(lessons) };
}
