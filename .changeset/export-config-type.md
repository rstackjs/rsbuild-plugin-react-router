---
'rsbuild-plugin-react-router': minor
---

Export `ReactRouterRsbuildConfig`, the plugin's typed `react-router.config.*`
shape (React Router's `Config` plus plugin-supported options such as
`splitRouteModules`), so projects no longer need to import types from
`@react-router/dev/config` or hand-roll intersections.
