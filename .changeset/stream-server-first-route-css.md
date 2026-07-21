---
'rsbuild-plugin-react-router': patch
---

Stream server-first route CSS during RSC render. CSS imported in the RSC
layer never flows through the client manifest's `<Links>`, so it was
previously dropped. Modules exporting server components are now marked with
the `'use server-entry'` directive so rspack's RSC runtime records
`entryCssFiles`, which the server route entry wrapper streams as
precedence-tagged stylesheet links, fixing missing styles and
flash-of-unstyled-content for server-component routes.
