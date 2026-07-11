---
name: react-router-upstream-tests
description: Audit upstream React Router framework test changes and manually select tests to adapt into this repository without overwriting the checked-in Rsbuild corpus.
---

# React Router Upstream Tests

Use this skill when checking for new or changed upstream React Router framework
tests, reviewing the corpus checkpoint, or manually importing test coverage.

## Source of truth

- `tests/react-router-framework/UPSTREAM.json` records the upstream repository,
  last reviewed commit, review time, and relevant source directories.
- `tests/react-router-framework/` is repository-owned and authoritative. It is
  intentionally adapted for Rsbuild and must never be overwritten wholesale.
- `scripts/check-react-router-framework-upstream.mjs` is a read-only audit. It
  reports upstream changes but never copies files or updates the checkpoint.

## Workflow

1. Inspect the current checkpoint and confirm the local React Router clone:

   ```sh
   cat tests/react-router-framework/UPSTREAM.json
   git -C /path/to/react-router status --short --branch
   ```

2. Compare the reviewed commit with the desired upstream target:

   ```sh
   pnpm check:react-router-framework-upstream -- \
     --source=/path/to/react-router \
     --target=HEAD
   ```

3. Review every reported directory containing added files and every added,
   modified, deleted, or renamed file. Select only tests that add relevant
   compatibility coverage.

4. Copy selected tests manually and adapt them to the existing Rsbuild harness:

   - use `rsbuild.config.ts`, not Vite configuration;
   - reuse helpers under `tests/react-router-framework/integration/helpers`;
   - preserve intentional Rsbuild/Rspack divergences;
   - do not add inert Vite dependencies, fixtures, or skipped suites;
   - keep resource-guard and process-cleanup behavior intact.

5. Run the narrow imported tests first, then the relevant framework gate:

   ```sh
   pnpm build
   RR_FRAMEWORK_MAX_WORKERS=2 pnpm exec playwright test \
     --config tests/react-router-framework/integration/playwright.config.ts \
     path/to/imported-test.ts --workers=2 --max-failures=1 --retries=0
   pnpm test:react-router-framework:failfast
   ```

6. After review and validation, update `lastReviewedRef` and `reviewedAt` in
   `UPSTREAM.json` in the same commit as the selected test adaptations.

## Guardrails

- Never add an automatic sync, overlay restoration, or corpus rewrite step.
- Never update the checkpoint merely because the audit command ran.
- Never claim the corpus matches upstream; record only the revision reviewed.
- Do not copy upstream package manifests without adapting workspace/catalog
  dependencies to this repository deliberately.
- Keep the working tree reviewable and commit only selected tests, adaptations,
  checkpoint metadata, and directly related documentation.
