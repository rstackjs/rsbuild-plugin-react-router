---
'rsbuild-plugin-react-router': patch
---

Honor a user-provided `app/entry.ssr.tsx` in RSC framework mode. The RSC entry
template imported its own SSR template directly, so an override was placed in
the SSR layer while the template kept being compiled as React Server code and
failed the build on `react-dom/server`. The template now imports the resolved
SSR entry through `virtual/react-router/unstable_rsc/entry-ssr`.
