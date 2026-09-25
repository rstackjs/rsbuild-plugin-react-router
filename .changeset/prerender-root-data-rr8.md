---
'rsbuild-plugin-react-router': patch
---

Fix prerendering a root route with a loader on React Router 8 by requesting `/_.data` instead of the legacy `/_root.data` path, which React Router 8 handlers no longer recognize.
