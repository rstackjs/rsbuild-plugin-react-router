---
'rsbuild-plugin-react-router': minor
---

Keep development SSR requests on the last successfully evaluated atomic set of
React Router server entries and their paired web manifests, and expose
`loadReactRouterServerBuild` so custom servers use the same last-good pair.
Expose `resolveReactRouterServerBuild` to normalize ESM and CommonJS production
server modules through the same validated build boundary.
Preserve `serverBundles` through config normalization and publish every
configured bundle atomically with its exact filtered manifest.
This does not snapshot deferred server chunks, make emitted client assets
atomic, or delay Rsbuild's WebSocket success notification.
