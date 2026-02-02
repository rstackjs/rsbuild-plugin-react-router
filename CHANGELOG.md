# rsbuild-plugin-react-router

## 0.1.0

### Minor Changes

- 3c6d368: Bring Rsbuild plugin behavior closer to React Router's official Vite plugin.
  - Add React Router config resolution + validations/warnings for closer framework parity
  - Add split route modules (route chunk entrypoints) including enforce mode validation
  - Improve `.client` module stubbing on the server (including `export *` re-exports)
  - Improve manifest generation: stable fingerprinted build manifests, bundle-specific server manifests, and optional Subresource Integrity (`future.unstable_subResourceIntegrity`)
  - Improve Module Federation support by relying on Rspack `experiments.asyncStartup` (without overriding explicit CommonJS server output)

## 0.0.5

### Patch Changes

- 797b401: Fix: Correctly expose routeDiscovery configuration for React Router v7 in Rspack builds.

## 0.0.4

### Patch Changes

- 88b052d: do not set target when output is esm

## 0.0.3

### Patch Changes

- 8928f7b: search for routes file with any extention
- 8928f7b: support multiple extentions for routes file, like js,ts,jsx etc

## 0.0.2

### Patch Changes

- 53722e4: remove logs from module proxy

## 0.0.1

### Patch Changes

- 2aa8f3e: Support React Router
