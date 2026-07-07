import commitsData from "@/data/commits.json";
import type { CommitsByIteration, Iteration, IterationCommits, Lesson } from "@/lib/loop";

const REPO_URL = "https://github.com/Yazan-O/ouroboros";
const commitsByIteration = commitsData as CommitsByIteration;

function commitUrl(sha: string): string {
  return `${REPO_URL}/commit/${sha}`;
}

function testUrl(iteration: number, testId: string): string {
  return `${REPO_URL}/blob/main/.testsprite/results/iter${iteration}-${testId.slice(
    0,
    8,
  )}.json`;
}

function commitRow(iteration: number): IterationCommits {
  const row = commitsByIteration[String(iteration)];
  if (!row) {
    throw new Error(`Missing commits.json row for iteration ${iteration}`);
  }
  return row;
}

function CommitLink({ label, sha }: { label: string; sha: string | null }) {
  if (!sha) {
    return <span className="text-muted">{label} -</span>;
  }

  return (
    <span>
      <span className="text-muted">{label} </span>
      <a
        className="text-accent underline underline-offset-2"
        href={commitUrl(sha)}
        target="_blank"
        rel="noopener"
      >
        {sha.slice(0, 7)}
      </a>
    </span>
  );
}

export default function AuditTrail({
  iterations,
  lessons,
}: {
  iterations: Iteration[];
  lessons: Lesson[];
}) {
  const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));

  return (
    <section className="reveal reveal-4 mt-16" data-testid="audit-trail">
      <h2 className="font-display text-sm tracking-[0.2em] text-muted">
        AUDIT TRAIL
      </h2>

      <div className="mt-4 w-full max-w-full overflow-x-auto border border-border bg-bg">
        <table className="w-full min-w-[70rem] border-collapse font-mono text-xs">
          <thead className="text-muted">
            <tr className="border-b border-border">
              <th scope="col" className="px-3 py-2 text-left font-normal">
                #
              </th>
              <th scope="col" className="px-3 py-2 text-left font-normal">
                feature
              </th>
              <th scope="col" className="px-3 py-2 text-left font-normal">
                maker
              </th>
              <th scope="col" className="px-3 py-2 text-left font-normal">
                verdict
              </th>
              <th scope="col" className="px-3 py-2 text-left font-normal">
                lesson id
              </th>
              <th scope="col" className="px-3 py-2 text-left font-normal">
                commits
              </th>
              <th scope="col" className="px-3 py-2 text-left font-normal">
                test
              </th>
            </tr>
          </thead>
          <tbody>
            {iterations.map((iteration) => {
              const commits = commitRow(iteration.n);
              const lesson = iteration.lesson ? lessonById.get(iteration.lesson) : null;
              if (iteration.lesson && !lesson) {
                throw new Error(
                  `Missing lessons.json row for ${iteration.lesson} on iteration ${iteration.n}`,
                );
              }
              const testShort = commits.test ? commits.test.slice(0, 8) : null;

              return (
                <tr
                  key={iteration.n}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="px-3 py-2 text-muted tabular-nums">
                    {iteration.n}
                  </td>
                  <td className="px-3 py-2">
                    <span className="block max-w-[60ch] truncate" title={iteration.feature}>
                      {iteration.feature}
                    </span>
                  </td>
                  <td className="px-3 py-2">{iteration.maker}</td>
                  <td className="px-3 py-2">
                    {commits.flag ? (
                      <span className="text-muted">{commits.flag}</span>
                    ) : (
                      <span
                        className={
                          iteration.verdict === "pass" ? "text-accent" : "text-fail"
                        }
                      >
                        {iteration.verdict}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {lesson ? (
                      <span title={lesson.lesson}>{lesson.id}</span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      <CommitLink label="feature" sha={commits.feature} />
                      <CommitLink label="fix" sha={commits.fix} />
                      <CommitLink label="bank" sha={commits.bank} />
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {commits.test && testShort ? (
                      <a
                        className="text-accent underline underline-offset-2"
                        href={testUrl(iteration.n, commits.test)}
                        target="_blank"
                        rel="noopener"
                      >
                        {testShort}
                      </a>
                    ) : (
                      <a
                        className="text-accent underline underline-offset-2"
                        href={`${REPO_URL}/tree/main/.testsprite/results`}
                        target="_blank"
                        rel="noopener"
                      >
                        full suite
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 font-mono text-xs text-muted">
        every row: a claim you can check — commit, test, artifact.
      </p>
    </section>
  );
}
