<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `a24fbae` against base `7bb55da`.

### Reading benchmark confidence

Raw deltas are always shown. The signal label only indicates whether the observed median delta is larger than a robust run-to-run noise band; it does not erase or replace the measurement.

The noise band is the larger of 2% or two combined robust standard deviations estimated from each side's relative median absolute deviation (rMAD). Fewer than three finite samples is reported as insufficient data. An inconclusive result should be rerun or investigated from the uploaded raw samples before drawing a performance conclusion.

| Benchmark | Runs | Base total | Head total | Delta | Base rMAD | Head rMAD | Noise band | Signal |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| `large-355-ssr-esm (build)` | 3 | 8.35s | 8.52s | +2.0% | 0.1% | 0.2% | ±2.0% | 🔴 regression |
| `synthetic-1024-ssr-esm (build)` | 3 | 3.78s | 3.82s | +1.1% | 0.6% | 0.9% | ±3.0% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (build)` | 3 | 5.04s | 5.14s | +2.1% | 0.4% | 0.0% | ±2.0% | 🔴 regression |
| `synthetic-256-sourcemaps (build)` | 5 | 2.19s | 2.16s | -1.5% | 0.5% | 1.0% | ±3.3% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (build)` | 5 | 2.06s | 2.02s | -2.0% | 0.8% | 0.3% | ±2.4% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (build)` | 5 | 2.42s | 2.43s | +0.5% | 0.6% | 0.6% | ±2.5% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (build)` | 5 | 1.32s | 1.30s | -1.6% | 0.3% | 0.7% | ±2.3% | ⚪ inconclusive |
| `large-355-ssr-esm (dev)` | 3 | 14.97s | 14.79s | -1.2% | 0.3% | 0.0% | ±2.0% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm (dev)` | 3 | 4.66s | 4.45s | -4.7% | 0.5% | 0.2% | ±2.0% | 🟢 improvement |
| `synthetic-1024-ssr-esm-split (dev)` | 3 | 4.47s | 4.39s | -1.7% | 0.1% | 0.7% | ±2.1% | ⚪ inconclusive |
| `synthetic-256-sourcemaps (dev)` | 5 | 2.07s | 2.02s | -2.5% | 1.1% | 0.3% | ±3.4% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (dev)` | 5 | 1.81s | 1.83s | +0.8% | 0.8% | 1.4% | ±4.9% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (dev)` | 5 | 1.83s | 1.78s | -2.8% | 1.0% | 1.2% | ±4.7% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (dev)` | 5 | 0.94s | 0.91s | -3.7% | 0.4% | 0.5% | ±2.0% | 🟢 improvement |
| `complex app (cold)` | 3 | 118.77s | 112.19s | -5.5% | 0.9% | 0.7% | ±3.2% | 🟢 improvement |
| `complex app (dev)` | 3 | 100.22s | 107.69s | +7.5% | 0.9% | 0.4% | ±2.9% | 🔴 regression |
| `complex app (warm)` | 3 | 84.82s | 82.43s | -2.8% | 2.9% | 2.8% | ±12.0% | ⚪ inconclusive |

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 30.77s | 30.16s | -2.0% | 18.61s | 18.52s | -0.5% | 3.88s | 3.82s | -1.6% | 2.87s | 2.83s | -1.3% | 1.02x |
| Large app | 1 | 14.97s | 14.79s | -1.2% | 7.90s | 7.91s | +0.1% | 1.89s | 1.84s | -2.8% | 1.70s | 1.74s | +2.4% | 1.01x |
| Standard fixtures | 6 | 15.79s | 15.37s | -2.7% | 10.71s | 10.61s | -0.9% | 1.99s | 1.98s | -0.4% | 1.17s | 1.09s | -6.8% | 1.03x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 8.35s | 8.52s | +2.0% | 8.54s | 8.59s | 0.98x | 1494 MB |
| `synthetic-1024-ssr-esm` | 3 | 3.78s | 3.82s | +1.1% | 3.84s | 3.91s | 0.99x | 645 MB |
| `synthetic-1024-ssr-esm-split` | 3 | 5.04s | 5.14s | +2.1% | 5.15s | 5.16s | 0.98x | 815 MB |
| `synthetic-256-sourcemaps` | 5 | 2.19s | 2.16s | -1.5% | 2.15s | 2.18s | 1.02x | 431 MB |
| `synthetic-256-ssr-esm` | 5 | 2.06s | 2.02s | -2.0% | 2.03s | 2.06s | 1.02x | 422 MB |
| `synthetic-256-ssr-esm-split` | 5 | 2.42s | 2.43s | +0.5% | 2.43s | 2.47s | 1.00x | 438 MB |
| `synthetic-48-ssr-esm` | 5 | 1.32s | 1.30s | -1.6% | 1.30s | 1.31s | 1.02x | 297 MB |

### ci-small+ci-large Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `ci-small+ci-large` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 14.97s | 14.79s | -1.2% | 7.90s | 7.91s | 1.89s | 1.84s | 1.70s | 1.74s | +2.4% | 14.82s | 14.88s | 1.01x | - |
| `synthetic-1024-ssr-esm` | 3 | 4.66s | 4.45s | -4.7% | 3.08s | 3.09s | 0.53s | 0.56s | 0.38s | 0.33s | -13.4% | 4.53s | 4.70s | 1.05x | - |
| `synthetic-1024-ssr-esm-split` | 3 | 4.47s | 4.39s | -1.7% | 3.06s | 3.04s | 0.58s | 0.55s | 0.33s | 0.33s | -0.3% | 4.40s | 4.43s | 1.02x | - |
| `synthetic-256-sourcemaps` | 5 | 2.07s | 2.02s | -2.5% | 1.46s | 1.45s | 0.25s | 0.25s | 0.13s | 0.13s | +0.1% | 2.04s | 2.13s | 1.03x | - |
| `synthetic-256-ssr-esm` | 5 | 1.81s | 1.83s | +0.8% | 1.25s | 1.22s | 0.25s | 0.25s | 0.13s | 0.13s | -0.8% | 1.82s | 1.85s | 0.99x | - |
| `synthetic-256-ssr-esm-split` | 5 | 1.83s | 1.78s | -2.8% | 1.24s | 1.20s | 0.24s | 0.25s | 0.15s | 0.13s | -17.0% | 1.80s | 1.84s | 1.03x | - |
| `synthetic-48-ssr-esm` | 5 | 0.94s | 0.91s | -3.7% | 0.63s | 0.61s | 0.13s | 0.13s | 0.05s | 0.05s | -2.1% | 0.91s | 0.93s | 1.04x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1071 | 1051.5ms | 1103.0ms | +4.9% | 1103.0ms | 12.5ms | 6 |
| node | `route:module` | 1071 | 494.7ms | 492.0ms | -0.5% | 492.0ms | 12.7ms | 6 |
| web | `route:client-entry` | 1071 | 259.5ms | 225.1ms | -13.3% | 225.1ms | 5.4ms | 6 |
| node | `manifest:transform` | 3 | 64.1ms | 65.3ms | +1.9% | 65.3ms | 26.6ms | 3 |
| web | `manifest:stage` | 9 | 12.3ms | 12.2ms | -0.8% | 12.2ms | 1.9ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1210.4ms | 1256.0ms | +3.8% | 1256.0ms | 21.5ms | 6 |
| node | `route:module` | 3078 | 545.4ms | 584.8ms | +7.2% | 584.8ms | 6.2ms | 6 |
| web | `route:client-entry` | 3078 | 344.6ms | 354.2ms | +2.8% | 354.2ms | 5.9ms | 6 |
| node | `manifest:transform` | 3 | 112.7ms | 116.3ms | +3.2% | 116.3ms | 42.9ms | 3 |
| node | `module:client-only-stub` | 3 | 59.7ms | 71.0ms | +18.9% | 71.0ms | 25.4ms | 3 |
| web | `manifest:stage` | 9 | 49.1ms | 41.7ms | -15.1% | 41.7ms | 9.3ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1282.6ms | 1233.8ms | -3.8% | 1233.8ms | 34.3ms | 6 |
| node | `route:module` | 3078 | 553.4ms | 572.2ms | +3.4% | 572.2ms | 6.5ms | 6 |
| web | `route:client-entry` | 3078 | 357.7ms | 340.1ms | -4.9% | 340.1ms | 5.8ms | 6 |
| node | `manifest:transform` | 3 | 119.8ms | 125.9ms | +5.1% | 125.9ms | 44.7ms | 3 |
| node | `module:client-only-stub` | 3 | 101.0ms | 96.3ms | -4.7% | 96.3ms | 49.4ms | 3 |
| web | `manifest:stage` | 9 | 44.1ms | 40.5ms | -8.2% | 40.5ms | 9.3ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1291 | 720.6ms | 787.6ms | +9.3% | 787.6ms | 24.4ms | 11 |
| node | `route:module` | 1290 | 316.4ms | 316.4ms | 0.0% | 316.4ms | 4.2ms | 10 |
| web | `route:client-entry` | 1291 | 207.8ms | 204.6ms | -1.5% | 204.6ms | 5.3ms | 11 |
| node | `module:client-only-stub` | 5 | 140.1ms | 150.3ms | +7.3% | 150.3ms | 73.5ms | 5 |
| node | `manifest:transform` | 5 | 89.4ms | 82.3ms | -7.9% | 82.3ms | 19.9ms | 5 |
| web | `manifest:stage` | 16 | 16.5ms | 16.9ms | +2.4% | 16.9ms | 3.1ms | 16 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 678.0ms | 692.3ms | +2.1% | 692.3ms | 11.2ms | 10 |
| node | `route:module` | 1290 | 266.2ms | 278.3ms | +4.5% | 278.3ms | 5.7ms | 10 |
| web | `route:client-entry` | 1290 | 196.7ms | 194.6ms | -1.1% | 194.6ms | 3.7ms | 10 |
| node | `module:client-only-stub` | 5 | 120.6ms | 33.5ms | -72.2% | 33.5ms | 17.4ms | 5 |
| node | `manifest:transform` | 5 | 79.7ms | 77.0ms | -3.4% | 77.0ms | 21.1ms | 5 |
| web | `manifest:stage` | 15 | 14.1ms | 14.3ms | +1.4% | 14.3ms | 1.4ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1291 | 689.9ms | 701.8ms | +1.7% | 701.8ms | 20.9ms | 11 |
| node | `route:module` | 1290 | 287.5ms | 277.3ms | -3.5% | 277.3ms | 5.4ms | 10 |
| web | `route:client-entry` | 1291 | 198.8ms | 204.2ms | +2.7% | 204.2ms | 3.7ms | 11 |
| node | `module:client-only-stub` | 5 | 106.6ms | 132.2ms | +24.0% | 132.2ms | 69.1ms | 5 |
| node | `manifest:transform` | 5 | 84.6ms | 86.2ms | +1.9% | 86.2ms | 20.2ms | 5 |
| web | `manifest:stage` | 16 | 14.4ms | 14.7ms | +2.1% | 14.7ms | 1.4ms | 16 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 250 | 247.1ms | 236.0ms | -4.5% | 236.0ms | 12.1ms | 10 |
| node | `route:module` | 250 | 76.2ms | 84.0ms | +10.2% | 84.0ms | 4.2ms | 10 |
| web | `route:client-entry` | 250 | 59.1ms | 66.7ms | +12.9% | 66.7ms | 3.9ms | 10 |
| node | `module:client-only-stub` | 5 | 50.6ms | 46.3ms | -8.5% | 46.3ms | 14.6ms | 5 |
| node | `manifest:transform` | 5 | 28.0ms | 33.4ms | +19.3% | 33.4ms | 11.9ms | 5 |
| web | `manifest:stage` | 15 | 3.7ms | 3.7ms | +0.0% | 3.7ms | 0.4ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 118.77s | 112.19s | -5.5% | 113.34s | - | 1.06x | - |
| complex app | 3 | 84.82s | 82.43s | -2.8% | 83.37s | - | 1.03x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 100.22s | 107.69s | +7.5% | 88.95s | 94.08s | 2.89s | 3.09s | 3.44s | 3.61s | +4.9% | 107.20s | - | 0.93x | - |

Profile: `ci-small+ci-large`; mode: `dev`; iterations: `5`; warmup: `1`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29285357456)

