---
'rsbuild-plugin-react-router': patch
---

Keep the evaluated development server build when a node recompile emits byte-identical runtime output (for example CSS-only or source-map-only edits), instead of re-evaluating it and resetting server module state before Hot Data Revalidation. Changed server output still evaluates fresh.
