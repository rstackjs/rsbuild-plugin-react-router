<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `490c349` against base `7bb55da`.

### Reading benchmark confidence

Raw deltas are always shown. The signal label only indicates whether the observed median delta is larger than a robust run-to-run noise band; it does not erase or replace the measurement.

The noise band is the larger of 2% or two combined robust standard deviations estimated from each side's relative median absolute deviation (rMAD). Fewer than three finite samples is reported as insufficient data. An inconclusive result should be rerun or investigated from the uploaded raw samples before drawing a performance conclusion.

| Benchmark | Runs | Base total | Head total | Delta | Base rMAD | Head rMAD | Noise band | Signal |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| `large-355-ssr-esm (build)` | 3 | 8.27s | 9.29s | +12.3% | 0.1% | 0.3% | ±2.0% | 🔴 regression |
| `synthetic-1024-ssr-esm (build)` | 3 | 3.84s | 3.84s | -0.1% | 1.5% | 0.5% | ±4.8% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (build)` | 3 | 5.19s | 5.69s | +9.5% | 0.4% | 0.5% | ±2.0% | 🔴 regression |
| `synthetic-256-sourcemaps (build)` | 5 | 2.21s | 2.24s | +1.3% | 0.9% | 0.4% | ±3.1% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (build)` | 5 | 2.02s | 2.09s | +3.4% | 0.5% | 0.6% | ±2.3% | 🔴 regression |
| `synthetic-256-ssr-esm-split (build)` | 5 | 2.44s | 2.62s | +7.3% | 1.2% | 0.2% | ±3.5% | 🔴 regression |
| `synthetic-48-ssr-esm (build)` | 5 | 1.33s | 1.35s | +1.8% | 1.2% | 0.4% | ±3.9% | ⚪ inconclusive |
| `large-355-ssr-esm (dev)` | 3 | 14.99s | 16.07s | +7.2% | 0.5% | 0.2% | ±2.0% | 🔴 regression |
| `synthetic-1024-ssr-esm (dev)` | 3 | 4.54s | 4.68s | +3.0% | 0.4% | 0.6% | ±2.2% | 🔴 regression |
| `synthetic-1024-ssr-esm-split (dev)` | 3 | 4.51s | 4.64s | +2.8% | 0.3% | 2.3% | ±6.9% | ⚪ inconclusive |
| `synthetic-256-sourcemaps (dev)` | 5 | 2.08s | 2.16s | +4.2% | 3.1% | 1.4% | ±10.2% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (dev)` | 5 | 1.82s | 1.89s | +4.1% | 1.1% | 1.2% | ±4.8% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (dev)` | 5 | 1.83s | 1.94s | +6.2% | 3.0% | 2.2% | ±11.1% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (dev)` | 5 | 0.94s | 0.93s | -1.4% | 1.0% | 0.9% | ±3.9% | ⚪ inconclusive |
| `complex app (cold)` | 3 | 119.45s | 136.26s | +14.1% | 1.1% | 4.9% | ±14.8% | ⚪ inconclusive |
| `complex app (dev)` | 3 | 127.78s | 107.65s | -15.8% | 0.2% | 0.5% | ±2.0% | 🟢 improvement |
| `complex app (warm)` | 3 | 81.33s | 97.22s | +19.5% | 0.5% | 4.8% | ±14.4% | 🔴 regression |

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 30.71s | 32.31s | +5.2% | 18.67s | 21.05s | +12.7% | 3.84s | 3.66s | -4.8% | 2.84s | 2.61s | -8.1% | 0.95x |
| Large app | 1 | 14.99s | 16.07s | +7.2% | 7.90s | 9.25s | +17.0% | 1.86s | 1.81s | -2.6% | 1.72s | 1.62s | -5.9% | 0.93x |
| Standard fixtures | 6 | 15.71s | 16.24s | +3.3% | 10.77s | 11.81s | +9.6% | 1.99s | 1.85s | -6.9% | 1.12s | 0.99s | -11.3% | 0.97x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 8.27s | 9.29s | +12.3% | 9.28s | 9.32s | 0.89x | 1620 MB |
| `synthetic-1024-ssr-esm` | 3 | 3.84s | 3.84s | -0.1% | 3.86s | 3.94s | 1.00x | 639 MB |
| `synthetic-1024-ssr-esm-split` | 3 | 5.19s | 5.69s | +9.5% | 5.64s | 5.71s | 0.91x | 824 MB |
| `synthetic-256-sourcemaps` | 5 | 2.21s | 2.24s | +1.3% | 2.25s | 2.32s | 0.99x | 449 MB |
| `synthetic-256-ssr-esm` | 5 | 2.02s | 2.09s | +3.4% | 2.09s | 2.11s | 0.97x | 421 MB |
| `synthetic-256-ssr-esm-split` | 5 | 2.44s | 2.62s | +7.3% | 2.62s | 2.65s | 0.93x | 465 MB |
| `synthetic-48-ssr-esm` | 5 | 1.33s | 1.35s | +1.8% | 1.36s | 1.39s | 0.98x | 303 MB |

### ci-small+ci-large Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `ci-small+ci-large` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 14.99s | 16.07s | +7.2% | 7.90s | 9.25s | 1.86s | 1.81s | 1.72s | 1.62s | -5.9% | 16.04s | 16.10s | 0.93x | - |
| `synthetic-1024-ssr-esm` | 3 | 4.54s | 4.68s | +3.0% | 3.12s | 3.43s | 0.57s | 0.51s | 0.35s | 0.30s | -14.0% | 4.67s | 4.71s | 0.97x | - |
| `synthetic-1024-ssr-esm-split` | 3 | 4.51s | 4.64s | +2.8% | 3.09s | 3.37s | 0.57s | 0.53s | 0.33s | 0.30s | -7.7% | 4.70s | 4.92s | 0.97x | - |
| `synthetic-256-sourcemaps` | 5 | 2.08s | 2.16s | +4.2% | 1.44s | 1.61s | 0.24s | 0.23s | 0.13s | 0.13s | -1.0% | 2.16s | 2.19s | 0.96x | - |
| `synthetic-256-ssr-esm` | 5 | 1.82s | 1.89s | +4.1% | 1.25s | 1.36s | 0.25s | 0.23s | 0.13s | 0.10s | -20.9% | 1.91s | 2.01s | 0.96x | - |
| `synthetic-256-ssr-esm-split` | 5 | 1.83s | 1.94s | +6.2% | 1.23s | 1.38s | 0.24s | 0.22s | 0.13s | 0.10s | -19.2% | 1.94s | 2.01s | 0.94x | - |
| `synthetic-48-ssr-esm` | 5 | 0.94s | 0.93s | -1.4% | 0.65s | 0.65s | 0.12s | 0.13s | 0.05s | 0.05s | +0.8% | 0.97s | 1.14s | 1.01x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1071 | 1074.2ms | 918.8ms | -14.5% | 918.8ms | 23.4ms | 6 |
| node | `route:module` | 1071 | 535.6ms | 446.3ms | -16.7% | 446.3ms | 10.1ms | 6 |
| web | `route:client-entry` | 1071 | 261.9ms | 228.4ms | -12.8% | 228.4ms | 7.1ms | 6 |
| node | `manifest:transform` | 3 | 77.5ms | 56.7ms | -26.8% | 56.7ms | 20.3ms | 3 |
| web | `manifest:stage` | 9 | 15.4ms | 11.8ms | -23.4% | 11.8ms | 2.0ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |
| node | `assets:relocate-ssr-only` | 6 | - | 79.5ms | - | 79.5ms | 13.8ms | 6 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1225.8ms | 1099.1ms | -10.3% | 1099.1ms | 13.1ms | 6 |
| node | `route:module` | 3078 | 582.2ms | 522.3ms | -10.3% | 522.3ms | 15.9ms | 6 |
| web | `route:client-entry` | 3078 | 388.3ms | 349.2ms | -10.1% | 349.2ms | 8.6ms | 6 |
| node | `manifest:transform` | 3 | 116.6ms | 112.9ms | -3.2% | 112.9ms | 39.4ms | 3 |
| node | `module:client-only-stub` | 3 | 109.3ms | 102.9ms | -5.9% | 102.9ms | 49.8ms | 3 |
| web | `manifest:stage` | 9 | 44.0ms | 36.1ms | -18.0% | 36.1ms | 7.0ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |
| node | `assets:relocate-ssr-only` | 6 | - | 1.3ms | - | 1.3ms | 0.4ms | 6 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1256.7ms | 1079.8ms | -14.1% | 1079.8ms | 7.4ms | 6 |
| node | `route:module` | 3078 | 566.0ms | 529.8ms | -6.4% | 529.8ms | 18.8ms | 6 |
| web | `route:client-entry` | 3078 | 358.4ms | 316.8ms | -11.6% | 316.8ms | 8.0ms | 6 |
| node | `manifest:transform` | 3 | 115.7ms | 137.9ms | +19.2% | 137.9ms | 58.2ms | 3 |
| web | `manifest:stage` | 9 | 37.8ms | 36.6ms | -3.2% | 36.6ms | 7.2ms | 9 |
| node | `module:client-only-stub` | 3 | 31.9ms | 70.2ms | +120.1% | 70.2ms | 51.9ms | 3 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |
| node | `assets:relocate-ssr-only` | 6 | - | 1.5ms | - | 1.5ms | 0.4ms | 6 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 735.1ms | 675.6ms | -8.1% | 675.6ms | 10.4ms | 10 |
| node | `route:module` | 1290 | 278.6ms | 307.4ms | +10.3% | 307.4ms | 4.6ms | 10 |
| web | `route:client-entry` | 1290 | 196.9ms | 194.5ms | -1.2% | 194.5ms | 5.2ms | 10 |
| node | `module:client-only-stub` | 5 | 96.2ms | 9.5ms | -90.1% | 9.5ms | 2.0ms | 5 |
| node | `manifest:transform` | 5 | 78.3ms | 80.0ms | +2.2% | 80.0ms | 19.5ms | 5 |
| web | `manifest:stage` | 15 | 15.3ms | 12.9ms | -15.7% | 12.9ms | 1.3ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.9ms | - | 2.9ms | 0.5ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1291 | 687.4ms | 628.0ms | -8.6% | 628.0ms | 17.4ms | 11 |
| node | `route:module` | 1290 | 268.5ms | 258.1ms | -3.9% | 258.1ms | 4.3ms | 10 |
| web | `route:client-entry` | 1291 | 205.0ms | 184.9ms | -9.8% | 184.9ms | 5.7ms | 11 |
| node | `manifest:transform` | 5 | 74.2ms | 83.9ms | +13.1% | 83.9ms | 20.8ms | 5 |
| node | `module:client-only-stub` | 5 | 20.1ms | 26.1ms | +29.9% | 26.1ms | 17.0ms | 5 |
| web | `manifest:stage` | 16 | 15.5ms | 13.9ms | -10.3% | 13.9ms | 1.3ms | 16 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 11 | - | 2.4ms | - | 2.4ms | 0.4ms | 11 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1292 | 677.4ms | 643.5ms | -5.0% | 643.5ms | 12.8ms | 12 |
| node | `route:module` | 1290 | 260.1ms | 254.0ms | -2.3% | 254.0ms | 5.3ms | 10 |
| web | `route:client-entry` | 1292 | 207.1ms | 184.0ms | -11.2% | 184.0ms | 5.5ms | 12 |
| node | `manifest:transform` | 5 | 91.4ms | 82.8ms | -9.4% | 82.8ms | 21.0ms | 5 |
| node | `module:client-only-stub` | 5 | 58.9ms | 10.3ms | -82.5% | 10.3ms | 2.5ms | 5 |
| web | `manifest:stage` | 17 | 14.9ms | 14.2ms | -4.7% | 14.2ms | 1.3ms | 17 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 12 | - | 2.5ms | - | 2.5ms | 0.4ms | 12 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 250 | 239.9ms | 184.7ms | -23.0% | 184.7ms | 5.3ms | 10 |
| node | `route:module` | 250 | 78.2ms | 63.3ms | -19.1% | 63.3ms | 0.6ms | 10 |
| web | `route:client-entry` | 250 | 59.3ms | 42.5ms | -28.3% | 42.5ms | 1.9ms | 10 |
| node | `module:client-only-stub` | 5 | 44.6ms | 41.6ms | -6.7% | 41.6ms | 13.3ms | 5 |
| node | `manifest:transform` | 5 | 26.1ms | 22.6ms | -13.4% | 22.6ms | 5.2ms | 5 |
| web | `manifest:stage` | 15 | 3.7ms | 3.8ms | +2.7% | 3.8ms | 0.4ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.1ms | - | 2.1ms | 0.4ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 119.45s | 136.26s | +14.1% | 137.52s | - | 0.88x | - |
| complex app | 3 | 81.33s | 97.22s | +19.5% | 96.94s | - | 0.84x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 127.78s | 107.65s | -15.8% | 114.51s | 96.83s | 3.39s | 3.10s | 4.24s | 3.43s | -19.1% | 108.09s | - | 1.19x | - |

Profile: `ci-small+ci-large`; mode: `dev`; iterations: `5`; warmup: `1`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29465689575)

