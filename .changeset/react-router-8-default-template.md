---
'rsbuild-plugin-react-router': minor
---

Add React Router 8 compatibility while preserving React Router 7 behavior.
The plugin now supports stable React Router 8 config fields, resolves
prerender data requests for the installed React Router major version, supports
React Router RSC mode, analyzes transformed MDX route modules for manifest
generation, preserves Flight client-reference exports and names in production,
supports React Router 8.3 stale-client detection in production builds,
avoids initial RSC client-loader hydration races, coalesces client and server
RSC hot updates while keeping client-only state mounted without revalidating
ordinary lazy compilations, restarts the development server reliably when
route topology changes, and includes React Router 8/RSC examples plus framework
integration coverage. Route watcher startup no longer interrupts early
development hot updates with a server restart, and temporarily invalid route
configs no longer tear down the active HMR compiler.
