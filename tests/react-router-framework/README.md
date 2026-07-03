# React Router Framework Tests

This folder contains the React Router upstream framework-mode test corpus,
synced from a pinned upstream commit and adapted to exercise
`rsbuild-plugin-react-router`.

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

Everything under `integration/` and `react-router-dev/__tests__/` except the
adapter-owned files listed in `UPSTREAM.json` is **generated** from the pinned
upstream sha and must not be hand-edited. Hand edits will be flagged (and
overwritten in the working tree) by the next sync. If `corpusVerified` is
`false` in `UPSTREAM.json`, the checked-in corpus currently carries local
deviations from the pinned sha outside the overlay; see the `note` field.

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

## Commands

```sh
pnpm test:react-router-framework:smoke
pnpm test:react-router-framework
```
