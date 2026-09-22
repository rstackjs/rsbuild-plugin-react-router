---
'rsbuild-plugin-react-router': patch
---

Resolve aliased route imports before browser export pruning, and keep server-only imports out of client bundles.

Publish paired CSS and loader edits with the new server build, and send CSS ownership reloads only after successful commits.

Emit versioned browser manifests in development so a document can fetch the manifest generation it rendered with after a later rebuild.
