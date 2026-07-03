# React Router Framework Tests

This folder contains copied React Router upstream framework-mode tests adapted
to exercise `rsbuild-plugin-react-router`.

## Source

- `integration/` is copied from `/home/zack/projects/react-router/integration`.
- `react-router-dev/__tests__/` is copied from
  `/home/zack/projects/react-router/packages/react-router-dev/__tests__`.

Refresh the corpus with the managed sync script instead of hand-copying files:

```sh
REACT_ROUTER_REPO=/path/to/react-router pnpm sync:react-router-framework-tests
```

The script copies the upstream test directories, preserves the Rsbuild adapter
overlay listed below, and normalizes upstream `workspace:*` / `catalog:`
dependency protocols to package versions that can install outside the React
Router monorepo.

To re-apply only dependency protocol normalization to the checked-in corpus:

```sh
pnpm sync:react-router-framework-tests -- --normalize-only
```

Adapter-owned files preserved by the sync:

- `README.md`
- `integration/helpers/rsbuild-adapter.ts`
- `integration/helpers/create-fixture.ts`
- `integration/helpers/express.ts`
- `integration/helpers/fixtures.ts`
- `integration/helpers/vite.ts`
- `integration/playwright.config.ts`

## Rsbuild Adapter

The copied integration harness still has Vite-oriented names because the
upstream test suite does. Execution is redirected through
`integration/helpers/rsbuild-adapter.ts` and the patched helper files:

- fixture projects get `rsbuild.config.ts`, not `vite.config.ts`
- builds run `@rsbuild/core`
- dev servers run `rsbuild dev`
- production servers run `react-router-serve`
- MDX routes use the official `@rsbuild/plugin-mdx`

Do not add a local ignore list for Rsbuild gaps. Upstream `test.skip` and
`test.fixme` calls should remain intact, but otherwise unsupported cases should
fail visibly.

## Commands

```sh
pnpm test:react-router-framework:smoke
pnpm test:react-router-framework
```
