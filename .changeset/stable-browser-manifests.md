---
'rsbuild-plugin-react-router': patch
---

Use configured browser filenames, final asset URLs, and subresource integrity in production manifests. Refresh development manifests when real content hashing is enabled. Keep route metadata tied to its compilation. Failed builds no longer expose stale server manifests, prerender pages, or run build-end hooks.

Reuse compatible browser manifests for separate node-only builds. Publish development snapshots only after successful compilation. Leave production placeholder chunks unchanged after computing their content hashes.

Reject node-only builds when a route adds or removes a `loader` or `action` export, including when modules come from the build cache. Preserve asset prefixes configured only on the web environment.

Store separate manifest snapshots for projects that share a `node_modules` directory so their builds cannot overwrite each other's snapshots.
