<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `d005c48` against base `8fdee93`.

### Reading benchmark confidence

Raw deltas are always shown. The signal label only indicates whether the observed median delta is larger than a robust run-to-run noise band; it does not erase or replace the measurement.

The noise band is the larger of 2% or two combined robust standard deviations estimated from each side's relative median absolute deviation (rMAD). Fewer than three finite samples is reported as insufficient data. An inconclusive result should be rerun or investigated from the uploaded raw samples before drawing a performance conclusion.

| Benchmark | Runs | Base total | Head total | Delta | Base rMAD | Head rMAD | Noise band | Signal |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| `large-355-ssr-esm (build)` | 3 | 10.29s | 10.57s | +2.7% | 1.2% | 0.3% | ±3.6% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm (build)` | 3 | 4.34s | 4.35s | +0.1% | 0.4% | 0.4% | ±2.0% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (build)` | 3 | 6.29s | 6.16s | -2.0% | 0.6% | 0.2% | ±2.0% | ⚪ inconclusive |
| `synthetic-256-sourcemaps (build)` | 5 | 2.04s | 2.02s | -1.0% | 0.2% | 0.2% | ±2.0% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (build)` | 5 | 1.92s | 1.90s | -1.2% | 0.5% | 1.2% | ±3.8% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (build)` | 5 | 2.35s | 2.35s | +0.0% | 0.5% | 0.7% | ±2.6% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (build)` | 5 | 1.30s | 1.27s | -2.3% | 1.5% | 1.2% | ±5.7% | ⚪ inconclusive |
| `large-355-ssr-esm (dev)` | 3 | 19.24s | 18.69s | -2.9% | 0.9% | 0.2% | ±2.8% | 🟢 improvement |
| `synthetic-1024-ssr-esm (dev)` | 3 | 5.11s | 4.98s | -2.5% | 1.4% | 1.4% | ±5.8% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (dev)` | 3 | 5.02s | 4.98s | -0.8% | 1.0% | 0.4% | ±3.1% | ⚪ inconclusive |
| `synthetic-256-sourcemaps (dev)` | 5 | 1.99s | 1.95s | -2.0% | 0.9% | 1.4% | ±4.9% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (dev)` | 5 | 1.73s | 1.72s | -0.5% | 0.2% | 0.8% | ±2.5% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (dev)` | 5 | 1.79s | 1.77s | -0.8% | 1.3% | 2.3% | ±7.8% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (dev)` | 5 | 0.89s | 0.88s | -1.1% | 0.5% | 0.2% | ±2.0% | ⚪ inconclusive |
| `complex app (cold)` | 3 | 122.61s | 121.61s | -0.8% | 0.6% | 1.2% | ±3.8% | ⚪ inconclusive |
| `complex app (dev)` | 3 | 104.57s | 105.00s | +0.4% | 0.6% | 0.9% | ±3.3% | ⚪ inconclusive |
| `complex app (warm)` | 3 | 89.63s | 88.38s | -1.4% | 0.7% | 1.2% | ±4.1% | ⚪ inconclusive |

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 35.76s | 34.97s | -2.2% | 22.07s | 21.63s | -2.0% | 3.99s | 3.94s | -1.4% | 2.84s | 2.71s | -4.8% | 1.02x |
| Large app | 1 | 19.24s | 18.69s | -2.9% | 10.61s | 10.23s | -3.5% | 1.98s | 1.99s | +0.6% | 1.83s | 1.75s | -4.5% | 1.03x |
| Standard fixtures | 6 | 16.52s | 16.28s | -1.5% | 11.46s | 11.40s | -0.5% | 2.01s | 1.95s | -3.4% | 1.01s | 0.96s | -5.2% | 1.01x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 10.29s | 10.57s | +2.7% | 10.52s | 10.60s | 0.97x | 1587 MB |
| `synthetic-1024-ssr-esm` | 3 | 4.34s | 4.35s | +0.1% | 4.45s | 4.68s | 1.00x | 614 MB |
| `synthetic-1024-ssr-esm-split` | 3 | 6.29s | 6.16s | -2.0% | 6.15s | 6.18s | 1.02x | 769 MB |
| `synthetic-256-sourcemaps` | 5 | 2.04s | 2.02s | -1.0% | 2.02s | 2.03s | 1.01x | 453 MB |
| `synthetic-256-ssr-esm` | 5 | 1.92s | 1.90s | -1.2% | 1.90s | 1.93s | 1.01x | 425 MB |
| `synthetic-256-ssr-esm-split` | 5 | 2.35s | 2.35s | +0.0% | 2.35s | 2.38s | 1.00x | 461 MB |
| `synthetic-48-ssr-esm` | 5 | 1.30s | 1.27s | -2.3% | 1.26s | 1.28s | 1.02x | 310 MB |

### ci-small+ci-large Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `ci-small+ci-large` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 19.24s | 18.69s | -2.9% | 10.61s | 10.23s | 1.98s | 1.99s | 1.83s | 1.75s | -4.5% | 18.64s | 18.73s | 1.03x | - |
| `synthetic-1024-ssr-esm` | 3 | 5.11s | 4.98s | -2.5% | 3.45s | 3.40s | 0.60s | 0.59s | 0.30s | 0.30s | -0.1% | 5.00s | 5.10s | 1.03x | - |
| `synthetic-1024-ssr-esm-split` | 3 | 5.02s | 4.98s | -0.8% | 3.40s | 3.41s | 0.60s | 0.59s | 0.33s | 0.30s | -8.0% | 4.98s | 5.00s | 1.01x | - |
| `synthetic-256-sourcemaps` | 5 | 1.99s | 1.95s | -2.0% | 1.46s | 1.46s | 0.22s | 0.22s | 0.13s | 0.10s | -20.2% | 1.94s | 1.98s | 1.02x | - |
| `synthetic-256-ssr-esm` | 5 | 1.73s | 1.72s | -0.5% | 1.24s | 1.25s | 0.24s | 0.21s | 0.10s | 0.10s | +0.5% | 1.75s | 1.79s | 1.00x | - |
| `synthetic-256-ssr-esm-split` | 5 | 1.79s | 1.77s | -0.8% | 1.27s | 1.26s | 0.24s | 0.21s | 0.10s | 0.10s | -0.6% | 1.77s | 1.84s | 1.01x | - |
| `synthetic-48-ssr-esm` | 5 | 0.89s | 0.88s | -1.1% | 0.63s | 0.62s | 0.12s | 0.12s | 0.05s | 0.05s | -1.0% | 0.87s | 0.88s | 1.01x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1071 | 370887.0ms | 391546.9ms | +5.6% | 2295.9ms | 732.8ms | 6 |
| node | `route:module` | 1071 | 125639.4ms | 107578.6ms | -14.4% | 787.7ms | 205.9ms | 6 |
| web | `route:client-entry` | 1071 | 110741.0ms | 115153.5ms | +4.0% | 649.7ms | 195.7ms | 6 |
| node | `manifest:transform` | 3 | 120.8ms | 78.1ms | -35.3% | 78.1ms | 30.8ms | 3 |
| node | `assets:relocate-ssr-only` | 6 | 82.1ms | 86.6ms | +5.5% | 86.6ms | 16.4ms | 6 |
| web | `manifest:stage` | 9 | 12.5ms | 11.7ms | -6.4% | 11.7ms | 1.9ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 716094.8ms | 686373.7ms | -4.2% | 1959.6ms | 354.3ms | 6 |
| web | `route:client-entry` | 3078 | 500076.5ms | 508933.6ms | +1.8% | 1187.4ms | 327.9ms | 6 |
| node | `route:module` | 3078 | 335665.6ms | 330953.2ms | -1.4% | 958.5ms | 256.2ms | 6 |
| node | `module:client-only-stub` | 3 | 209.2ms | 130.1ms | -37.8% | 130.1ms | 73.5ms | 3 |
| node | `manifest:transform` | 3 | 157.9ms | 148.4ms | -6.0% | 148.4ms | 56.5ms | 3 |
| web | `manifest:stage` | 9 | 39.8ms | 37.6ms | -5.5% | 37.6ms | 7.8ms | 9 |
| node | `assets:relocate-ssr-only` | 9 | 1.7ms | 2.5ms | +47.1% | 2.5ms | 0.5ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 716817.3ms | 713607.7ms | -0.4% | 1857.6ms | 365.4ms | 6 |
| web | `route:client-entry` | 3078 | 546001.1ms | 515130.7ms | -5.7% | 1164.0ms | 312.4ms | 6 |
| node | `route:module` | 3078 | 309145.8ms | 276581.5ms | -10.5% | 1011.8ms | 167.2ms | 6 |
| node | `manifest:transform` | 3 | 136.2ms | 143.0ms | +5.0% | 143.0ms | 56.0ms | 3 |
| web | `manifest:stage` | 9 | 42.5ms | 36.7ms | -13.6% | 36.7ms | 6.5ms | 9 |
| node | `module:client-only-stub` | 3 | 31.1ms | 121.8ms | +291.6% | 121.8ms | 73.6ms | 3 |
| node | `assets:relocate-ssr-only` | 8 | 2.3ms | 2.1ms | -8.7% | 2.1ms | 0.4ms | 8 |
| web | `manifest:transform` | 3 | 0.3ms | 0.4ms | +33.3% | 0.4ms | 0.2ms | 3 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 624.3ms | 624.8ms | +0.1% | 624.8ms | 9.4ms | 10 |
| node | `route:module` | 1290 | 286.9ms | 335.6ms | +17.0% | 335.6ms | 5.3ms | 10 |
| web | `route:client-entry` | 1290 | 181.4ms | 167.5ms | -7.7% | 167.5ms | 4.9ms | 10 |
| node | `manifest:transform` | 5 | 70.0ms | 76.6ms | +9.4% | 76.6ms | 17.7ms | 5 |
| node | `module:client-only-stub` | 5 | 44.0ms | 15.5ms | -64.8% | 15.5ms | 5.7ms | 5 |
| web | `manifest:stage` | 15 | 13.2ms | 12.5ms | -5.3% | 12.5ms | 1.3ms | 15 |
| node | `assets:relocate-ssr-only` | 10 | 2.5ms | 2.5ms | +0.0% | 2.5ms | 0.4ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1291 | 601.6ms | 592.0ms | -1.6% | 592.0ms | 10.8ms | 11 |
| node | `route:module` | 1290 | 262.3ms | 279.1ms | +6.4% | 279.1ms | 4.5ms | 10 |
| web | `route:client-entry` | 1291 | 167.7ms | 159.6ms | -4.8% | 159.6ms | 4.4ms | 11 |
| node | `manifest:transform` | 5 | 62.9ms | 80.9ms | +28.6% | 80.9ms | 21.8ms | 5 |
| web | `manifest:stage` | 16 | 12.4ms | 13.3ms | +7.3% | 13.3ms | 1.3ms | 16 |
| node | `module:client-only-stub` | 5 | 9.0ms | 10.2ms | +13.3% | 10.2ms | 2.5ms | 5 |
| node | `assets:relocate-ssr-only` | 11 | 2.4ms | 2.2ms | -8.3% | 2.2ms | 0.3ms | 11 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1292 | 598.1ms | 584.3ms | -2.3% | 584.3ms | 13.2ms | 12 |
| node | `route:module` | 1290 | 253.6ms | 261.2ms | +3.0% | 261.2ms | 4.9ms | 10 |
| web | `route:client-entry` | 1292 | 164.4ms | 170.5ms | +3.7% | 170.5ms | 5.2ms | 12 |
| node | `manifest:transform` | 5 | 66.4ms | 79.7ms | +20.0% | 79.7ms | 20.6ms | 5 |
| web | `manifest:stage` | 17 | 13.1ms | 13.8ms | +5.3% | 13.8ms | 1.2ms | 17 |
| node | `module:client-only-stub` | 5 | 13.0ms | 25.7ms | +97.7% | 25.7ms | 12.8ms | 5 |
| node | `assets:relocate-ssr-only` | 12 | 2.3ms | 2.4ms | +4.3% | 2.4ms | 0.4ms | 12 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 250 | 173.0ms | 182.2ms | +5.3% | 182.2ms | 7.1ms | 10 |
| node | `route:module` | 250 | 64.6ms | 65.1ms | +0.8% | 65.1ms | 0.6ms | 10 |
| web | `route:client-entry` | 250 | 38.0ms | 38.4ms | +1.1% | 38.4ms | 1.9ms | 10 |
| node | `module:client-only-stub` | 5 | 32.9ms | 25.2ms | -23.4% | 25.2ms | 6.7ms | 5 |
| node | `manifest:transform` | 5 | 17.9ms | 17.8ms | -0.6% | 17.8ms | 4.5ms | 5 |
| web | `manifest:stage` | 15 | 3.5ms | 3.5ms | 0.0% | 3.5ms | 0.3ms | 15 |
| node | `assets:relocate-ssr-only` | 10 | 2.2ms | 2.1ms | -4.5% | 2.1ms | 0.3ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 122.61s | 121.61s | -0.8% | 122.38s | - | 1.01x | - |
| complex app | 3 | 89.63s | 88.38s | -1.4% | 88.31s | - | 1.01x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 104.57s | 105.00s | +0.4% | 93.58s | 93.64s | 2.91s | 3.03s | 3.37s | 3.39s | +0.6% | 105.20s | - | 1.00x | - |

Profile: `ci-small+ci-large`; mode: `dev`; iterations: `5`; warmup: `1`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29807014498)

