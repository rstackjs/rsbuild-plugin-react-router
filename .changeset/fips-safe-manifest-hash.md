---
'rsbuild-plugin-react-router': patch
---

Hash the browser manifest version with sha256 instead of md5, which is
unavailable on FIPS-enabled machines and made builds fail there. The version
is a short content digest, so existing deployments only see the manifest file
name change once.
