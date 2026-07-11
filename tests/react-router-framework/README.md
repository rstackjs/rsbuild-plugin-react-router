# React Router Framework Tests

This directory contains a repository-owned React Router framework test corpus
adapted for `rsbuild-plugin-react-router`. It is not an automatically generated
mirror: the checked-in Rsbuild tests and helpers are authoritative.

## Upstream review checkpoint

[`UPSTREAM.json`](./UPSTREAM.json) records:

- the upstream React Router repository;
- the last commit maintainers reviewed;
- when that review happened;
- the upstream source directories relevant to this corpus.

Use the read-only audit command to compare that checkpoint with another commit
in a local React Router clone:

```sh
pnpm check:react-router-framework-upstream -- \
  --source=/path/to/react-router \
  --target=HEAD
```

The audit reports added directories and added, modified, deleted, or renamed
files. It never checks out commits, copies files, rewrites the corpus, updates
the checkpoint, or requires a clean upstream worktree.

Review the report manually. Copy and adapt only the tests that improve this
plugin's compatibility coverage, run the relevant local suites, and then update
`lastReviewedRef` and `reviewedAt` in `UPSTREAM.json` in the same commit.

## Rsbuild adaptations

The corpus deliberately differs from upstream's Vite-oriented harness:

- fixture projects use `rsbuild.config.ts`;
- builds and development servers run through Rsbuild;
- production servers use `react-router-serve`;
- MDX routes use `@rsbuild/plugin-mdx`;
- Vite-only configuration, dependencies, and skipped suites are not retained;
- the upstream Vite template variants are represented by `rsbuild-template`;
- RSC fixtures use `react-server-dom-rspack` and `rsbuild-plugin-rsc`.

Intentional behavior differences should be documented beside the affected test
or helper. Do not overwrite adapted files from upstream wholesale.

## Commands

```sh
pnpm test:react-router-framework:smoke
pnpm test:react-router-framework
pnpm test:react-router-framework:failfast
```
