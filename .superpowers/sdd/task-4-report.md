# Task 4 Report

Status: Complete.

Commit: `70147f0 refactor: centralize fixture Rsbuild config`

Files committed:

- `tests/react-router-framework-adapter.test.ts`
- `tests/react-router-framework/integration/helpers/rsbuild-adapter.ts`
- `tests/react-router-framework/integration/helpers/rsbuild-config.ts`
- `tests/react-router-framework/integration/helpers/rsbuild.ts`
- `tests/react-router-framework/integration/helpers/templates.ts`

Changes:

- Moved the complete `rsbuildConfig` emitter and its private types/helpers into `rsbuild-config.ts`; a direct comparison against the pre-move block produced no diff.
- Kept `rsbuild.ts` as the public re-export for existing corpus imports.
- Exported `TemplateName = Template["name"]` from `templates.ts`, removing the adapter-to-`rsbuild.ts` type cycle.
- Replaced the adapter's classic/RSC string builders with `rsbuildConfig.basic({ port, templateName })`.
- Added coverage for classic and RSC plugin selection, every supported emitter option, and byte-exact preservation of the shipped `rsc-preview` config.

Exact verification:

- RED: `pnpm exec rstest run tests/react-router-framework-adapter.test.ts` exited 1 because `helpers/rsbuild-config` did not exist.
- GREEN/final: `pnpm exec rstest run tests/react-router-framework-adapter.test.ts` exited 0; 1 file passed, 13 tests passed.
- Initial `pnpm typecheck` exited 2 with `TS6196: 'FrameworkModeRscTemplateName' is declared but never used`; removed the obsolete alias left by the type move.
- Final `pnpm typecheck` exited 0, including root `tsc --noEmit`, `tsconfig.tests.json`, and the `integration`, `integration-rsbuild-template`, `integration-rsc-framework`, and `integration-rsc-preview` typechecks.
- `tracedecay tool diagnostics --args '{"scope":"workspace","format":"markdown"}'` reported 0 errors and 0 warnings before the raw typecheck exposed the stale alias.
- `pnpm exec prettier --check tests/react-router-framework-adapter.test.ts tests/react-router-framework/integration/helpers/rsbuild-config.ts tests/react-router-framework/integration/helpers/rsbuild-adapter.ts tests/react-router-framework/integration/helpers/rsbuild.ts tests/react-router-framework/integration/helpers/templates.ts` exited 0.
- `git diff --cached --check` exited 0 before commit.

Self-review:

- No critical or warning findings in the task files.
- TraceDecay identified `rsbuild.ts`/fixture finalization as high-fan-in and mapped 267 impacted symbols. The focused adapter test covers the changed generation branches; full typecheck covers all helper packages.
- TraceDecay duplicate/simplification scans found no new task-scoped emitter duplication after centralization.

Concerns:

- The full Playwright corpus was not run; the brief requested the focused adapter test and full typecheck.
- TraceDecay MCP initially resolved a different worktree branch, so worktree-current graph reads/review used the supported `tracedecay tool` CLI fallback.

## Review follow-up

Fixes:

- Restored unconditional MDX support in synthesized classic and RSC framework configs by passing `mdx: true` to the centralized emitter.
- Added adapter assertions that both generated configs import and call `pluginMdx`.
- Changed `fixture-workspace-dependencies.ts` to import `TemplateName` from `templates.ts`, removing its remaining dependency on `rsbuild.ts`.

Exact verification:

- RED: `pnpm exec rstest run tests/react-router-framework-adapter.test.ts` exited 1; both generated-config cases failed on the missing `pluginMdx` import (1 file failed, 2 tests failed, 11 passed).
- GREEN: `pnpm exec rstest run tests/react-router-framework-adapter.test.ts` exited 0 (1 file passed, 13 tests passed).
- `tracedecay tool diagnostics --args '{"scope":"workspace","format":"markdown"}'` exited 0 with 0 errors and 0 warnings.
- `pnpm typecheck` exited 0, including root `tsc --noEmit`, `tsconfig.tests.json`, and all four React Router framework workspace typechecks.
- `pnpm exec prettier --check tests/react-router-framework-adapter.test.ts tests/react-router-framework/integration/helpers/rsbuild-adapter.ts tests/react-router-framework/integration/helpers/fixture-workspace-dependencies.ts .superpowers/sdd/task-4-report.md` exited 0.
- `git diff --check` exited 0.

## Cycle-cleanup follow-up

Fix:

- Changed `fixtures.ts` to import `TemplateName` directly from `templates.ts`, removing its type-only dependency on the `rsbuild.ts` facade.

Exact verification:

- `tracedecay tool grep --project "$PWD" --pattern 'import type \\{ TemplateName \\} from "\\./rsbuild\\.js"' --path-glob 'tests/react-router-framework/integration/helpers/*.ts' --case-sensitive true` returned no matches across 13 helper files.
- `pnpm exec rstest run tests/react-router-framework-adapter.test.ts` exited 0 (1 file passed, 13 tests passed).
- `pnpm typecheck` exited 0, including root `tsc --noEmit`, `tsconfig.tests.json`, and all four React Router framework workspace typechecks.
- `pnpm exec prettier --check tests/react-router-framework/integration/helpers/fixtures.ts .superpowers/sdd/task-4-report.md` exited 0.
- `git diff --check` exited 0.
