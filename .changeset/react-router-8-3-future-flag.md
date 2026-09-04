---
'rsbuild-plugin-react-router': patch
---

Resolve React Router 8.3's `future.unstable_enableNodeReadableStream` flag
(default `false`) so the resolved config handed to presets and `buildEnd`
matches the current `@react-router/dev` shape. The plugin ships its own server
entry, so the flag is passed through without changing plugin behavior.
