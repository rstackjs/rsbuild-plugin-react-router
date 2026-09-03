---
'rsbuild-plugin-react-router': patch
---

Generate route client entry imports with relative requests so build output and
content hashes stay stable when the same project is built from different paths.
