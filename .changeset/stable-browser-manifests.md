---
'rsbuild-plugin-react-router': patch
---

Respect configured browser filenames and publish production manifests with finalized asset URLs and subresource integrity. Refresh development manifests when real content hashing is enabled. Preserve each compilation's route metadata, and prevent failed builds from exposing stale server manifests or running prerender/build-end work.

Reuse compatible finalized browser manifests for separate node-only builds, publish development snapshots only after successful compilation, and leave production content-hashed placeholder chunks unchanged after hashing.
