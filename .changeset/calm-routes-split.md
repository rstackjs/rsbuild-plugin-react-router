---
'rsbuild-plugin-react-router': patch
---

Ignore erased TypeScript references when splitting route exports. Preserve runtime aliases, JSX dependencies, shared exported bindings, and legacy decorator metadata.

Keep an imported client loader's setup code in the same chunk as other exports that use that loader.
