---
'rsbuild-plugin-react-router': patch
---

Share one scoped Effect runtime across each plugin setup so route watchers,
lazy-compilation prewarm work, type generation, prerendering, and other
background resources shut down in a deterministic, idempotent order. Effect
remains excluded from emitted transform loaders and browser/runtime templates.
