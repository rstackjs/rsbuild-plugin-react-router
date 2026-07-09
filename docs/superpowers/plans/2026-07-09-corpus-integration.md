# Corpus Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace copied React Router corpus hacks with explicit, testable Rsbuild adapter boundaries.

**Architecture:** Keep upstream test contents reproducible from the pinned checkout, apply path renames before restoring the declared local overlay, and centralize fixture configuration in one adapter module. Reject Vite configuration instead of silently translating it.

**Tech Stack:** Node.js ESM, TypeScript, Rstest, Playwright, Rsbuild 2.1, Rspack.

## Global Constraints

- Prefer Rsbuild/Rspack-native APIs over Vite compatibility shims.
- Preserve fixture-authored TypeScript configuration byte-for-byte.
- Keep intentional unsupported divergences documented.
- Do not weaken upstream behavioral assertions.

---

### Task 1: Preserve Fixture TypeScript Configuration

**Files:**
- Modify: `tests/react-router-framework/integration/helpers/rsbuild-adapter.ts:98-286`
- Create: `tests/react-router-framework-adapter.test.ts`

**Interfaces:**
- Produces: `ensureTsconfig(projectDir: string): Promise<void>`
- Preserves: existing `tsconfig.json`; creates defaults only when absent

- [ ] **Step 1: Add failing adapter tests**

Create temporary fixture directories and assert:

```ts
const authored = JSON.stringify({
  include: ['custom/**/*'],
  compilerOptions: {
    moduleDetection: 'force',
    types: ['custom-runtime'],
    paths: { '#custom/*': ['./src/*'] },
  },
});
await writeFile(join(projectDir, 'tsconfig.json'), authored);
await finalizeFixtureProject({ projectDir });
expect(await readFile(join(projectDir, 'tsconfig.json'), 'utf8')).toBe(authored);
```

Add a second case asserting a missing file receives the current default `include`, `rootDirs`, and `~/*` path mapping.

- [ ] **Step 2: Verify failure**

Run: `pnpm exec rstest run tests/react-router-framework-adapter.test.ts`

Expected: authored config assertion FAILS because it is overwritten.

- [ ] **Step 3: Implement `ensureTsconfig`**

Rename `writeTsconfig` to `ensureTsconfig` and begin with:

```ts
const tsconfigPath = path.join(projectDir, 'tsconfig.json');
if (existsSync(tsconfigPath)) return;
```

Retain the current synthesized config body for missing files.

- [ ] **Step 4: Verify pass and commit**

Run: `pnpm exec rstest run tests/react-router-framework-adapter.test.ts`

Expected: PASS.

```bash
git add tests/react-router-framework/integration/helpers/rsbuild-adapter.ts tests/react-router-framework-adapter.test.ts
git commit -m "fix: preserve fixture TypeScript configs"
```

### Task 2: Execute Corpus Renames During Sync

**Files:**
- Modify: `scripts/sync-react-router-framework-tests.mjs:134-570`
- Create: `tests/react-router-framework-sync.test.ts`

**Interfaces:**
- Produces: `applyCorpusRenames(workRoot: string): Promise<void>`
- Consumes: `corpusRenames`

- [ ] **Step 1: Add failing rename tests**

Cover a file rename, directory rename, missing source, and the `vite-8-template` collapse. Assert the source disappears and the destination contains source bytes. Add a direct-execution guard around the sync workflow so the helper can be imported without running a sync.

- [ ] **Step 2: Verify failure**

Run: `pnpm exec rstest run tests/react-router-framework-sync.test.ts`

Expected: FAIL because no executable rename helper exists.

- [ ] **Step 3: Implement deterministic renames**

For each ordinary mapping:

```js
const sourcePath = path.join(workRoot, source);
const targetPath = path.join(workRoot, target);
if (!existsSync(sourcePath)) continue;
await mkdir(path.dirname(targetPath), { recursive: true });
await rm(targetPath, { force: true, recursive: true });
await rename(sourcePath, targetPath);
```

Treat `integration/helpers/vite-8-template` as an explicit removal/collapse before renaming `vite-7-template` to `rsbuild-template`. Call `applyCorpusRenames(stagedTargetRoot)` after `copyUpstreamTests` and before `restoreAdapterFiles`. Remove the rename destinations from the unconditional preservation set; only declared adapter/adapted paths are overlays.

- [ ] **Step 4: Verify pass and commit**

Run: `pnpm exec rstest run tests/react-router-framework-sync.test.ts`

Expected: PASS.

```bash
git add scripts/sync-react-router-framework-tests.mjs tests/react-router-framework-sync.test.ts
git commit -m "fix: apply corpus renames during sync"
```

### Task 3: Reject Vite Fixture Configuration

**Files:**
- Modify: `tests/react-router-framework/integration/helpers/rsbuild-adapter.ts:64-151`
- Modify: `tests/react-router-framework/integration/helpers/rsbuild.ts`
- Modify: `tests/react-router-framework/integration/helpers/create-fixture.ts`
- Modify: `tests/react-router-framework/integration/helpers/fixtures.ts`
- Modify: `tests/react-router-framework/react-router-dev/__tests__/fixtures/basic/tsconfig.json`
- Modify: `tests/react-router-framework/integration/helpers/rsc-framework/tsconfig.json`
- Modify: `tests/react-router-framework/integration/css-test.ts`
- Modify: `tests/react-router-framework/README.md`
- Test: `tests/react-router-framework-adapter.test.ts`

**Interfaces:**
- Produces: `assertNoViteConfigFiles<T>(files: Record<string, T>): Record<string, T>`

- [ ] **Step 1: Add failing rejection tests**

For `vite.config.ts`, `.js`, `.mjs`, `.cts`, and `.mts`, assert the helper throws an error naming the file and requiring `rsbuild.config.ts`. Assert ordinary edits and `rsbuild.config.ts` are returned unchanged.

- [ ] **Step 2: Replace interception with rejection**

```ts
export const assertNoViteConfigFiles = <T>(
  files: Record<string, T> = {}
): Record<string, T> => {
  const viteConfig = Object.keys(files).find(filename =>
    /^vite\.config\.[cm]?[jt]s$/.test(filename)
  );
  if (viteConfig) {
    throw new Error(
      `[rsbuild-adapter] Unsupported fixture config "${viteConfig}". ` +
        'Author rsbuild.config.ts explicitly so test-specific options are preserved.'
    );
  }
  return files;
};
```

Update every `normalizeFixtureFiles` caller. Remove the deletion safety net because rejected files cannot reach finalization.

- [ ] **Step 3: Remove residual Vite artifacts**

Replace `vite/client` with `@rsbuild/core/types`, remove the `vite.config*` exclusion, remove `VITE_CJS_IGNORE_WARNING`, and update the README from interception language to rejection language.

- [ ] **Step 4: Verify pass and commit**

Run: `pnpm exec rstest run tests/react-router-framework-adapter.test.ts`

Expected: PASS.

```bash
git add tests/react-router-framework
git commit -m "refactor: reject Vite fixture configuration"
```

### Task 4: Centralize Rsbuild Config Emission

**Files:**
- Create: `tests/react-router-framework/integration/helpers/rsbuild-config.ts`
- Modify: `tests/react-router-framework/integration/helpers/rsbuild-adapter.ts`
- Modify: `tests/react-router-framework/integration/helpers/rsbuild.ts`
- Modify: `tests/react-router-framework/integration/helpers/templates.ts`
- Test: `tests/react-router-framework-adapter.test.ts`

**Interfaces:**
- Produces: sole `rsbuildConfig.server`, `rsbuildConfig.build`, and `rsbuildConfig.basic`
- Produces: `TemplateName = Template['name']` from `templates.ts`

- [ ] **Step 1: Add config assertions**

Assert classic output imports/calls `pluginReactRouter`, `rsc-framework` imports/calls `pluginReactRouterRSC`, supplied port/base/options are retained, and `rsc-preview` keeps its shipped config.

- [ ] **Step 2: Move the emitter**

Move `RsbuildConfig*Args`, `configSection`, `CSS_CODE_SPLIT_NOTE`, and `rsbuildConfig` from `helpers/rsbuild.ts` into `helpers/rsbuild-config.ts`. Export `TemplateName` from `helpers/templates.ts`. Make `rsbuild.ts` re-export the emitter and make `rsbuild-adapter.ts` call `rsbuildConfig.basic({ port, templateName })` rather than its duplicate string builders.

- [ ] **Step 3: Verify pass and commit**

Run: `pnpm exec rstest run tests/react-router-framework-adapter.test.ts`

Expected: PASS.

Run: `pnpm typecheck`

Expected: PASS.

```bash
git add tests/react-router-framework
git commit -m "refactor: centralize fixture Rsbuild config"
```

### Task 5: Corpus Verification

- [ ] **Step 1: Run affected framework tests**

Run: `pnpm build && RR_FRAMEWORK_MAX_WORKERS=1 pnpm exec playwright test --config tests/react-router-framework/integration/playwright.config.ts use-route-test.ts dot-server-test.ts typegen-test.ts --workers=1 --max-failures=1 --retries=0 --reporter=line`

Expected: PASS.

- [ ] **Step 2: Verify pinned sync in a disposable worktree**

Run: `REACT_ROUTER_REPO=/fast/projects/react-router pnpm sync:react-router-framework-tests && git diff --exit-code -- tests/react-router-framework`

Expected: PASS with no corpus diff. Run this only in a disposable worktree because sync intentionally replaces the corpus before comparing it.
