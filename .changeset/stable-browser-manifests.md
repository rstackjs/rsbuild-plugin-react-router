---
'rsbuild-plugin-react-router': patch
---

Respect configured browser filenames and publish production manifests with finalized asset URLs and subresource integrity. Refresh development manifests when real content hashing is enabled. Preserve each compilation's route metadata, and prevent failed builds from exposing stale server manifests or running prerender/build-end work.
