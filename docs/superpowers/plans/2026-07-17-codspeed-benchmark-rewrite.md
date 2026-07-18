# CodSpeed Benchmark Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the profile-based benchmark system with focused local benchmark cases, required PR comparison comments, and optional CodSpeed publication.

**Architecture:** A small `benchmarks/` case API owns fixture creation and Rsbuild execution. `benchmarks/run.mts` measures that API locally and writes stable JSON. `benchmarks/rsbuild.bench.ts` exposes the same cases to Vitest/CodSpeed. A comparison model validates two local result files, renders Markdown, and an idempotent commenter posts it on pull requests.

**Tech Stack:** Node.js TypeScript stripping, Rsbuild, Rstest, Vitest 4, `@codspeed/vitest-plugin`, GitHub Actions, GitHub REST API.

## Global Constraints

- Local and pull-request benchmark reporting must work before CodSpeed repository access is approved.
- Once an `rstackjs` organization owner enables the repository, no code change should be required for CodSpeed publication to start.
- CodSpeed failures must not hide benchmark failures.
- Benchmark output remains under ignored `.benchmark/` paths.
- No benchmark history branch or new runtime dependency is introduced.
- The PR head benchmark harness must measure both the PR base plugin build and the PR head plugin build.
- Use only `build-256-ssr` and `dev-48-ssr` as initial focused benchmark identifiers.

---

## File Structure

- Create `benchmarks/cases.mts`: deterministic case definitions and reusable `runBenchmarkCase` interface.
- Create `benchmarks/run.mts`: CLI local runner that records finite wall-time samples.
- Create `benchmarks/rsbuild.bench.ts`: CodSpeed/Vitest registrations using the shared case API.
- Create `vitest.benchmark.config.mts`: CodSpeed plugin and benchmark-suite configuration.
- Create `scripts/benchmark/compare-model.mts`: result parsing, validation, delta calculation, and Markdown rendering.
- Create `scripts/benchmark/compare.mts`: comparison CLI writing `comment.md` and `report.json`.
- Create `scripts/benchmark/comment.mts`: marker-based pull-request comment upsert CLI.
- Create `tests/benchmark-compare.test.ts`: comparison model and comment-marker tests.
- Modify `package.json`, `pnpm-lock.yaml`, `.github/workflows/benchmark.yml`, `benchmarks/README.md`, and `README.md`.
- Delete the legacy runners, profile/report/history scripts, benchmark tests, and `benchmarks/synthetic-web-bundler-benchmark/` workspace.

### Task 1: Shared benchmark case API and local runner

**Files:**
- Create: `benchmarks/cases.mts`
- Create: `benchmarks/run.mts`
- Modify: `package.json`
- Test: `tests/benchmark-fixture.test.ts`

**Interfaces:**
- Consumes: `generateSyntheticFixture` from `scripts/benchmark/fixture.mts`, `runDevServerBenchmark` and `appendNodeOption` from `scripts/benchmark/dev-server.mjs`.
- Produces: `benchmarkCases`, `runBenchmarkCase(caseDefinition, options)`, and a local JSON result of shape `{ version: 1, pluginRoot: string, cases: Array<{ id: string, samplesMs: number[], medianMs: number }> }`.

- [ ] **Step 1: Write failing fixture/case tests**

Add tests that assert `benchmarkCases.map(({ id }) => id)` equals `['build-256-ssr', 'dev-48-ssr']`, reject an unknown case id, and use a temporary plugin fixture path to verify cleanup removes only the case-owned directory.

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `pnpm test:core -- tests/benchmark-fixture.test.ts`

Expected: FAIL because `benchmarks/cases.mts` does not exist.

- [ ] **Step 3: Implement the case API**

Implement the following exact public surface:

```ts
export const benchmarkCases = [
  { id: 'build-256-ssr', mode: 'build', routeCount: 256 },
  { id: 'dev-48-ssr', mode: 'dev', routeCount: 48 },
] as const;

export const runBenchmarkCase = async (
  definition: (typeof benchmarkCases)[number],
  options: { pluginRoot: string; workRoot: string; port?: number }
) => Promise<{ wallMs: number }>;
```

Generate the fixture below `options.workRoot`, reference `options.pluginRoot/dist/index.js` through `pathToFileURL`, clean the fixture build output before every run, and clean the full case directory in a `finally` block. Build cases run the Rsbuild binary from the harness checkout. Dev cases wait for `web` and `node`, request `/`, edit the generated update file, wait for the update, and terminate the server through `runDevServerBenchmark`. Throw on every nonzero build or dev status.

- [ ] **Step 4: Implement the local CLI**

Support `--plugin-root`, `--out`, `--iterations`, `--warmup`, and repeatable `--case`. Defaults are the current checkout, `.benchmark/results/local.json`, `3`, `1`, and all cases. Validate positive iterations, non-negative warmup, duplicate case names, finite samples, and matching registered case identifiers. Write JSON atomically after all cases succeed.

- [ ] **Step 5: Add package commands**

Set these scripts:

```json
"bench": "pnpm build && node benchmarks/run.mts",
"bench:smoke": "pnpm build && node benchmarks/run.mts --iterations 1 --warmup 0",
"bench:codspeed": "pnpm build && vitest bench --run --config vitest.benchmark.config.mts"
```

- [ ] **Step 6: Run targeted tests and a smoke benchmark**

Run: `pnpm test:core -- tests/benchmark-fixture.test.ts && pnpm bench:smoke`

Expected: tests pass; `.benchmark/results/local.json` has both case identifiers and finite medians.

- [ ] **Step 7: Commit**

```bash
git add benchmarks/cases.mts benchmarks/run.mts package.json tests/benchmark-fixture.test.ts
git commit -m "feat: add focused local benchmark cases"
```

### Task 2: CodSpeed/Vitest suite and comparison model

**Files:**
- Create: `benchmarks/rsbuild.bench.ts`
- Create: `vitest.benchmark.config.mts`
- Create: `scripts/benchmark/compare-model.mts`
- Create: `scripts/benchmark/compare.mts`
- Create: `tests/benchmark-compare.test.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Consumes: `benchmarkCases` and `runBenchmarkCase` from `benchmarks/cases.mts`.
- Produces: `compareBenchmarkResults(base, head)`, `renderBenchmarkComment(report)`, and a CodSpeed-compatible Vitest suite.

- [ ] **Step 1: Write failing comparison tests**

Test a valid base/head payload renders the marker `<!-- react-router-benchmark-ci -->`, case rows, base/head median values, and signed percent deltas. Test mismatched case ids, duplicate ids, non-finite samples, and zero base medians throw exact descriptive errors.

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `pnpm test:core -- tests/benchmark-compare.test.ts`

Expected: FAIL because `scripts/benchmark/compare-model.mts` does not exist.

- [ ] **Step 3: Implement comparison model and CLI**

The model must require one entry for every case on both sides, calculate `((headMedianMs - baseMedianMs) / baseMedianMs) * 100`, and emit a compact Markdown table:

```md
<!-- react-router-benchmark-ci -->
## Benchmark results

| Case | Base | Head | Delta |
|---|---:|---:|---:|
```

`compare.mts` accepts `--base`, `--head`, and `--out`; writes `report.json` and `comment.md`; and exits nonzero when either input is invalid.

- [ ] **Step 4: Add CodSpeed/Vitest integration**

Add `vitest@^4.1.10` and `@codspeed/vitest-plugin@^5.7.1` as dev dependencies. Configure `codspeedPlugin()`, only include `benchmarks/**/*.bench.ts`, use forks, and disable file parallelism. Register every shared case with `bench(case.id, async () => runBenchmarkCase(case, options))`, reading `BENCHMARK_PLUGIN_ROOT` and `BENCHMARK_WORK_ROOT` from the environment.

- [ ] **Step 5: Run tests and local CodSpeed-suite fallback**

Run: `pnpm test:core -- tests/benchmark-compare.test.ts && pnpm bench:codspeed`

Expected: tests pass; Vitest reports `build-256-ssr` and `dev-48-ssr` without requiring CodSpeed credentials.

- [ ] **Step 6: Commit**

```bash
git add benchmarks/rsbuild.bench.ts vitest.benchmark.config.mts scripts/benchmark/compare-model.mts scripts/benchmark/compare.mts tests/benchmark-compare.test.ts package.json pnpm-lock.yaml
git commit -m "feat: add CodSpeed benchmark integration"
```

### Task 3: Pull-request reporting and optional CodSpeed workflow

**Files:**
- Create: `scripts/benchmark/comment.mts`
- Modify: `.github/workflows/benchmark.yml`
- Test: `tests/benchmark-compare.test.ts`

**Interfaces:**
- Consumes: `benchmark-output/base.json`, `benchmark-output/head.json`, and `benchmark-output/report/comment.md` from Tasks 1 and 2.
- Produces: one marker-based GitHub issue comment and a job-summary report.

- [ ] **Step 1: Write failing idempotent-comment tests**

Extract `findBenchmarkComment(comments)` from `comment.mts` and test it selects the newest comment containing `<!-- react-router-benchmark-ci -->`, returning `null` when no marker exists.

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `pnpm test:core -- tests/benchmark-compare.test.ts`

Expected: FAIL because `scripts/benchmark/comment.mts` does not export `findBenchmarkComment`.

- [ ] **Step 3: Implement comment upsert**

Use `GH_TOKEN`, `GITHUB_REPOSITORY`, `PR_NUMBER`, and `COMMENT_BODY`. Paginate issue comments, patch the newest marker match, otherwise create one. Export the pure finder and run the CLI only when the module is the main entrypoint.

- [ ] **Step 4: Replace workflow**

Use triggers `pull_request`, `push` on `main`, and `workflow_dispatch`. The pull-request job must checkout `head` and `base`, install both, build both plugin packages, use the head harness to run `bench` against base then head (counterbalanced by pull-request number), run `compare.mts`, write `comment.md` to `$GITHUB_STEP_SUMMARY`, and upsert a comment for same-repository pull requests. It must upload the three result files as an artifact.

Add a separate `codspeed` job that installs and builds the head checkout then executes:

```yaml
uses: CodSpeedHQ/action@v4
continue-on-error: true
with:
  mode: walltime
  run: pnpm bench:codspeed
```

This job must run on pull requests, `main`, and manual dispatch. No CodSpeed token is configured.

- [ ] **Step 5: Run targeted tests and validate workflow syntax**

Run: `pnpm test:core -- tests/benchmark-compare.test.ts && ruby -e 'require "yaml"; YAML.load_file(".github/workflows/benchmark.yml")'`

Expected: tests pass; Ruby exits 0.

- [ ] **Step 6: Commit**

```bash
git add scripts/benchmark/comment.mts .github/workflows/benchmark.yml tests/benchmark-compare.test.ts
git commit -m "ci: report local benchmark comparisons"
```

### Task 4: Remove the legacy benchmark system and document the replacement

**Files:**
- Modify: `benchmarks/README.md`
- Modify: `README.md`
- Delete: `scripts/bench-builds.mts`, `scripts/bench-synthetic-app.mjs`, `scripts/compare-benchmarks.mts`, `scripts/report-benchmark-ci.mts`
- Delete: `scripts/benchmark/ci-comment-report.mjs`, `scripts/benchmark/ci-diagnostics.mjs`, `scripts/benchmark/ci-diagnostics.test.mjs`, `scripts/benchmark/ci-merge-results.mjs`, `scripts/benchmark/ci-persist-history.mjs`, `scripts/benchmark/ci-report-markdown.mjs`, `scripts/benchmark/ci-report-model.mjs`, `scripts/benchmark/ci-resolve-synthetic.mjs`, `scripts/benchmark/profiles.mjs`, `scripts/benchmark/results.mts`, `scripts/benchmark/statistics.mjs`
- Delete: `tests/benchmark-statistics.test.ts`
- Delete: `benchmarks/synthetic-web-bundler-benchmark/`

**Interfaces:**
- Consumes: the scripts and commands created in Tasks 1-3.
- Produces: documentation that only describes the focused local and CodSpeed benchmark workflow.

- [ ] **Step 1: Write failing documentation-reference tests**

Add assertions to `tests/benchmark-compare.test.ts` that root package scripts do not contain `bench:baseline`, `bench:full`, `bench:large`, `bench:synthetic-app`, `bench:compare`, or `bench:ci-report`, and `benchmarks/README.md` documents `pnpm bench`, `pnpm bench:smoke`, and `pnpm bench:codspeed`.

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `pnpm test:core -- tests/benchmark-compare.test.ts`

Expected: FAIL because legacy scripts and documentation are still present.

- [ ] **Step 3: Delete legacy files and rewrite docs**

Delete exactly the paths listed above. Rewrite the benchmark documentation around local JSON output, PR comments, `BENCHMARK_PLUGIN_ROOT`, and optional CodSpeed publication. Update the root benchmarking section to link to the new guide.

- [ ] **Step 4: Run focused and full verification**

Run: `pnpm test:core && pnpm bench:smoke && pnpm bench:codspeed && git status --short`

Expected: 0 test failures; both benchmark commands exit 0; only intended source, test, doc, workflow, and lockfile changes are present.

- [ ] **Step 5: Commit**

```bash
git add -A benchmarks scripts tests package.json pnpm-lock.yaml .github/workflows/benchmark.yml README.md
git commit -m "refactor: replace legacy benchmark system"
```

## Plan Self-Review

- Spec coverage: Task 1 supplies focused local cases and deterministic output; Task 2 integrates CodSpeed; Task 3 makes local PR results required while CodSpeed remains soft-fail; Task 4 removes all legacy machinery and updates docs.
- Placeholder scan: no implementation placeholders or deferred work remain.
- Interface consistency: all consumers use `benchmarkCases`, `runBenchmarkCase`, local-result version `1`, and the single PR comment marker.
