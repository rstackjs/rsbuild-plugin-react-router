# Issue #155: behavior and performance evidence

Measured October 14, 2026 using the public issue's generated React.lazy catalog.

The candidate defers optional server modules and preserves pending SSR requests
and other tabs in the exercised cases. **It does not improve startup latency on
this workload.** Do not describe lower compiled-module counts as a measured
startup speedup.

## Browser timings

Median milliseconds, ten measured trials per arm/scenario, one excluded warmup.
Three arms: the pre-PR checkout with stock packages, the candidate with the option
disabled, and the candidate with it enabled. The last two use identical packages.
The generated input digest is asserted equal across every group of three trials.

Startup means process launch through the index page's working hydrated click
handler, as requested in issue #155. Browser launch is outside that clock. Each
trial then opens `/catalog/17` in a second tab; that request is timed separately.
Fresh fixture/output/server/browser per trial, default watchers, no module census
instrumentation, alternating arm order. OS filesystem caches are not flushed.

| Format | Optional modules | Stock startup | Candidate option off | Candidate option on | On vs off |
| ------ | ---------------: | ------------: | -------------------: | ------------------: | --------: |
| CJS    |              100 |         799.0 |                783.5 |              1093.6 |    +39.6% |
| CJS    |            1,000 |        1408.7 |               1470.7 |              1792.9 |    +21.9% |
| ESM    |              100 |         780.7 |                783.0 |               992.4 |    +26.7% |
| ESM    |            1,000 |        1383.0 |               1454.9 |              1811.4 |    +24.5% |

Lazy startup was slower in all 40 paired on/off comparisons.

| Format | Modules | Stock first SSR content | Option off first SSR content | Option on first SSR content | Option on request interactive |
| ------ | ------: | ----------------------: | ---------------------------: | --------------------------: | ----------------------------: |
| CJS    |     100 |                    14.6 |                         15.8 |                       230.6 |                         334.6 |
| CJS    |   1,000 |                    15.6 |                         15.3 |                       574.9 |                         824.7 |
| ESM    |     100 |                    14.8 |                         15.6 |                       246.5 |                         339.0 |
| ESM    |   1,000 |                    15.9 |                         15.9 |                       522.0 |                         828.9 |

All 132 trials (120 measured plus 12 warmups) assert HTTP 200, actual SSR content
in the original response, working hydrated click handlers, retained text and
document identity in the first tab, and no activation-triggered reload or HDR.
Timing runs intentionally omit module-census assertions; separate correctness
runs verify those counts.

This is a local macOS ARM64 / Node 24 comparison. It is not a claim about all
hardware or applications. Stock uses Rsbuild 2.2.8 and Rspack 2.2.6 from the pre-PR
checkout, rather than claiming to be the exact package pair cited in the issue.
The controlled on/off arms both use the same Rsbuild PR preview and combined
Rspack canary; exact versions and all ranges/samples are in
[browser-timings.json](browser-timings.json).

## On-demand behavior

Separate census runs passed for both CJS and ESM at 100 and 1,000 optional
components. The stock plugin compiled all 100/1,000 optional server components
before a request. The candidate compiled zero initially and exactly one after
`/catalog/17`; item 18 remained deferred. That is 99%/99.9% fewer compiled
optional component bodies after the first catalog request, not a reduction in
all compiler modules or a measured CPU saving.

All four candidate browser cases also passed dependency, loader, action,
metadata and CSS edits while retaining the first tab's text. Their original SSR
responses contained item 17; the first tab's document identity survived lazy
activation. [Correctness records](correctness.json) preserve the asserted counts
and package versions. The retained-request behavior belongs to the Router
integration; the Rsbuild option alone does not implement it.

## Runtime validation

On Node 22.22.0, the current canary passed all 908 tests in 85 files with no skips,
including 40 native CJS/ESM lazy-runtime scenarios. These cover concurrent and
nested imports, imports during hot-update application, pre-listen boundaries,
compilation/evaluation failures, unknown invalidations, shutdown, superseded
requests, pending/failed Web generations, and multiple server entries. The full
repository type check also passed.

The first macOS full-suite run exposed 13 test-path mismatches: Rspack returned
canonical `/private/var/...` paths while the fixture expected `/var/...`. The
route queries were correct. Canonicalizing the fixture root fixed all 21 tests
in that file; no resolver behavior or assertions were weakened. The subsequent
full run passed.

These fresh results are local; earlier Windows/Linux runs used the previous
canary and are not represented here as validation of the current package.

## Reproduce

```sh
pnpm install --frozen-lockfile
pnpm build
node scripts/benchmark/node-lazy-browser.mjs \
  --stock-repo /absolute/path/to/built-pre-pr-checkout \
  --iterations 10 --warmup 1
```

Omit `--stock-repo` to run only the controlled on/off comparison. The existing
Benchmark workflow's `node_lazy` dispatch now includes that browser comparison
on Linux and uploads its raw JSON alongside the separate correctness checks.

## Interpretation

The feature removes eager compilation of unused optional component bodies.
It still has costs for lazy proxies, runtime retention and activation. These
measurements establish their combined latency, not which internal operation
causes the regression. The feature's performance rationale remains unmet for
the supplied lightweight-component fixture; these results do not justify a
startup-speed claim or a default-on rollout.
