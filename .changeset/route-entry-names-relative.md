---
'rsbuild-plugin-react-router': patch
---

Derive route entry names from the route file instead of the route id. A route
table built with `relative()` resolves route files to absolute paths, so React
Router relativizes `file` but leaves `id` absolute, and the plugin used that
opaque id as an rspack entry name. Split route module chunks were therefore
emitted into a directory tree mirroring the developer's checkout
(`static/js/Users/<user>/.../customers-client-loader.js`) and the browser
manifest published those paths, leaking `$HOME` into production assets and
making builds unreproducible across machines and CI. Entry names are now
app-relative for both the route entry and its chunks, so a chunk lands beside
its route, the `"/static/js//..."` double slash is gone, and an entry can no
longer escape the JS output directory or carry a Windows drive prefix. Route
ids are untouched: they remain the runtime contract behind
`useRouteLoaderData(id)` and `matches[].id`. Note that route chunks for routes
declared with an explicit `id` are renamed accordingly, which changes those
asset URLs.
