<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `3e9180b` against base `7bb55da`.

### Reading benchmark confidence

Raw deltas are always shown. The signal label only indicates whether the observed median delta is larger than a robust run-to-run noise band; it does not erase or replace the measurement.

The noise band is the larger of 2% or two combined robust standard deviations estimated from each side's relative median absolute deviation (rMAD). Fewer than three finite samples is reported as insufficient data. An inconclusive result should be rerun or investigated from the uploaded raw samples before drawing a performance conclusion.

| Benchmark | Runs | Base total | Head total | Delta | Base rMAD | Head rMAD | Noise band | Signal |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| `large-355-ssr-esm (build)` | 3 | 8.34s | 8.29s | -0.5% | 0.0% | 0.0% | ±2.0% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm (build)` | 3 | 3.90s | 3.81s | -2.4% | 0.8% | 0.7% | ±3.2% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (build)` | 3 | 5.25s | 5.54s | +5.4% | 0.8% | 0.6% | ±2.9% | 🔴 regression |
| `synthetic-256-sourcemaps (build)` | 5 | 2.21s | 2.17s | -1.4% | 1.1% | 0.6% | ±3.8% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (build)` | 5 | 2.08s | 2.03s | -2.4% | 0.5% | 0.2% | ±2.0% | 🟢 improvement |
| `synthetic-256-ssr-esm-split (build)` | 5 | 2.47s | 2.52s | +2.0% | 0.2% | 1.1% | ±3.3% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (build)` | 5 | 1.34s | 1.32s | -1.7% | 0.8% | 0.5% | ±2.8% | ⚪ inconclusive |
| `large-355-ssr-esm (dev)` | 3 | 14.89s | 14.92s | +0.3% | 0.3% | 0.3% | ±2.0% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm (dev)` | 3 | 4.56s | 4.41s | -3.3% | 3.3% | 0.5% | ±10.0% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (dev)` | 3 | 4.61s | 4.51s | -2.2% | 1.1% | 1.7% | ±6.0% | ⚪ inconclusive |
| `synthetic-256-sourcemaps (dev)` | 5 | 2.09s | 2.02s | -3.2% | 2.0% | 1.1% | ±6.8% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (dev)` | 5 | 1.84s | 1.78s | -2.8% | 2.2% | 2.1% | ±9.1% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (dev)` | 5 | 1.90s | 1.80s | -5.3% | 0.3% | 1.9% | ±5.8% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (dev)` | 5 | 0.95s | 0.91s | -4.0% | 0.5% | 1.9% | ±5.8% | ⚪ inconclusive |
| `complex app (cold)` | 3 | 95.25s | 103.47s | +8.6% | 1.4% | 3.9% | ±12.4% | ⚪ inconclusive |
| `complex app (dev)` | 3 | 86.10s | 87.23s | +1.3% | 0.2% | 0.5% | ±2.0% | ⚪ inconclusive |
| `complex app (warm)` | 3 | 66.62s | 69.25s | +4.0% | 0.2% | 0.9% | ±2.9% | 🔴 regression |

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 30.83s | 30.36s | -1.5% | 18.89s | 18.68s | -1.1% | 3.78s | 3.85s | +1.7% | 2.81s | 2.78s | -1.0% | 1.02x |
| Large app | 1 | 14.89s | 14.92s | +0.3% | 8.02s | 7.99s | -0.3% | 1.81s | 1.87s | +3.3% | 1.67s | 1.69s | +1.4% | 1.00x |
| Standard fixtures | 6 | 15.95s | 15.44s | -3.2% | 10.87s | 10.68s | -1.7% | 1.98s | 1.98s | +0.1% | 1.14s | 1.09s | -4.6% | 1.03x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 8.34s | 8.29s | -0.5% | 8.27s | 8.29s | 1.01x | 1493 MB |
| `synthetic-1024-ssr-esm` | 3 | 3.90s | 3.81s | -2.4% | 3.82s | 3.87s | 1.02x | 629 MB |
| `synthetic-1024-ssr-esm-split` | 3 | 5.25s | 5.54s | +5.4% | 5.54s | 5.58s | 0.95x | 857 MB |
| `synthetic-256-sourcemaps` | 5 | 2.21s | 2.17s | -1.4% | 2.18s | 2.21s | 1.01x | 436 MB |
| `synthetic-256-ssr-esm` | 5 | 2.08s | 2.03s | -2.4% | 2.03s | 2.04s | 1.03x | 416 MB |
| `synthetic-256-ssr-esm-split` | 5 | 2.47s | 2.52s | +2.0% | 2.54s | 2.57s | 0.98x | 458 MB |
| `synthetic-48-ssr-esm` | 5 | 1.34s | 1.32s | -1.7% | 1.32s | 1.34s | 1.02x | 291 MB |

### ci-small+ci-large Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `ci-small+ci-large` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 14.89s | 14.92s | +0.3% | 8.02s | 7.99s | 1.81s | 1.87s | 1.67s | 1.69s | +1.4% | 14.91s | 14.96s | 1.00x | - |
| `synthetic-1024-ssr-esm` | 3 | 4.56s | 4.41s | -3.3% | 3.10s | 3.01s | 0.56s | 0.56s | 0.33s | 0.33s | +0.2% | 4.44s | 4.54s | 1.03x | - |
| `synthetic-1024-ssr-esm-split` | 3 | 4.61s | 4.51s | -2.2% | 3.14s | 3.13s | 0.56s | 0.56s | 0.35s | 0.33s | -7.6% | 4.57s | 4.75s | 1.02x | - |
| `synthetic-256-sourcemaps` | 5 | 2.09s | 2.02s | -3.2% | 1.46s | 1.45s | 0.25s | 0.25s | 0.15s | 0.13s | -15.9% | 2.05s | 2.12s | 1.03x | - |
| `synthetic-256-ssr-esm` | 5 | 1.84s | 1.78s | -2.8% | 1.24s | 1.24s | 0.24s | 0.24s | 0.13s | 0.13s | -0.1% | 1.80s | 1.86s | 1.03x | - |
| `synthetic-256-ssr-esm-split` | 5 | 1.90s | 1.80s | -5.3% | 1.27s | 1.23s | 0.24s | 0.24s | 0.13s | 0.13s | -1.1% | 1.81s | 1.94s | 1.06x | - |
| `synthetic-48-ssr-esm` | 5 | 0.95s | 0.91s | -4.0% | 0.65s | 0.62s | 0.12s | 0.13s | 0.05s | 0.05s | +0.1% | 0.92s | 0.94s | 1.04x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1071 | 1046.0ms | 1081.6ms | +3.4% | 1081.6ms | 22.0ms | 6 |
| node | `route:module` | 1071 | 524.9ms | 512.2ms | -2.4% | 512.2ms | 6.4ms | 6 |
| web | `route:client-entry` | 1071 | 263.6ms | 245.4ms | -6.9% | 245.4ms | 5.5ms | 6 |
| node | `manifest:transform` | 3 | 63.3ms | 64.5ms | +1.9% | 64.5ms | 23.8ms | 3 |
| web | `manifest:stage` | 9 | 11.7ms | 12.1ms | +3.4% | 12.1ms | 1.9ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1259.1ms | 1235.7ms | -1.9% | 1235.7ms | 15.0ms | 6 |
| node | `route:module` | 3078 | 547.9ms | 578.2ms | +5.5% | 578.2ms | 7.1ms | 6 |
| web | `route:client-entry` | 3078 | 370.9ms | 371.3ms | +0.1% | 371.3ms | 7.4ms | 6 |
| node | `manifest:transform` | 3 | 125.6ms | 142.8ms | +13.7% | 142.8ms | 62.0ms | 3 |
| node | `module:client-only-stub` | 3 | 94.5ms | 71.0ms | -24.9% | 71.0ms | 47.8ms | 3 |
| web | `manifest:stage` | 9 | 44.5ms | 37.8ms | -15.1% | 37.8ms | 7.3ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1271.0ms | 1200.3ms | -5.6% | 1200.3ms | 18.8ms | 6 |
| node | `route:module` | 3078 | 563.6ms | 607.6ms | +7.8% | 607.6ms | 10.9ms | 6 |
| web | `route:client-entry` | 3078 | 385.4ms | 388.4ms | +0.8% | 388.4ms | 15.4ms | 6 |
| node | `manifest:transform` | 3 | 118.8ms | 112.6ms | -5.2% | 112.6ms | 38.0ms | 3 |
| node | `module:client-only-stub` | 3 | 58.5ms | 72.4ms | +23.8% | 72.4ms | 41.4ms | 3 |
| web | `manifest:stage` | 9 | 43.2ms | 37.7ms | -12.7% | 37.7ms | 7.3ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1291 | 714.1ms | 725.2ms | +1.6% | 725.2ms | 18.8ms | 11 |
| node | `route:module` | 1290 | 308.2ms | 301.3ms | -2.2% | 301.3ms | 4.4ms | 10 |
| web | `route:client-entry` | 1291 | 200.9ms | 205.4ms | +2.2% | 205.4ms | 5.3ms | 11 |
| node | `module:client-only-stub` | 5 | 143.8ms | 142.2ms | -1.1% | 142.2ms | 57.5ms | 5 |
| node | `manifest:transform` | 5 | 69.7ms | 83.3ms | +19.5% | 83.3ms | 20.6ms | 5 |
| web | `manifest:stage` | 16 | 17.8ms | 14.6ms | -18.0% | 14.6ms | 1.3ms | 16 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 669.7ms | 742.9ms | +10.9% | 742.9ms | 20.2ms | 10 |
| node | `route:module` | 1290 | 269.8ms | 272.9ms | +1.1% | 272.9ms | 4.4ms | 10 |
| web | `route:client-entry` | 1290 | 196.1ms | 200.1ms | +2.0% | 200.1ms | 5.0ms | 10 |
| node | `manifest:transform` | 5 | 77.2ms | 77.6ms | +0.5% | 77.6ms | 19.6ms | 5 |
| node | `module:client-only-stub` | 5 | 69.6ms | 31.8ms | -54.3% | 31.8ms | 17.7ms | 5 |
| web | `manifest:stage` | 15 | 15.2ms | 14.0ms | -7.9% | 14.0ms | 1.3ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1291 | 666.1ms | 723.9ms | +8.7% | 723.9ms | 19.3ms | 11 |
| node | `route:module` | 1290 | 275.7ms | 275.8ms | +0.0% | 275.8ms | 4.0ms | 10 |
| web | `route:client-entry` | 1291 | 202.5ms | 206.6ms | +2.0% | 206.6ms | 4.9ms | 11 |
| node | `manifest:transform` | 5 | 72.5ms | 88.6ms | +22.2% | 88.6ms | 22.3ms | 5 |
| node | `module:client-only-stub` | 5 | 16.7ms | 18.7ms | +12.0% | 18.7ms | 7.6ms | 5 |
| web | `manifest:stage` | 16 | 14.8ms | 14.4ms | -2.7% | 14.4ms | 1.3ms | 16 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 250 | 233.5ms | 209.6ms | -10.2% | 209.6ms | 9.8ms | 10 |
| node | `route:module` | 250 | 86.6ms | 81.7ms | -5.7% | 81.7ms | 4.4ms | 10 |
| web | `route:client-entry` | 250 | 58.3ms | 59.8ms | +2.6% | 59.8ms | 3.6ms | 10 |
| node | `module:client-only-stub` | 5 | 40.6ms | 47.4ms | +16.7% | 47.4ms | 12.3ms | 5 |
| node | `manifest:transform` | 5 | 23.7ms | 24.9ms | +5.1% | 24.9ms | 6.0ms | 5 |
| web | `manifest:stage` | 15 | 3.7ms | 3.9ms | +5.4% | 3.9ms | 0.4ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 95.25s | 103.47s | +8.6% | 102.46s | - | 0.92x | - |
| complex app | 3 | 66.62s | 69.25s | +4.0% | 70.95s | - | 0.96x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 86.10s | 87.23s | +1.3% | 76.50s | 77.16s | 2.15s | 2.18s | 3.86s | 3.82s | -1.0% | 87.52s | - | 0.99x | - |

Profile: `ci-small+ci-large`; mode: `dev`; iterations: `5`; warmup: `1`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29136501316)

