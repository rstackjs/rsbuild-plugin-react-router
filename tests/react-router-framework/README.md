# React Router Framework Tests

This folder contains the React Router framework-mode test corpus. It
originates from a pinned commit of upstream React Router, but it is
**repo-owned** and permanently adapted to exercise
`rsbuild-plugin-react-router`. The upstream sha recorded in `UPSTREAM.json`
documents provenance only; refreshing the corpus from upstream is a manual,
deliberate act, never an automatic overwrite.

## Pinned upstream

The corpus content is governed by a pinned commit of
[remix-run/react-router](https://github.com/remix-run/react-router). The pin
lives in two places:

- `scripts/sync-react-router-framework-tests.mjs` exports `PINNED_UPSTREAM`
  (`{ repository, ref }`) — the single source of truth the sync enforces.
- `tests/react-router-framework/UPSTREAM.json` — a manifest written after
  every sync recording `repository`, `ref` (the pinned commit sha),
  `syncedAt`, `sourceDirs`, `fileCount`, `adapterOwnedFiles`, and
  `corpusVerified`.

Everything under `integration/` and `react-router-dev/__tests__/` derives
from the pinned upstream sha, but the checked-in tree is authoritative: it
carries deliberate local adaptations (see `corpusVerified` and the `note`
field in `UPSTREAM.json`, and "Vite artifact excision" below). The sync
script is a comparison/refresh aid against the pin, not an enforcement
mechanism — running it overwrites local adaptations in the working tree, so
review the diff and restore intentional changes.

## Syncing

The `REACT_ROUTER_REPO` env var (or `--source=`) selects the *location* of a
local react-router clone; the pin governs the *content*. The clone must be
clean and have the pinned commit checked out, otherwise the sync refuses to
run:

```sh
REACT_ROUTER_REPO=/path/to/react-router pnpm sync:react-router-framework-tests
```

The script copies the upstream test directories, preserves the Rsbuild adapter
overlay, normalizes upstream `workspace:*` / `catalog:` dependency protocols
to installable package versions, and rewrites `UPSTREAM.json` (keeping
`syncedAt` stable when nothing else changed).

### Updating the pin

1. Check out the new upstream commit in your react-router clone:
   `git -C /path/to/react-router checkout <new-sha>` (working tree must be
   clean).
2. Run the sync with `--update-pin`:

   ```sh
   REACT_ROUTER_REPO=/path/to/react-router \
     node scripts/sync-react-router-framework-tests.mjs --update-pin
   ```

   This rewrites the `PINNED_UPSTREAM.ref` constant in the sync script,
   regenerates the corpus from the new commit, and updates `UPSTREAM.json`.
3. Review the diff and commit the script, the manifest, and the regenerated
   corpus together.

### Normalize-only

To re-apply only dependency protocol normalization to the checked-in corpus
(no upstream access or pin check):

```sh
pnpm sync:react-router-framework-tests -- --normalize-only
```

## Rsbuild adapter overlay

The adapter-owned files (the only hand-editable files in this tree) are
listed in `adapterOwnedPaths` in
`scripts/sync-react-router-framework-tests.mjs` — the single source of truth,
mirrored into `UPSTREAM.json` as `adapterOwnedFiles` on every sync. They are
preserved across syncs.

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

## Vite artifact excision

The corpus carries no inert Vite artifacts: the checked-in fixture/template
`vite.config.*` files are deleted, and `vite`, `@vitejs/*`, and Vite-plugin
dependencies (`vite-tsconfig-paths`, `@vanilla-extract/vite-plugin`,
`@cloudflare/vite-plugin`) are stripped from corpus `package.json` files.
Upstream test file names (`vite-*-test.ts`) are intentionally kept for
comparability with upstream. Tests author `rsbuild.config.ts` fixtures
directly: the `viteConfig` helper factory in `integration/helpers/vite.ts`
emits rsbuild config text (see its doc comment for the Vite -> rsbuild option
mappings), and inline fixture configs are written as rsbuild configs with
comments marking dropped Vite-only options. The adapter's `vite.config.*`
interception remains only as a safety net and `console.warn`s loudly when it
fires — new tests must not rely on it. The upstream `vite-7-template` /
`vite-8-template` pair is collapsed into a single `vite-7-template` (the Vite
major split is meaningless for rsbuild). `vite-env-only` is kept: fixture app
code imports `vite-env-only/macros`, and the adapter installs it in every
materialized fixture.

## Commands

```sh
pnpm test:react-router-framework:smoke
pnpm test:react-router-framework
```
