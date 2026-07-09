# Rspack RSC CSS Client-Reference Reproduction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prove or disprove a generic Rspack RSC defect where CSS wrapping destroys non-component client-reference identity.

**Architecture:** Compile a temporary native two-compiler Rspack fixture with no React Router/plugin code. Compare the same `"use client"` function export with and without a CSS side-effect import and inspect both runtime reference metadata and the generated client manifest.

**Tech Stack:** `@rspack/core@2.1.0`, Rspack RSC experiments, `builtin:swc-loader`, React 19, `react-server-dom-rspack`, Rstest.

## Global Constraints

- Create branch `codex/rspack-rsc-css-non-component-repro` from the verified implementation branch.
- Add no dependencies.
- Do not file an upstream issue unless the CSS-absent control passes and CSS-present case alone loses client-reference identity.

---

### Task 1: Native Reproduction

**Files:**
- Create: `tests/rspack-rsc-css-non-component.test.ts`
- Modify: `tsconfig.tests.json`

**Interfaces:**
- Consumes: `experiments.rsc.createPlugins()`, `Layers.rsc`, `rspack([server, client])`
- Produces: paired CSS-absent/CSS-present assertions without plugin or React Router imports

- [ ] **Step 1: Write the temporary fixture harness**

Write `entry.rsc.tsx`, `entry.client.ts`, `consumer.client.tsx`, `data.client.ts`, and optionally `data.css`. Configure paired `ServerPlugin`/`ClientPlugin`, the RSC layer, `builtin:swc-loader` with `rspackExperiments.reactServerComponents: true`, and a `type: 'css/auto'` CSS rule. Run and close the multi-compiler in `try/finally`.

- [ ] **Step 2: Add the control assertion**

For the CSS-absent variant assert:

```ts
expect(cssFiles).toEqual([]);
expect(dataFn.$$typeof).toBe(Symbol.for('react.client.reference'));
```

- [ ] **Step 3: Add the defect assertion**

For the CSS-present variant assert the client manifest lists `data.css` and:

```ts
expect(dataFn.$$typeof).toBe(Symbol.for('react.client.reference'));
```

Expected current failure: `dataFn.$$typeof` is `undefined` only when CSS is present.

- [ ] **Step 4: Typecheck and reproduce twice**

Run: `pnpm exec tsc -p tsconfig.tests.json --noEmit`

Expected: PASS.

Run twice: `pnpm exec rstest run tests/rspack-rsc-css-non-component.test.ts`

Expected: control PASS; CSS-present identity assertion FAILS deterministically.

- [ ] **Step 5: Commit reproduction**

```bash
git add tests/rspack-rsc-css-non-component.test.ts tsconfig.tests.json
git commit -m "test: reproduce Rspack RSC CSS reference loss"
```

### Task 2: Publication And Issue Gate

- [ ] **Step 1: Confirm isolation**

Verify clean compilation stats and that the reproduction imports neither `rsbuild-plugin-react-router` nor React Router. Confirm the diff contains only the reproduction test and test TypeScript include.

- [ ] **Step 2: Publish the branch**

Push `codex/rspack-rsc-css-non-component-repro` and capture a GitHub permalink to the failing assertion and fixture configuration.

- [ ] **Step 3: File only the confirmed generic bug**

Open a Rspack issue containing exact versions, both command results, CSS-absent control, CSS-present failure, relevant `clientManifest[resource].cssFiles`, and the reproduction permalink. Request preservation of client-reference identity for non-component exports or an export/resource opt-out from component CSS wrapping.

Do not publish/file if both variants fail, the CSS manifest is empty, or any failure depends on React Router/plugin code.
