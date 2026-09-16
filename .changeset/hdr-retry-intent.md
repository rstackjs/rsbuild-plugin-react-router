---
'rsbuild-plugin-react-router': patch
---

Retain pending HDR notify intent across Node compiler retries (#139).

HDR notification is decided from edit intent captured at Node `thisCompilation`,
including empty retries that retain the latest relevant revision, and is
acknowledged only when that Node compilation is retained by a committed
generation. The existing revision-file transport is unchanged.
