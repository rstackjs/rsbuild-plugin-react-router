---
'rsbuild-plugin-react-router': patch
---

Serve development manifest stylesheets through retained content-addressed assets so preloaded CSS cannot revive stale bytes after an exact source restoration. Publish committed CSS manifests through the HMR-idle queue and replay the last committed manifest on reconnect.

Keep extracted stylesheet updates under Router ownership in development so the extract loader's fallback cannot remove React-owned links during Vanilla Extract HMR.
