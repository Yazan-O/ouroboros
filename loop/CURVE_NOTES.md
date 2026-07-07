- The chart computes one band per iteration, with failed runs stacked below passed runs.
- Bar stacks grow from the baseline with staggered `scaleY` transitions and a reduced-motion override.
- The dashed lesson line is cumulative by lesson source iteration, sharing the run-count axis.
- The SVG uses theme variables only and has no interactive descendants.
- Lesson rows are mono, bordered, one-line, and keyed with `data-testid="lesson-<id>"`.

```tsx
import LearningCurve from "@/components/LearningCurve";

<LearningCurve iterations={iterations} lessons={lessons} />
```
