# React Router Framework Tests

This folder contains copied React Router upstream framework-mode tests adapted
to exercise `rsbuild-plugin-react-router`.

## Source

- `integration/` is copied from `/home/zack/projects/react-router/integration`.
- `react-router-dev/__tests__/` is copied from
  `/home/zack/projects/react-router/packages/react-router-dev/__tests__`.

Keep upstream test files as close to source as practical so the suite can be
refreshed by copying those folders again.

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
