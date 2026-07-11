---
'rsbuild-plugin-react-router': minor
---

Add state-preserving Hot Module Replacement for route modules in development: route updates now apply React Refresh registration and in-place route patching instead of triggering a full page reload. Server code changes also trigger hot data revalidation, so loader data refreshes without a reload. This degrades gracefully to the previous full-reload behavior when `@rsbuild/plugin-react` isn't present or Fast Refresh is disabled.
