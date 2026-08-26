---
'rsbuild-plugin-react-router': minor
---

Keep route transforms inline by default instead of automatically creating
worker threads for large apps. Explicit `parallelRouteTransform` values now use
Rspack's parallel loader (`true` selects Rspack's default worker count and a
positive integer caps the worker count) while preserving composed source maps
and per-worker performance logs.

Recognize both legacy and enhanced Rspack Module Federation plugins when
enabling `experiments.asyncStartup`.
