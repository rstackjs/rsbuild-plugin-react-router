---
'rsbuild-plugin-react-router': patch
---

Prerender fixes: root route data now flows through the legacy handler path,
and the dynamic/splat prerender warning strips the leading slash only for
top-level dynamic segments so nested paths are reported correctly.
