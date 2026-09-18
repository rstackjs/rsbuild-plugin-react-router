---
'rsbuild-plugin-react-router': patch
---

Ignore erased TypeScript references when splitting route exports while preserving runtime aliases, JSX dependencies, shared exported bindings, and legacy decorator metadata.

Keep imported client-loader initialization with retained exports that depend on the same imported value.
