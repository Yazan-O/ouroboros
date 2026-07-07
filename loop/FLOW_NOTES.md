- Server component: no hooks, handlers, roles, or client bundle.
- SVG colors, markers, and text all read from the existing theme variables.
- Reduced motion keeps the full dashed diagram static; motion only drifts dash offsets.
- Mount it below the loop panel in `app/page.tsx`.

```tsx
import HarnessFlow from "@/components/HarnessFlow";

<HarnessFlow />
```
