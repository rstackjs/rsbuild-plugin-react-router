<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `0dcfc93` against base `7bb55da`.

### Reading benchmark confidence

Raw deltas are always shown. The signal label only indicates whether the observed median delta is larger than a robust run-to-run noise band; it does not erase or replace the measurement.

The noise band is the larger of 2% or two combined robust standard deviations estimated from each side's relative median absolute deviation (rMAD). Fewer than three finite samples is reported as insufficient data. An inconclusive result should be rerun or investigated from the uploaded raw samples before drawing a performance conclusion.

| Benchmark | Runs | Base total | Head total | Delta | Base rMAD | Head rMAD | Noise band | Signal |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| `large-355-ssr-esm (build)` | 3 | 9.05s | 8.76s | -3.2% | 0.4% | 0.3% | ±2.0% | 🟢 improvement |
| `synthetic-1024-ssr-esm (build)` | 3 | 4.28s | 4.27s | -0.3% | 1.1% | 0.3% | ±3.5% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (build)` | 3 | 5.77s | 5.73s | -0.8% | 1.0% | 0.0% | ±3.1% | ⚪ inconclusive |
| `synthetic-256-sourcemaps (build)` | 5 | 2.22s | 2.18s | -1.6% | 1.8% | 0.2% | ±5.3% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (build)` | 5 | 2.05s | 2.03s | -0.7% | 0.6% | 1.0% | ±3.5% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (build)` | 5 | 2.43s | 2.46s | +0.9% | 0.9% | 0.4% | ±3.0% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (build)` | 5 | 1.36s | 1.32s | -2.8% | 0.3% | 0.7% | ±2.3% | 🟢 improvement |
| `large-355-ssr-esm (dev)` | 3 | 15.91s | 16.71s | +5.1% | 1.8% | 0.2% | ±5.5% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm (dev)` | 3 | 5.25s | 4.80s | -8.5% | 5.3% | 1.4% | ±16.2% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (dev)` | 3 | 4.94s | 4.78s | -3.4% | 0.5% | 0.4% | ±2.0% | 🟢 improvement |
| `synthetic-256-sourcemaps (dev)` | 5 | 2.04s | 2.12s | +3.8% | 0.6% | 0.9% | ±3.2% | 🔴 regression |
| `synthetic-256-ssr-esm (dev)` | 5 | 1.82s | 1.81s | -0.1% | 0.7% | 2.1% | ±6.6% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (dev)` | 5 | 1.79s | 1.77s | -1.3% | 0.2% | 2.8% | ±8.2% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (dev)` | 5 | 0.94s | 0.92s | -1.7% | 1.4% | 0.2% | ±4.3% | ⚪ inconclusive |
| `complex app (cold)` | 3 | 96.12s | 115.86s | +20.5% | 1.1% | 0.5% | ±3.5% | 🔴 regression |
| `complex app (dev)` | 3 | 88.52s | 85.66s | -3.2% | 1.9% | 0.5% | ±5.8% | ⚪ inconclusive |
| `complex app (warm)` | 3 | 68.51s | 72.00s | +5.1% | 0.6% | 2.6% | ±7.9% | ⚪ inconclusive |

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 32.68s | 32.91s | +0.7% | 19.89s | 19.42s | -2.3% | 4.11s | 4.01s | -2.6% | 3.02s | 2.86s | -5.3% | 0.99x |
| Large app | 1 | 15.91s | 16.71s | +5.1% | 8.44s | 8.29s | -1.8% | 2.04s | 1.97s | -3.5% | 1.77s | 1.72s | -3.0% | 0.95x |
| Standard fixtures | 6 | 16.77s | 16.19s | -3.5% | 11.44s | 11.13s | -2.7% | 2.07s | 2.04s | -1.7% | 1.24s | 1.14s | -8.5% | 1.04x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 | Head client JS gzip | Client JS gzip delta | Head total gzip |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 9.05s | 8.76s | -3.2% | 8.77s | 8.80s | 1.03x | 1491 MB | 5.0 MB | +0.2% | 14.8 MB |
| `synthetic-1024-ssr-esm` | 3 | 4.28s | 4.27s | -0.3% | 4.24s | 4.28s | 1.00x | 620 MB | 626.1 kB | -4.1% | 1.4 MB |
| `synthetic-1024-ssr-esm-split` | 3 | 5.77s | 5.73s | -0.8% | 5.71s | 5.73s | 1.01x | 824 MB | 927.8 kB | -2.5% | 1.7 MB |
| `synthetic-256-sourcemaps` | 5 | 2.22s | 2.18s | -1.6% | 2.17s | 2.19s | 1.02x | 437 MB | 228.7 kB | -2.9% | 1.4 MB |
| `synthetic-256-ssr-esm` | 5 | 2.05s | 2.03s | -0.7% | 2.03s | 2.06s | 1.01x | 412 MB | 228.7 kB | -2.9% | 918.8 kB |
| `synthetic-256-ssr-esm-split` | 5 | 2.43s | 2.46s | +0.9% | 2.45s | 2.47s | 0.99x | 441 MB | 305.6 kB | -1.9% | 998.3 kB |
| `synthetic-48-ssr-esm` | 5 | 1.36s | 1.32s | -2.8% | 1.32s | 1.33s | 1.03x | 301 MB | 121.9 kB | -1.1% | 763.9 kB |

### ci-small+ci-large Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `ci-small+ci-large` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 15.91s | 16.71s | +5.1% | 8.44s | 8.29s | 2.04s | 1.97s | 1.77s | 1.72s | -3.0% | 16.33s | 16.75s | 0.95x | - |
| `synthetic-1024-ssr-esm` | 3 | 5.25s | 4.80s | -8.5% | 3.46s | 3.30s | 0.61s | 0.58s | 0.38s | 0.35s | -7.6% | 4.77s | 4.87s | 1.09x | - |
| `synthetic-1024-ssr-esm-split` | 3 | 4.94s | 4.78s | -3.4% | 3.39s | 3.30s | 0.61s | 0.60s | 0.38s | 0.35s | -7.5% | 4.78s | 4.79s | 1.03x | - |
| `synthetic-256-sourcemaps` | 5 | 2.04s | 2.12s | +3.8% | 1.46s | 1.46s | 0.25s | 0.24s | 0.15s | 0.13s | -15.7% | 2.08s | 2.13s | 0.96x | - |
| `synthetic-256-ssr-esm` | 5 | 1.82s | 1.81s | -0.1% | 1.25s | 1.24s | 0.25s | 0.25s | 0.13s | 0.13s | +0.4% | 1.82s | 1.86s | 1.00x | - |
| `synthetic-256-ssr-esm-split` | 5 | 1.79s | 1.77s | -1.3% | 1.24s | 1.21s | 0.23s | 0.24s | 0.15s | 0.13s | -16.6% | 1.79s | 1.84s | 1.01x | - |
| `synthetic-48-ssr-esm` | 5 | 0.94s | 0.92s | -1.7% | 0.65s | 0.63s | 0.12s | 0.12s | 0.05s | 0.05s | -0.0% | 0.92s | 0.94s | 1.02x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1071 | 1144.9ms | 1030.4ms | -10.0% | 1030.4ms | 28.5ms | 6 |
| node | `route:module` | 1071 | 576.3ms | 606.3ms | +5.2% | 606.3ms | 18.4ms | 6 |
| web | `route:client-entry` | 1071 | 286.6ms | 268.9ms | -6.2% | 268.9ms | 5.1ms | 6 |
| node | `manifest:transform` | 3 | 75.3ms | 56.6ms | -24.8% | 56.6ms | 20.2ms | 3 |
| web | `manifest:stage` | 9 | 11.6ms | 11.7ms | +0.9% | 11.7ms | 1.9ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1312.2ms | 1257.3ms | -4.2% | 1257.3ms | 13.7ms | 6 |
| node | `route:module` | 3078 | 557.4ms | 566.2ms | +1.6% | 566.2ms | 6.3ms | 6 |
| web | `route:client-entry` | 3078 | 388.6ms | 420.8ms | +8.3% | 420.8ms | 7.6ms | 6 |
| node | `module:client-only-stub` | 3 | 153.3ms | 105.6ms | -31.1% | 105.6ms | 50.3ms | 3 |
| node | `manifest:transform` | 3 | 132.9ms | 125.8ms | -5.3% | 125.8ms | 43.3ms | 3 |
| web | `manifest:stage` | 9 | 45.9ms | 42.1ms | -8.3% | 42.1ms | 8.1ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1258.6ms | 1255.8ms | -0.2% | 1255.8ms | 25.0ms | 6 |
| node | `route:module` | 3078 | 585.5ms | 593.9ms | +1.4% | 593.9ms | 8.3ms | 6 |
| node | `module:client-only-stub` | 3 | 453.7ms | 263.2ms | -42.0% | 263.2ms | 216.5ms | 3 |
| web | `route:client-entry` | 3078 | 399.9ms | 408.2ms | +2.1% | 408.2ms | 8.2ms | 6 |
| node | `manifest:transform` | 3 | 126.9ms | 125.8ms | -0.9% | 125.8ms | 43.6ms | 3 |
| web | `manifest:stage` | 9 | 43.2ms | 39.4ms | -8.8% | 39.4ms | 8.1ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1291 | 715.0ms | 737.6ms | +3.2% | 737.6ms | 23.8ms | 11 |
| node | `route:module` | 1290 | 312.7ms | 291.0ms | -6.9% | 291.0ms | 4.3ms | 10 |
| web | `route:client-entry` | 1291 | 212.4ms | 205.4ms | -3.3% | 205.4ms | 5.0ms | 11 |
| node | `module:client-only-stub` | 5 | 111.9ms | 59.6ms | -46.7% | 59.6ms | 18.7ms | 5 |
| node | `manifest:transform` | 5 | 76.3ms | 82.8ms | +8.5% | 82.8ms | 20.2ms | 5 |
| web | `manifest:stage` | 18 | 15.7ms | 15.9ms | +1.3% | 15.9ms | 1.3ms | 18 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 704.1ms | 713.9ms | +1.4% | 713.9ms | 21.1ms | 10 |
| node | `route:module` | 1290 | 273.9ms | 266.5ms | -2.7% | 266.5ms | 4.0ms | 10 |
| web | `route:client-entry` | 1290 | 201.8ms | 195.9ms | -2.9% | 195.9ms | 4.8ms | 10 |
| node | `manifest:transform` | 5 | 103.1ms | 79.2ms | -23.2% | 79.2ms | 20.5ms | 5 |
| node | `module:client-only-stub` | 5 | 70.1ms | 38.4ms | -45.2% | 38.4ms | 13.2ms | 5 |
| web | `manifest:stage` | 15 | 14.7ms | 14.2ms | -3.4% | 14.2ms | 1.4ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1291 | 683.4ms | 721.9ms | +5.6% | 721.9ms | 23.7ms | 11 |
| node | `route:module` | 1290 | 276.9ms | 281.9ms | +1.8% | 281.9ms | 4.4ms | 10 |
| web | `route:client-entry` | 1291 | 206.6ms | 194.6ms | -5.8% | 194.6ms | 4.8ms | 11 |
| node | `module:client-only-stub` | 5 | 97.0ms | 103.5ms | +6.7% | 103.5ms | 49.3ms | 5 |
| node | `manifest:transform` | 5 | 84.0ms | 73.1ms | -13.0% | 73.1ms | 15.2ms | 5 |
| web | `manifest:stage` | 16 | 14.8ms | 14.7ms | -0.7% | 14.7ms | 1.4ms | 16 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 250 | 233.3ms | 216.8ms | -7.1% | 216.8ms | 9.9ms | 10 |
| node | `route:module` | 250 | 87.5ms | 77.0ms | -12.0% | 77.0ms | 0.7ms | 10 |
| web | `route:client-entry` | 250 | 57.5ms | 60.6ms | +5.4% | 60.6ms | 3.6ms | 10 |
| node | `module:client-only-stub` | 5 | 34.7ms | 43.3ms | +24.8% | 43.3ms | 13.3ms | 5 |
| node | `manifest:transform` | 5 | 22.3ms | 28.4ms | +27.4% | 28.4ms | 6.3ms | 5 |
| web | `manifest:stage` | 15 | 3.9ms | 3.8ms | -2.6% | 3.8ms | 0.4ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 | Head client JS gzip | Client JS gzip delta | Head total gzip |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 96.12s | 115.86s | +20.5% | 114.91s | - | 0.83x | - | - | - | - |
| complex app | 3 | 68.51s | 72.00s | +5.1% | 72.11s | - | 0.95x | - | - | - | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 88.52s | 85.66s | -3.2% | 78.35s | 75.83s | 2.12s | 2.16s | 4.54s | 3.73s | -18.0% | 85.65s | - | 1.03x | - |

Profile: `ci-small+ci-large`; mode: `dev`; iterations: `5`; warmup: `1`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29136158507)

