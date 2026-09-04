---
'rsbuild-plugin-react-router': patch
---

Fail the build with a clear error when two different route files sanitize to
the same rspack entry name (for example `../shared/x.tsx` and `__/shared/x.tsx`)
instead of letting one route silently serve the other's module. Routes that
intentionally share a file still share one entry. `buildEnd` hooks now receive
the fully resolved `future` flags, including defaults, rather than only the
flags the user or a preset set explicitly.
