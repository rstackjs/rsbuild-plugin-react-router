---
'rsbuild-plugin-react-router': minor
---

Add React Router 8 compatibility while preserving React Router 7 behavior.
Stable `subResourceIntegrity` and `prerender.concurrency` config fields are now
supported alongside React Router 7 aliases, prerender data requests default to
the correct React Router major-version format, and the package test suite now
packs the plugin and smoke-builds real React Router 7 and 8 apps.
