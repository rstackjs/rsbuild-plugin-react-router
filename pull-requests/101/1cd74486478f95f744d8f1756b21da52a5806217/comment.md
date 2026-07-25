<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `1cd7448` against base `94ed3cc`.

### Reading benchmark confidence

Raw deltas are always shown. The signal label only indicates whether the observed median delta is larger than a robust run-to-run noise band; it does not erase or replace the measurement.

The noise band is the larger of 2% or two combined robust standard deviations estimated from each side's relative median absolute deviation (rMAD). Fewer than three finite samples is reported as insufficient data. An inconclusive result should be rerun or investigated from the uploaded raw samples before drawing a performance conclusion.

| Benchmark | Runs | Base total | Head total | Delta | Base rMAD | Head rMAD | Noise band | Signal |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| `large-355-ssr-esm (build)` | 3 | 8.62s | 9.60s | +11.4% | 0.3% | 1.4% | ±4.3% | 🔴 regression |
| `synthetic-1024-ssr-esm (build)` | 3 | 3.92s | 3.96s | +1.1% | 0.9% | 0.6% | ±3.3% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (build)` | 3 | 5.43s | 5.82s | +7.2% | 0.7% | 0.4% | ±2.2% | 🔴 regression |
| `synthetic-256-sourcemaps (build)` | 5 | 2.16s | 2.20s | +2.0% | 0.1% | 0.6% | ±2.0% | 🔴 regression |
| `synthetic-256-ssr-esm (build)` | 5 | 1.99s | 2.06s | +3.1% | 0.7% | 1.2% | ±4.1% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (build)` | 5 | 2.38s | 2.51s | +5.2% | 0.1% | 0.8% | ±2.3% | 🔴 regression |
| `synthetic-48-ssr-esm (build)` | 5 | 1.32s | 1.38s | +4.5% | 1.8% | 0.3% | ±5.3% | ⚪ inconclusive |
| `large-355-ssr-esm (dev)` | 3 | 14.05s | 15.13s | +7.7% | 0.4% | 0.0% | ±2.0% | 🔴 regression |
| `synthetic-1024-ssr-esm (dev)` | 3 | 4.10s | 4.27s | +4.3% | 0.5% | 0.9% | ±3.1% | 🔴 regression |
| `synthetic-1024-ssr-esm-split (dev)` | 3 | 4.09s | 4.37s | +6.9% | 1.3% | 3.4% | ±10.8% | ⚪ inconclusive |
| `synthetic-256-sourcemaps (dev)` | 5 | 1.84s | 1.93s | +5.0% | 1.7% | 0.4% | ±5.1% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (dev)` | 5 | 1.72s | 1.77s | +2.6% | 0.9% | 1.4% | ±5.1% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (dev)` | 5 | 1.71s | 1.78s | +4.4% | 0.2% | 2.0% | ±5.9% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (dev)` | 5 | 0.88s | 0.90s | +3.1% | 1.0% | 1.9% | ±6.3% | ⚪ inconclusive |
| `complex app (cold)` | 3 | 112.28s | 122.42s | +9.0% | 0.1% | 0.3% | ±2.0% | 🔴 regression |
| `complex app (dev)` | 3 | 97.55s | 104.39s | +7.0% | 0.2% | 1.9% | ±5.6% | 🔴 regression |
| `complex app (warm)` | 3 | 80.18s | 99.96s | +24.7% | 0.1% | 0.8% | ±2.4% | 🔴 regression |

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 28.38s | 30.16s | +6.3% | 17.41s | 19.52s | +12.1% | 3.76s | 3.77s | +0.2% | 2.72s | 2.57s | -5.3% | 0.94x |
| Large app | 1 | 14.05s | 15.13s | +7.7% | 7.61s | 8.77s | +15.4% | 1.87s | 1.84s | -1.3% | 1.66s | 1.61s | -2.5% | 0.93x |
| Standard fixtures | 6 | 14.33s | 15.03s | +4.9% | 9.81s | 10.75s | +9.6% | 1.90s | 1.93s | +1.8% | 1.06s | 0.96s | -9.6% | 0.95x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 8.62s | 9.60s | +11.4% | 9.64s | 9.86s | 0.90x | 1601 MB |
| `synthetic-1024-ssr-esm` | 3 | 3.92s | 3.96s | +1.1% | 3.94s | 3.99s | 0.99x | 602 MB |
| `synthetic-1024-ssr-esm-split` | 3 | 5.43s | 5.82s | +7.2% | 5.80s | 5.84s | 0.93x | 771 MB |
| `synthetic-256-sourcemaps` | 5 | 2.16s | 2.20s | +2.0% | 2.20s | 2.23s | 0.98x | 455 MB |
| `synthetic-256-ssr-esm` | 5 | 1.99s | 2.06s | +3.1% | 2.07s | 2.13s | 0.97x | 436 MB |
| `synthetic-256-ssr-esm-split` | 5 | 2.38s | 2.51s | +5.2% | 2.51s | 2.54s | 0.95x | 465 MB |
| `synthetic-48-ssr-esm` | 5 | 1.32s | 1.38s | +4.5% | 1.37s | 1.39s | 0.96x | 300 MB |

### ci-small+ci-large Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `ci-small+ci-large` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 14.05s | 15.13s | +7.7% | 7.61s | 8.77s | 1.87s | 1.84s | 1.66s | 1.61s | -2.5% | 15.15s | 15.19s | 0.93x | - |
| `synthetic-1024-ssr-esm` | 3 | 4.10s | 4.27s | +4.3% | 2.74s | 2.98s | 0.53s | 0.56s | 0.33s | 0.30s | -8.0% | 4.27s | 4.31s | 0.96x | - |
| `synthetic-1024-ssr-esm-split` | 3 | 4.09s | 4.37s | +6.9% | 2.74s | 3.06s | 0.52s | 0.58s | 0.33s | 0.30s | -7.2% | 4.38s | 4.55s | 0.94x | - |
| `synthetic-256-sourcemaps` | 5 | 1.84s | 1.93s | +5.0% | 1.32s | 1.46s | 0.24s | 0.22s | 0.13s | 0.10s | -20.2% | 1.93s | 1.96s | 0.95x | - |
| `synthetic-256-ssr-esm` | 5 | 1.72s | 1.77s | +2.6% | 1.20s | 1.29s | 0.25s | 0.22s | 0.13s | 0.10s | -18.9% | 1.76s | 1.80s | 0.98x | - |
| `synthetic-256-ssr-esm-split` | 5 | 1.71s | 1.78s | +4.4% | 1.19s | 1.31s | 0.24s | 0.22s | 0.10s | 0.10s | -2.5% | 1.78s | 1.83s | 0.96x | - |
| `synthetic-48-ssr-esm` | 5 | 0.88s | 0.90s | +3.1% | 0.61s | 0.64s | 0.12s | 0.12s | 0.05s | 0.05s | -0.8% | 0.91s | 0.94s | 0.97x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1071 | 358217.5ms | 397947.2ms | +11.1% | 1972.1ms | 611.2ms | 6 |
| node | `route:module` | 1071 | 75161.8ms | 133393.2ms | +77.5% | 848.7ms | 269.6ms | 6 |
| web | `route:client-entry` | 1071 | 59452.6ms | 113002.6ms | +90.1% | 636.8ms | 197.0ms | 6 |
| node | `manifest:transform` | 3 | 81.1ms | 97.9ms | +20.7% | 97.9ms | 40.7ms | 3 |
| web | `manifest:stage` | 6 | 13.3ms | 8.8ms | -33.8% | 8.8ms | 2.0ms | 6 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |
| node | `assets:relocate-ssr-only` | 6 | - | 80.5ms | - | 80.5ms | 14.0ms | 6 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 735628.7ms | 729122.6ms | -0.9% | 1775.1ms | 339.9ms | 6 |
| web | `route:client-entry` | 3078 | 302763.7ms | 501498.2ms | +65.6% | 1107.9ms | 314.0ms | 6 |
| node | `route:module` | 3078 | 299349.0ms | 307527.4ms | +2.7% | 871.2ms | 162.8ms | 6 |
| node | `module:client-only-stub` | 3 | 296.0ms | 105.2ms | -64.5% | 105.2ms | 49.4ms | 3 |
| node | `manifest:transform` | 3 | 157.0ms | 167.6ms | +6.8% | 167.6ms | 61.8ms | 3 |
| web | `manifest:stage` | 6 | 32.6ms | 38.0ms | +16.6% | 38.0ms | 7.3ms | 6 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |
| node | `assets:relocate-ssr-only` | 6 | - | 1.5ms | - | 1.5ms | 0.4ms | 6 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 709043.0ms | 770334.4ms | +8.6% | 1826.3ms | 387.5ms | 6 |
| node | `route:module` | 3078 | 373656.7ms | 234273.0ms | -37.3% | 902.0ms | 160.1ms | 6 |
| web | `route:client-entry` | 3078 | 305120.2ms | 495165.7ms | +62.3% | 1226.9ms | 307.5ms | 6 |
| node | `module:client-only-stub` | 3 | 468.6ms | 55.8ms | -88.1% | 55.8ms | 22.8ms | 3 |
| node | `manifest:transform` | 3 | 167.3ms | 147.1ms | -12.1% | 147.1ms | 57.1ms | 3 |
| web | `manifest:stage` | 7 | 31.9ms | 33.1ms | +3.8% | 33.1ms | 7.2ms | 7 |
| web | `manifest:transform` | 3 | 0.3ms | 0.4ms | +33.3% | 0.4ms | 0.2ms | 3 |
| node | `assets:relocate-ssr-only` | 7 | - | 1.7ms | - | 1.7ms | 0.4ms | 7 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 701.8ms | 645.4ms | -8.0% | 645.4ms | 13.9ms | 10 |
| node | `route:module` | 1290 | 310.0ms | 306.2ms | -1.2% | 306.2ms | 11.7ms | 10 |
| web | `route:client-entry` | 1290 | 192.5ms | 179.8ms | -6.6% | 179.8ms | 5.4ms | 10 |
| node | `module:client-only-stub` | 5 | 121.7ms | 12.3ms | -89.9% | 12.3ms | 3.2ms | 5 |
| node | `manifest:transform` | 5 | 62.1ms | 77.3ms | +24.5% | 77.3ms | 18.5ms | 5 |
| web | `manifest:stage` | 10 | 13.6ms | 10.2ms | -25.0% | 10.2ms | 1.4ms | 10 |
| web | `manifest:transform` | 5 | 0.4ms | 0.5ms | +25.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 3.1ms | - | 3.1ms | 0.5ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1291 | 682.3ms | 653.5ms | -4.2% | 653.5ms | 20.7ms | 11 |
| node | `route:module` | 1290 | 272.0ms | 296.8ms | +9.1% | 296.8ms | 10.4ms | 10 |
| web | `route:client-entry` | 1291 | 203.1ms | 169.4ms | -16.6% | 169.4ms | 5.8ms | 11 |
| node | `manifest:transform` | 5 | 80.6ms | 81.2ms | +0.7% | 81.2ms | 22.2ms | 5 |
| node | `module:client-only-stub` | 5 | 36.7ms | 27.4ms | -25.3% | 27.4ms | 18.4ms | 5 |
| web | `manifest:stage` | 11 | 11.4ms | 11.0ms | -3.5% | 11.0ms | 1.8ms | 11 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.4ms | - | 2.4ms | 0.4ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 698.2ms | 649.4ms | -7.0% | 649.4ms | 14.9ms | 10 |
| node | `route:module` | 1291 | 287.9ms | 303.5ms | +5.4% | 303.5ms | 7.4ms | 11 |
| web | `route:client-entry` | 1290 | 195.5ms | 176.0ms | -10.0% | 176.0ms | 5.3ms | 10 |
| node | `manifest:transform` | 5 | 90.9ms | 70.3ms | -22.7% | 70.3ms | 15.9ms | 5 |
| node | `module:client-only-stub` | 5 | 27.9ms | 21.9ms | -21.5% | 21.9ms | 8.4ms | 5 |
| web | `manifest:stage` | 10 | 11.4ms | 13.0ms | +14.0% | 13.0ms | 4.1ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 11 | - | 2.6ms | - | 2.6ms | 0.4ms | 11 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 250 | 216.9ms | 215.2ms | -0.8% | 215.2ms | 6.7ms | 10 |
| node | `route:module` | 250 | 78.2ms | 75.2ms | -3.8% | 75.2ms | 3.7ms | 10 |
| web | `route:client-entry` | 250 | 55.1ms | 34.3ms | -37.7% | 34.3ms | 0.8ms | 10 |
| node | `module:client-only-stub` | 5 | 49.3ms | 34.5ms | -30.0% | 34.5ms | 8.6ms | 5 |
| node | `manifest:transform` | 5 | 25.5ms | 25.1ms | -1.6% | 25.1ms | 7.7ms | 5 |
| web | `manifest:stage` | 10 | 2.7ms | 2.9ms | +7.4% | 2.9ms | 0.4ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.5ms | - | 2.5ms | 0.4ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 112.28s | 122.42s | +9.0% | 122.88s | - | 0.92x | - |
| complex app | 3 | 80.18s | 99.96s | +24.7% | 97.06s | - | 0.80x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 97.55s | 104.39s | +7.0% | 87.97s | 94.43s | 3.05s | 3.08s | 2.32s | 2.50s | +7.5% | 104.96s | - | 0.93x | - |

Profile: `ci-small+ci-large`; mode: `dev`; iterations: `5`; warmup: `1`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/30138588946)

