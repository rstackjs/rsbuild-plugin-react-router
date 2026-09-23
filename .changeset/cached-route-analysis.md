---
'rsbuild-plugin-react-router': patch
---

Preserve compiled route analysis in Rspack module metadata so persistent-cache hits retain MDX and other transformed route exports. Reject inferred reserved root IDs and non-string route IDs before building, and resolve RSC support checks from the configured project root.
