---
"rsbuild-plugin-react-router": minor
---

Bring Rsbuild plugin behavior closer to React Router's official Vite plugin.

- Add React Router config resolution + validations/warnings for closer framework parity
- Add split route modules (route chunk entrypoints) including enforce mode validation
- Improve `.client` module stubbing on the server (including `export *` re-exports)
- Improve manifest generation: stable fingerprinted build manifests, bundle-specific server manifests, and optional Subresource Integrity (`future.unstable_subResourceIntegrity`)
- Improve Module Federation support by relying on Rspack `experiments.asyncStartup` (without overriding explicit CommonJS server output)
