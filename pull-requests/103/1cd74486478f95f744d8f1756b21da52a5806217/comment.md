<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `1cd7448` against base `8fdee93`.

### Reading benchmark confidence

Raw deltas are always shown. The signal label only indicates whether the observed median delta is larger than a robust run-to-run noise band; it does not erase or replace the measurement.

The noise band is the larger of 2% or two combined robust standard deviations estimated from each side's relative median absolute deviation (rMAD). Fewer than three finite samples is reported as insufficient data. An inconclusive result should be rerun or investigated from the uploaded raw samples before drawing a performance conclusion.

| Benchmark | Runs | Base total | Head total | Delta | Base rMAD | Head rMAD | Noise band | Signal |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| `large-355-ssr-esm (build)` | 3 | 10.15s | 10.30s | +1.5% | 0.4% | 1.7% | ±5.2% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm (build)` | 3 | 4.27s | 4.24s | -0.7% | 0.0% | 1.2% | ±3.7% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (build)` | 3 | 6.21s | 6.21s | -0.0% | 1.6% | 0.6% | ±5.1% | ⚪ inconclusive |
| `synthetic-256-sourcemaps (build)` | 5 | 2.28s | 2.26s | -1.1% | 1.2% | 0.6% | ±4.1% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (build)` | 5 | 2.18s | 2.15s | -1.2% | 1.6% | 0.3% | ±4.7% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (build)` | 5 | 2.69s | 2.67s | -0.6% | 0.4% | 0.2% | ±2.0% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (build)` | 5 | 1.42s | 1.37s | -3.0% | 1.2% | 0.3% | ±3.7% | ⚪ inconclusive |
| `large-355-ssr-esm (dev)` | 3 | 18.92s | 16.46s | -13.0% | 0.2% | 0.4% | ±2.0% | 🟢 improvement |
| `synthetic-1024-ssr-esm (dev)` | 3 | 5.00s | 4.78s | -4.3% | 0.1% | 0.3% | ±2.0% | 🟢 improvement |
| `synthetic-1024-ssr-esm-split (dev)` | 3 | 5.01s | 4.75s | -5.2% | 0.4% | 2.0% | ±5.9% | ⚪ inconclusive |
| `synthetic-256-sourcemaps (dev)` | 5 | 2.19s | 2.05s | -6.4% | 0.9% | 0.4% | ±2.8% | 🟢 improvement |
| `synthetic-256-ssr-esm (dev)` | 5 | 1.96s | 1.85s | -5.2% | 1.2% | 1.6% | ±6.0% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (dev)` | 5 | 2.00s | 1.87s | -6.7% | 0.8% | 0.8% | ±3.3% | 🟢 improvement |
| `synthetic-48-ssr-esm (dev)` | 5 | 0.97s | 0.94s | -2.5% | 0.4% | 1.0% | ±3.1% | ⚪ inconclusive |
| `complex app (cold)` | 3 | 112.47s | 118.13s | +5.0% | 0.4% | 0.0% | ±2.0% | 🔴 regression |
| `complex app (dev)` | 3 | 101.49s | 93.77s | -7.6% | 1.8% | 0.3% | ±5.4% | 🟢 improvement |
| `complex app (warm)` | 3 | 84.33s | 82.92s | -1.7% | 0.8% | 0.4% | ±2.8% | ⚪ inconclusive |

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 36.05s | 32.71s | -9.3% | 22.45s | 21.55s | -4.0% | 4.03s | 3.94s | -2.4% | 2.78s | 2.61s | -6.2% | 1.10x |
| Large app | 1 | 18.92s | 16.46s | -13.0% | 10.43s | 9.79s | -6.1% | 1.97s | 1.92s | -2.6% | 1.79s | 1.64s | -8.3% | 1.15x |
| Standard fixtures | 6 | 17.13s | 16.25s | -5.1% | 12.02s | 11.76s | -2.2% | 2.06s | 2.02s | -2.1% | 0.99s | 0.97s | -2.2% | 1.05x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 10.15s | 10.30s | +1.5% | 10.32s | 10.54s | 0.99x | 1581 MB |
| `synthetic-1024-ssr-esm` | 3 | 4.27s | 4.24s | -0.7% | 4.23s | 4.29s | 1.01x | 604 MB |
| `synthetic-1024-ssr-esm-split` | 3 | 6.21s | 6.21s | -0.0% | 6.21s | 6.26s | 1.00x | 768 MB |
| `synthetic-256-sourcemaps` | 5 | 2.28s | 2.26s | -1.1% | 2.27s | 2.29s | 1.01x | 450 MB |
| `synthetic-256-ssr-esm` | 5 | 2.18s | 2.15s | -1.2% | 2.14s | 2.16s | 1.01x | 417 MB |
| `synthetic-256-ssr-esm-split` | 5 | 2.69s | 2.67s | -0.6% | 2.67s | 2.69s | 1.01x | 469 MB |
| `synthetic-48-ssr-esm` | 5 | 1.42s | 1.37s | -3.0% | 1.38s | 1.41s | 1.03x | 297 MB |

### ci-small+ci-large Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `ci-small+ci-large` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 18.92s | 16.46s | -13.0% | 10.43s | 9.79s | 1.97s | 1.92s | 1.79s | 1.64s | -8.3% | 16.46s | 16.54s | 1.15x | - |
| `synthetic-1024-ssr-esm` | 3 | 5.00s | 4.78s | -4.3% | 3.41s | 3.41s | 0.58s | 0.61s | 0.30s | 0.31s | +1.2% | 4.79s | 4.82s | 1.05x | - |
| `synthetic-1024-ssr-esm-split` | 3 | 5.01s | 4.75s | -5.2% | 3.42s | 3.36s | 0.61s | 0.60s | 0.30s | 0.31s | +0.2% | 4.78s | 4.92s | 1.05x | - |
| `synthetic-256-sourcemaps` | 5 | 2.19s | 2.05s | -6.4% | 1.65s | 1.56s | 0.24s | 0.23s | 0.13s | 0.10s | -19.7% | 2.04s | 2.06s | 1.07x | - |
| `synthetic-256-ssr-esm` | 5 | 1.96s | 1.85s | -5.2% | 1.42s | 1.38s | 0.26s | 0.23s | 0.10s | 0.10s | -0.4% | 1.86s | 1.89s | 1.05x | - |
| `synthetic-256-ssr-esm-split` | 5 | 2.00s | 1.87s | -6.7% | 1.43s | 1.39s | 0.26s | 0.23s | 0.10s | 0.10s | -0.4% | 1.88s | 1.92s | 1.07x | - |
| `synthetic-48-ssr-esm` | 5 | 0.97s | 0.94s | -2.5% | 0.68s | 0.66s | 0.13s | 0.13s | 0.05s | 0.05s | -0.4% | 0.94s | 0.95s | 1.03x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1071 | 355781.3ms | 368654.4ms | +3.6% | 2094.8ms | 691.7ms | 6 |
| node | `route:module` | 1071 | 122066.0ms | 139881.0ms | +14.6% | 810.6ms | 248.2ms | 6 |
| web | `route:client-entry` | 1071 | 111331.8ms | 117040.3ms | +5.1% | 663.7ms | 203.6ms | 6 |
| node | `manifest:transform` | 3 | 163.0ms | 102.7ms | -37.0% | 102.7ms | 44.3ms | 3 |
| node | `assets:relocate-ssr-only` | 6 | 81.7ms | 86.6ms | +6.0% | 86.6ms | 16.7ms | 6 |
| web | `manifest:stage` | 6 | 11.6ms | 8.5ms | -26.7% | 8.5ms | 1.9ms | 6 |
| web | `manifest:transform` | 3 | 0.3ms | 0.4ms | +33.3% | 0.4ms | 0.2ms | 3 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 651492.4ms | 794376.7ms | +21.9% | 1929.4ms | 368.1ms | 6 |
| web | `route:client-entry` | 3078 | 506458.5ms | 527112.2ms | +4.1% | 1190.3ms | 317.6ms | 6 |
| node | `route:module` | 3078 | 274854.6ms | 333714.3ms | +21.4% | 847.0ms | 174.8ms | 6 |
| node | `manifest:transform` | 3 | 136.2ms | 145.5ms | +6.8% | 145.5ms | 55.7ms | 3 |
| node | `module:client-only-stub` | 3 | 40.2ms | 167.4ms | +316.4% | 167.4ms | 63.2ms | 3 |
| web | `manifest:stage` | 6 | 36.8ms | 36.3ms | -1.4% | 36.3ms | 7.3ms | 6 |
| node | `assets:relocate-ssr-only` | 6 | 2.0ms | 1.5ms | -25.0% | 1.5ms | 0.4ms | 6 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 729298.3ms | 669496.7ms | -8.2% | 1891.5ms | 328.2ms | 6 |
| web | `route:client-entry` | 3078 | 523705.2ms | 573698.0ms | +9.5% | 1293.2ms | 334.2ms | 6 |
| node | `route:module` | 3078 | 329423.8ms | 288297.1ms | -12.5% | 942.2ms | 165.3ms | 6 |
| node | `manifest:transform` | 3 | 160.0ms | 150.2ms | -6.1% | 150.2ms | 54.1ms | 3 |
| node | `module:client-only-stub` | 3 | 77.6ms | 177.4ms | +128.6% | 177.4ms | 78.3ms | 3 |
| web | `manifest:stage` | 7 | 36.4ms | 31.7ms | -12.9% | 31.7ms | 7.6ms | 7 |
| node | `assets:relocate-ssr-only` | 7 | 1.3ms | 1.7ms | +30.8% | 1.7ms | 0.5ms | 7 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 661.9ms | 700.3ms | +5.8% | 700.3ms | 12.6ms | 10 |
| node | `route:module` | 1290 | 288.3ms | 296.9ms | +3.0% | 296.9ms | 4.5ms | 10 |
| web | `route:client-entry` | 1290 | 192.7ms | 188.2ms | -2.3% | 188.2ms | 5.1ms | 10 |
| node | `manifest:transform` | 5 | 79.8ms | 66.0ms | -17.3% | 66.0ms | 14.9ms | 5 |
| node | `module:client-only-stub` | 5 | 24.6ms | 11.2ms | -54.5% | 11.2ms | 3.2ms | 5 |
| web | `manifest:stage` | 10 | 14.0ms | 10.0ms | -28.6% | 10.0ms | 1.3ms | 10 |
| node | `assets:relocate-ssr-only` | 10 | 3.3ms | 3.1ms | -6.1% | 3.1ms | 0.5ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 634.3ms | 638.5ms | +0.7% | 638.5ms | 16.3ms | 10 |
| node | `route:module` | 1290 | 250.7ms | 298.0ms | +18.9% | 298.0ms | 5.1ms | 10 |
| web | `route:client-entry` | 1290 | 181.9ms | 180.7ms | -0.7% | 180.7ms | 5.4ms | 10 |
| node | `manifest:transform` | 5 | 81.1ms | 86.7ms | +6.9% | 86.7ms | 21.0ms | 5 |
| node | `module:client-only-stub` | 5 | 14.4ms | 9.9ms | -31.3% | 9.9ms | 2.4ms | 5 |
| web | `manifest:stage` | 10 | 13.5ms | 9.8ms | -27.4% | 9.8ms | 1.3ms | 10 |
| node | `assets:relocate-ssr-only` | 10 | 2.6ms | 2.5ms | -3.8% | 2.5ms | 0.4ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1291 | 627.0ms | 625.3ms | -0.3% | 625.3ms | 11.0ms | 11 |
| node | `route:module` | 1290 | 285.9ms | 285.6ms | -0.1% | 285.6ms | 5.8ms | 10 |
| web | `route:client-entry` | 1291 | 209.4ms | 193.5ms | -7.6% | 193.5ms | 5.5ms | 11 |
| node | `manifest:transform` | 5 | 60.1ms | 86.0ms | +43.1% | 86.0ms | 24.1ms | 5 |
| web | `manifest:stage` | 11 | 13.2ms | 11.1ms | -15.9% | 11.1ms | 1.4ms | 11 |
| node | `module:client-only-stub` | 5 | 9.9ms | 10.7ms | +8.1% | 10.7ms | 2.8ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | 2.2ms | 2.5ms | +13.6% | 2.5ms | 0.4ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 250 | 216.8ms | 240.8ms | +11.1% | 240.8ms | 8.2ms | 10 |
| node | `route:module` | 250 | 62.6ms | 78.2ms | +24.9% | 78.2ms | 5.0ms | 10 |
| web | `route:client-entry` | 250 | 48.2ms | 37.4ms | -22.4% | 37.4ms | 0.8ms | 10 |
| node | `module:client-only-stub` | 5 | 25.3ms | 26.6ms | +5.1% | 26.6ms | 6.2ms | 5 |
| node | `manifest:transform` | 5 | 21.0ms | 25.2ms | +20.0% | 25.2ms | 7.0ms | 5 |
| web | `manifest:stage` | 10 | 3.9ms | 2.8ms | -28.2% | 2.8ms | 0.4ms | 10 |
| node | `assets:relocate-ssr-only` | 10 | 2.3ms | 2.6ms | +13.0% | 2.6ms | 0.5ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 112.47s | 118.13s | +5.0% | 116.71s | - | 0.95x | - |
| complex app | 3 | 84.33s | 82.92s | -1.7% | 82.73s | - | 1.02x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 101.49s | 93.77s | -7.6% | 91.10s | 84.42s | 2.78s | 3.07s | 3.26s | 2.22s | -32.0% | 93.75s | - | 1.08x | - |

Profile: `ci-small+ci-large`; mode: `dev`; iterations: `5`; warmup: `1`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/30138589011)

