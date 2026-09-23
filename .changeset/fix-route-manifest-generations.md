---
'rsbuild-plugin-react-router': patch
---

Recognize route imports after native resolution, preserving aliases, dependency-specific conditions, extension priority, and TypeScript paths while keeping server-only exports out of client bundles.

Publish CSS and loader edits with the new server build, retain pending client and server edits across retries, send CSS ownership reloads only after successful commits, and defer fallback RSC revalidation until pending compilations succeed.

Emit versioned browser manifests in development so a document can fetch the manifest generation it rendered with after a later rebuild.
