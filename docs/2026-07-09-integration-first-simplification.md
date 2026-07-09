# Integration-First Simplification

## Goal

Reduce branch-specific complexity in the plugin and copied React Router framework corpus while preserving intentional upstream parity. Replace fixture hacks with explicit Rsbuild/Rspack adapter behavior. Escalate only a native, independently reproduced Rspack RSC defect.

## Invariants

- Keep Yuku as the fast route-export parser and Rspack SWC normalization as the TS/TSX-only correctness fallback after a Yuku parse failure.
- Preserve trailing-slash-aware prerender data paths.
- Preserve intentional Rspack-native RSC CSS behavior and the documented lack of an Rsbuild static-file allow-list equivalent.
- Do not change copied upstream tests merely to weaken their assertions; adapt them only where the Rsbuild/Rspack contract is genuinely different.

## Core Cleanup

- Consolidate duplicate browser-manifest report-hook registration while retaining build-only SRI finalization.
- Remove the unused private dev-manifest parameter without changing the public API.
- Share the side-effect stylesheet import predicate used by RSC transforms.
- Remove the duplicated pathname from the prerenderability diagnostic and test the exact message.

## Corpus Integration

- Make corpus renames executable during synchronization so renamed tests continue receiving upstream changes.
- Centralize Rsbuild configuration generation and preserve fixture-authored TypeScript configuration.
- Reject residual Vite configuration at fixture creation instead of silently discarding test-specific options.
- Remove dead Vite types, exclusions, and environment switches from the copied corpus.
- Replace skips with native Rsbuild/Rspack assertions where support exists: programmatic load context, normalized base/basename behavior, client compilation stats, build manifests, and CSS splitting.
- Keep unsupported behavior explicitly documented rather than hidden behind adapter emulation.

## Upstream RSC Reproduction

Build a native two-compiler Rspack reproduction outside the React Router adapter. A CSS-bearing `"use client"` module exports a non-component function; an RSC entry passes it through a client boundary. Compare CSS-present and CSS-absent behavior and inspect the generated client manifest.

Open an upstream Rspack issue only if the native reproduction proves that CSS wrapping loses non-component client-reference identity. Publish the reproduction on a dedicated branch in this repository so the report is independently runnable.

## Execution And Verification

Use small, non-overlapping subagent tasks. Each task starts with TraceDecay symbol/context/impact queries, uses anchored edits, and runs the narrowest affected tests. The root agent reviews every shared-worktree diff before broader verification.

Verification proceeds from targeted tests to typecheck/build, core package tests, corpus integration tests, framework smoke/RSC/fail-fast coverage, and a hot-path benchmark only if export-analysis behavior changes.
