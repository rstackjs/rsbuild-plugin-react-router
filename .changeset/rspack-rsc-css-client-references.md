---
'rsbuild-plugin-react-router': minor
---

Keep React Router `handle`, `links`, `meta`, and `shouldRevalidate` exports
functional when their RSC route module imports CSS. Require Rsbuild 2.2 and keep
the exports in the regular route chunk, relying on Rspack 2.2's direct client
reference emission.
