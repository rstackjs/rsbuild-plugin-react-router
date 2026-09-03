---
'rsbuild-plugin-react-router': patch
---

Derive the development browser manifest `version` from the manifest content
instead of a random value per web compilation. The browser manifest asset is
served from the latest web compilation while the server build stays pinned to
the compilation it was committed with, so a web compilation that left the
manifest unchanged (for example the hot data revalidation recompile after a
server change) gave the two different versions. React Router's stale-client
check then answered route discovery with a document reload, which could land
mid-navigation and surface as a hydration mismatch. Equal manifests now share a
version, and a real change still busts the browser cache through the `?v=`
query on the development manifest URL.
