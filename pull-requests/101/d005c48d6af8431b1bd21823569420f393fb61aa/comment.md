<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `d005c48` against base `7bb55da`.

### Reading benchmark confidence

Raw deltas are always shown. The signal label only indicates whether the observed median delta is larger than a robust run-to-run noise band; it does not erase or replace the measurement.

The noise band is the larger of 2% or two combined robust standard deviations estimated from each side's relative median absolute deviation (rMAD). Fewer than three finite samples is reported as insufficient data. An inconclusive result should be rerun or investigated from the uploaded raw samples before drawing a performance conclusion.

| Benchmark | Runs | Base total | Head total | Delta | Base rMAD | Head rMAD | Noise band | Signal |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| `large-355-ssr-esm (build)` | 3 | 8.44s | 9.56s | +13.3% | 0.4% | 0.2% | ±2.0% | 🔴 regression |
| `synthetic-1024-ssr-esm (build)` | 3 | 3.93s | 3.95s | +0.4% | 0.2% | 2.0% | ±6.0% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (build)` | 3 | 5.22s | 5.52s | +5.6% | 0.8% | 0.2% | ±2.4% | 🔴 regression |
| `synthetic-256-sourcemaps (build)` | 5 | 2.07s | 2.04s | -1.2% | 0.5% | 0.9% | ±3.0% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (build)` | 5 | 1.88s | 1.93s | +2.7% | 1.1% | 0.1% | ±3.3% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (build)` | 5 | 2.23s | 2.33s | +4.4% | 0.2% | 0.7% | ±2.1% | 🔴 regression |
| `synthetic-48-ssr-esm (build)` | 5 | 1.25s | 1.25s | +0.7% | 1.8% | 0.8% | ±5.8% | ⚪ inconclusive |
| `large-355-ssr-esm (dev)` | 3 | 16.32s | 17.34s | +6.3% | 1.8% | 0.5% | ±5.5% | 🔴 regression |
| `synthetic-1024-ssr-esm (dev)` | 3 | 4.46s | 4.66s | +4.5% | 0.6% | 0.2% | ±2.0% | 🔴 regression |
| `synthetic-1024-ssr-esm-split (dev)` | 3 | 4.39s | 4.66s | +6.2% | 0.6% | 0.3% | ±2.1% | 🔴 regression |
| `synthetic-256-sourcemaps (dev)` | 5 | 1.94s | 1.96s | +1.2% | 1.0% | 2.4% | ±7.6% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (dev)` | 5 | 1.69s | 1.73s | +2.2% | 0.8% | 0.9% | ±3.7% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (dev)` | 5 | 1.70s | 1.74s | +2.2% | 0.6% | 1.8% | ±5.6% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (dev)` | 5 | 0.88s | 0.87s | -0.8% | 0.7% | 0.0% | ±2.1% | ⚪ inconclusive |
| `complex app (cold)` | 3 | 120.54s | 125.95s | +4.5% | 0.0% | 0.1% | ±2.0% | 🔴 regression |
| `complex app (dev)` | 3 | 105.44s | 107.93s | +2.4% | 0.5% | 0.1% | ±2.0% | 🔴 regression |
| `complex app (warm)` | 3 | 85.07s | 93.76s | +10.2% | 0.0% | 0.6% | ±2.0% | 🔴 regression |

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 31.38s | 32.96s | +5.0% | 18.12s | 20.11s | +11.0% | 3.76s | 3.77s | +0.4% | 2.79s | 2.67s | -4.5% | 0.95x |
| Large app | 1 | 16.32s | 17.34s | +6.3% | 8.12s | 9.36s | +15.3% | 1.90s | 1.82s | -4.5% | 1.70s | 1.70s | -0.3% | 0.94x |
| Standard fixtures | 6 | 15.06s | 15.62s | +3.7% | 10.00s | 10.75s | +7.5% | 1.85s | 1.96s | +5.5% | 1.09s | 0.97s | -11.2% | 0.96x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 8.44s | 9.56s | +13.3% | 9.63s | 9.80s | 0.88x | 1579 MB |
| `synthetic-1024-ssr-esm` | 3 | 3.93s | 3.95s | +0.4% | 3.97s | 4.10s | 1.00x | 599 MB |
| `synthetic-1024-ssr-esm-split` | 3 | 5.22s | 5.52s | +5.6% | 5.53s | 5.56s | 0.95x | 777 MB |
| `synthetic-256-sourcemaps` | 5 | 2.07s | 2.04s | -1.2% | 2.04s | 2.06s | 1.01x | 463 MB |
| `synthetic-256-ssr-esm` | 5 | 1.88s | 1.93s | +2.7% | 1.93s | 1.95s | 0.97x | 422 MB |
| `synthetic-256-ssr-esm-split` | 5 | 2.23s | 2.33s | +4.4% | 2.32s | 2.35s | 0.96x | 465 MB |
| `synthetic-48-ssr-esm` | 5 | 1.25s | 1.25s | +0.7% | 1.26s | 1.27s | 0.99x | 301 MB |

### ci-small+ci-large Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `ci-small+ci-large` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 16.32s | 17.34s | +6.3% | 8.12s | 9.36s | 1.90s | 1.82s | 1.70s | 1.70s | -0.3% | 17.39s | 17.58s | 0.94x | - |
| `synthetic-1024-ssr-esm` | 3 | 4.46s | 4.66s | +4.5% | 2.88s | 3.08s | 0.52s | 0.59s | 0.33s | 0.30s | -7.3% | 4.66s | 4.67s | 0.96x | - |
| `synthetic-1024-ssr-esm-split` | 3 | 4.39s | 4.66s | +6.2% | 2.78s | 3.06s | 0.51s | 0.60s | 0.33s | 0.31s | -6.9% | 4.68s | 4.74s | 0.94x | - |
| `synthetic-256-sourcemaps` | 5 | 1.94s | 1.96s | +1.2% | 1.39s | 1.48s | 0.24s | 0.22s | 0.13s | 0.10s | -19.8% | 1.99s | 2.09s | 0.99x | - |
| `synthetic-256-ssr-esm` | 5 | 1.69s | 1.73s | +2.2% | 1.16s | 1.26s | 0.23s | 0.22s | 0.13s | 0.10s | -20.5% | 1.74s | 1.78s | 0.98x | - |
| `synthetic-256-ssr-esm-split` | 5 | 1.70s | 1.74s | +2.2% | 1.17s | 1.25s | 0.24s | 0.21s | 0.13s | 0.10s | -18.5% | 1.76s | 1.82s | 0.98x | - |
| `synthetic-48-ssr-esm` | 5 | 0.88s | 0.87s | -0.8% | 0.61s | 0.62s | 0.11s | 0.12s | 0.05s | 0.05s | -0.0% | 0.87s | 0.87s | 1.01x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1071 | 402734.2ms | 356069.2ms | -11.6% | 2155.8ms | 666.0ms | 6 |
| node | `route:module` | 1071 | 81521.9ms | 112010.5ms | +37.4% | 893.7ms | 285.6ms | 6 |
| web | `route:client-entry` | 1071 | 53515.6ms | 114322.1ms | +113.6% | 633.8ms | 195.4ms | 6 |
| node | `manifest:transform` | 3 | 141.0ms | 80.1ms | -43.2% | 80.1ms | 37.5ms | 3 |
| web | `manifest:stage` | 9 | 14.5ms | 12.0ms | -17.2% | 12.0ms | 2.1ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |
| node | `assets:relocate-ssr-only` | 6 | - | 80.3ms | - | 80.3ms | 14.0ms | 6 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 776908.5ms | 709900.1ms | -8.6% | 1762.9ms | 347.2ms | 6 |
| web | `route:client-entry` | 3078 | 269769.5ms | 497860.6ms | +84.6% | 1253.2ms | 307.7ms | 6 |
| node | `route:module` | 3078 | 249987.6ms | 312170.9ms | +24.9% | 713.6ms | 164.9ms | 6 |
| node | `module:client-only-stub` | 3 | 175.9ms | 109.4ms | -37.8% | 109.4ms | 54.5ms | 3 |
| node | `manifest:transform` | 3 | 150.2ms | 143.9ms | -4.2% | 143.9ms | 54.0ms | 3 |
| web | `manifest:stage` | 9 | 41.5ms | 37.8ms | -8.9% | 37.8ms | 7.0ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |
| node | `assets:relocate-ssr-only` | 9 | - | 2.6ms | - | 2.6ms | 0.5ms | 9 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 732469.9ms | 674304.9ms | -7.9% | 1832.3ms | 350.7ms | 6 |
| node | `route:module` | 3078 | 305973.9ms | 352083.3ms | +15.1% | 1007.4ms | 232.1ms | 6 |
| web | `route:client-entry` | 3078 | 298850.9ms | 421023.9ms | +40.9% | 1095.8ms | 293.3ms | 6 |
| node | `module:client-only-stub` | 3 | 213.5ms | 137.3ms | -35.7% | 137.3ms | 66.4ms | 3 |
| node | `manifest:transform` | 3 | 157.1ms | 152.5ms | -2.9% | 152.5ms | 55.9ms | 3 |
| web | `manifest:stage` | 9 | 40.6ms | 44.1ms | +8.6% | 44.1ms | 7.7ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |
| node | `assets:relocate-ssr-only` | 9 | - | 2.9ms | - | 2.9ms | 0.5ms | 9 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 722.0ms | 632.5ms | -12.4% | 632.5ms | 9.5ms | 10 |
| node | `route:module` | 1290 | 286.0ms | 328.4ms | +14.8% | 328.4ms | 8.8ms | 10 |
| web | `route:client-entry` | 1290 | 179.7ms | 187.8ms | +4.5% | 187.8ms | 5.3ms | 10 |
| node | `manifest:transform` | 5 | 76.5ms | 74.5ms | -2.6% | 74.5ms | 20.3ms | 5 |
| node | `module:client-only-stub` | 5 | 52.6ms | 12.3ms | -76.6% | 12.3ms | 3.6ms | 5 |
| web | `manifest:stage` | 15 | 18.2ms | 12.9ms | -29.1% | 12.9ms | 1.3ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.7ms | - | 2.7ms | 0.5ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 644.8ms | 619.8ms | -3.9% | 619.8ms | 9.3ms | 10 |
| node | `route:module` | 1290 | 276.3ms | 259.8ms | -6.0% | 259.8ms | 4.6ms | 10 |
| web | `route:client-entry` | 1290 | 182.3ms | 164.8ms | -9.6% | 164.8ms | 5.1ms | 10 |
| node | `module:client-only-stub` | 5 | 160.1ms | 11.1ms | -93.1% | 11.1ms | 2.4ms | 5 |
| node | `manifest:transform` | 5 | 91.5ms | 63.2ms | -30.9% | 63.2ms | 15.4ms | 5 |
| web | `manifest:stage` | 15 | 14.2ms | 12.8ms | -9.9% | 12.8ms | 1.3ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.0ms | - | 2.0ms | 0.3ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1292 | 646.0ms | 594.6ms | -8.0% | 594.6ms | 9.2ms | 12 |
| node | `route:module` | 1290 | 289.7ms | 250.1ms | -13.7% | 250.1ms | 4.1ms | 10 |
| web | `route:client-entry` | 1292 | 175.4ms | 164.2ms | -6.4% | 164.2ms | 5.1ms | 12 |
| node | `module:client-only-stub` | 5 | 100.1ms | 46.9ms | -53.1% | 46.9ms | 20.2ms | 5 |
| node | `manifest:transform` | 5 | 62.1ms | 79.0ms | +27.2% | 79.0ms | 19.7ms | 5 |
| web | `manifest:stage` | 17 | 14.0ms | 14.2ms | +1.4% | 14.2ms | 1.3ms | 17 |
| web | `manifest:transform` | 5 | 0.5ms | 4.5ms | +800.0% | 4.5ms | 4.1ms | 5 |
| node | `assets:relocate-ssr-only` | 12 | - | 2.3ms | - | 2.3ms | 0.4ms | 12 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 250 | 241.3ms | 187.7ms | -22.2% | 187.7ms | 8.1ms | 10 |
| node | `route:module` | 250 | 82.2ms | 67.5ms | -17.9% | 67.5ms | 0.7ms | 10 |
| web | `route:client-entry` | 250 | 51.4ms | 43.3ms | -15.8% | 43.3ms | 2.1ms | 10 |
| node | `module:client-only-stub` | 5 | 41.7ms | 39.0ms | -6.5% | 39.0ms | 9.7ms | 5 |
| node | `manifest:transform` | 5 | 29.0ms | 21.2ms | -26.9% | 21.2ms | 4.9ms | 5 |
| web | `manifest:stage` | 15 | 3.7ms | 3.5ms | -5.4% | 3.5ms | 0.3ms | 15 |
| web | `manifest:transform` | 5 | 0.4ms | 0.5ms | +25.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.0ms | - | 2.0ms | 0.3ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 120.54s | 125.95s | +4.5% | 127.51s | - | 0.96x | - |
| complex app | 3 | 85.07s | 93.76s | +10.2% | 93.75s | - | 0.91x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 105.44s | 107.93s | +2.4% | 93.98s | 96.35s | 3.00s | 3.15s | 3.49s | 3.52s | +0.7% | 107.37s | - | 0.98x | - |

Profile: `ci-small+ci-large`; mode: `dev`; iterations: `5`; warmup: `1`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29806573906)

