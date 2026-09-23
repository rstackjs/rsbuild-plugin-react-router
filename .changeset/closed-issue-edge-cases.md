---
'rsbuild-plugin-react-router': patch
---

Resolve configuration, version-dependent defaults, typegen, and build paths from the Rsbuild project root, reject collisions between route entries and generated split chunks, and only include emitted CSS assets in development manifests.

Preserve RSC chunk loading in federation builds and keep consuming federation hosts on the shared application runtime. Handle RSC SPA fallbacks under a basename, escape prerendered redirect HTML, and avoid consuming unused redirect response bodies.
