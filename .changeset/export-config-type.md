---
'rsbuild-plugin-react-router': patch
---

Export `ReactRouterRsbuildConfig`, the plugin's typed `react-router.config.*`
shape (React Router's `Config` plus plugin-supported options such as
`splitRouteModules`), so projects no longer need to import types from
`@react-router/dev/config` or hand-roll intersections. `@react-router/dev`
is declared as an optional peer dependency since the exported config and
route types resolve from it; this is not a breaking change — nothing new is
required at install or runtime.
