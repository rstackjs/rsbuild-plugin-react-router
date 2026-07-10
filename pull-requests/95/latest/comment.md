<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `04815d0` against base `c9535d8`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 28.48s | 27.73s | -2.6% | 19.01s | 18.94s | -0.4% | 3.80s | 3.61s | -5.2% | 3.19s | 3.08s | -3.4% | 1.03x |
| Large app | 1 | 13.79s | 12.87s | -6.7% | 8.35s | 8.20s | -1.8% | 1.96s | 1.68s | -14.5% | 1.77s | 1.74s | -1.6% | 1.07x |
| Standard fixtures | 6 | 14.69s | 14.87s | +1.2% | 10.67s | 10.75s | +0.8% | 1.84s | 1.93s | +4.7% | 1.42s | 1.34s | -5.6% | 0.99x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 8.67s | 8.73s | +0.6% | 8.79s | 8.97s | 0.99x | 1537 MB |
| `synthetic-1024-ssr-esm` | 3 | 4.30s | 3.60s | -16.4% | 3.60s | 3.86s | 1.20x | 650 MB |
| `synthetic-1024-ssr-esm-split` | 3 | 5.66s | 4.66s | -17.7% | 4.73s | 4.93s | 1.21x | 841 MB |
| `synthetic-256-sourcemaps` | 3 | 1.81s | 2.21s | +21.8% | 2.27s | 2.41s | 0.82x | 430 MB |
| `synthetic-256-ssr-esm` | 3 | 1.61s | 2.09s | +30.2% | 2.12s | 2.19s | 0.77x | 414 MB |
| `synthetic-256-ssr-esm-split` | 3 | 2.00s | 2.52s | +25.7% | 2.57s | 2.69s | 0.80x | 462 MB |
| `synthetic-48-ssr-esm` | 3 | 1.11s | 1.35s | +22.0% | 1.46s | 1.70s | 0.82x | 316 MB |

### ci-small+ci-large Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `ci-small+ci-large` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 13.79s | 12.87s | -6.7% | 8.35s | 8.20s | 1.96s | 1.68s | 1.77s | 1.74s | -1.6% | 12.87s | 12.93s | 1.07x | - |
| `synthetic-1024-ssr-esm` | 3 | 4.71s | 4.20s | -10.7% | 3.40s | 3.04s | 0.60s | 0.53s | 0.48s | 0.43s | -10.3% | 4.21s | 4.23s | 1.12x | - |
| `synthetic-1024-ssr-esm-split` | 3 | 4.58s | 4.27s | -6.8% | 3.28s | 3.07s | 0.55s | 0.51s | 0.53s | 0.43s | -18.9% | 4.33s | 4.55s | 1.07x | - |
| `synthetic-256-sourcemaps` | 3 | 1.73s | 1.96s | +13.6% | 1.31s | 1.49s | 0.20s | 0.23s | 0.13s | 0.15s | +18.7% | 2.02s | 2.16s | 0.88x | - |
| `synthetic-256-ssr-esm` | 3 | 1.46s | 1.78s | +22.1% | 1.06s | 1.26s | 0.19s | 0.26s | 0.11s | 0.13s | +21.9% | 1.78s | 1.79s | 0.82x | - |
| `synthetic-256-ssr-esm-split` | 3 | 1.47s | 1.77s | +20.1% | 1.07s | 1.26s | 0.19s | 0.26s | 0.13s | 0.15s | +18.9% | 1.84s | 2.04s | 0.83x | - |
| `synthetic-48-ssr-esm` | 3 | 0.75s | 0.88s | +18.3% | 0.54s | 0.63s | 0.11s | 0.13s | 0.05s | 0.05s | -1.4% | 0.89s | 0.89s | 0.85x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1071 | 1097.8ms | 980.4ms | -10.7% | 980.4ms | 19.3ms | 6 |
| node | `route:module` | 1071 | 491.1ms | 508.8ms | +3.6% | 508.8ms | 9.0ms | 6 |
| web | `route:client-entry` | 1071 | 226.4ms | 222.6ms | -1.7% | 222.6ms | 4.9ms | 6 |
| node | `manifest:transform` | 3 | 85.8ms | 87.5ms | +2.0% | 87.5ms | 47.3ms | 3 |
| web | `manifest:stage` | 6 | 11.5ms | 8.5ms | -26.1% | 8.5ms | 1.8ms | 6 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1238.8ms | 1189.8ms | -4.0% | 1189.8ms | 9.7ms | 6 |
| node | `route:module` | 3078 | 537.8ms | 546.8ms | +1.7% | 546.8ms | 5.7ms | 6 |
| web | `route:client-entry` | 3078 | 387.2ms | 352.0ms | -9.1% | 352.0ms | 6.3ms | 6 |
| node | `manifest:transform` | 3 | 127.9ms | 107.7ms | -15.8% | 107.7ms | 37.6ms | 3 |
| node | `module:client-only-stub` | 3 | 48.3ms | 306.3ms | +534.2% | 306.3ms | 289.3ms | 3 |
| web | `manifest:stage` | 6 | 30.3ms | 28.2ms | -6.9% | 28.2ms | 7.9ms | 6 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1255.3ms | 1204.9ms | -4.0% | 1204.9ms | 12.4ms | 6 |
| node | `route:module` | 3078 | 567.5ms | 548.0ms | -3.4% | 548.0ms | 5.2ms | 6 |
| web | `route:client-entry` | 3078 | 382.1ms | 318.8ms | -16.6% | 318.8ms | 6.7ms | 6 |
| node | `manifest:transform` | 3 | 137.5ms | 110.7ms | -19.5% | 110.7ms | 38.7ms | 3 |
| node | `module:client-only-stub` | 3 | 66.1ms | 211.5ms | +220.0% | 211.5ms | 119.4ms | 3 |
| web | `manifest:stage` | 6 | 38.1ms | 34.7ms | -8.9% | 34.7ms | 8.1ms | 6 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 774 | 377.2ms | 434.6ms | +15.2% | 434.6ms | 19.9ms | 6 |
| node | `route:module` | 774 | 181.6ms | 201.4ms | +10.9% | 201.4ms | 4.3ms | 6 |
| web | `route:client-entry` | 774 | 94.8ms | 123.4ms | +30.2% | 123.4ms | 6.0ms | 6 |
| node | `module:client-only-stub` | 3 | 91.8ms | 93.3ms | +1.6% | 93.3ms | 66.5ms | 3 |
| node | `manifest:transform` | 3 | 46.0ms | 52.4ms | +13.9% | 52.4ms | 21.2ms | 3 |
| web | `manifest:stage` | 6 | 6.4ms | 6.2ms | -3.1% | 6.2ms | 1.4ms | 6 |
| web | `manifest:transform` | 3 | 0.2ms | 0.3ms | +50.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 775 | 347.7ms | 408.7ms | +17.5% | 408.7ms | 9.5ms | 7 |
| node | `route:module` | 774 | 150.9ms | 165.0ms | +9.3% | 165.0ms | 4.7ms | 6 |
| web | `route:client-entry` | 775 | 93.3ms | 119.5ms | +28.1% | 119.5ms | 4.5ms | 7 |
| node | `module:client-only-stub` | 3 | 76.4ms | 8.3ms | -89.1% | 8.3ms | 3.0ms | 3 |
| node | `manifest:transform` | 3 | 50.1ms | 48.8ms | -2.6% | 48.8ms | 17.1ms | 3 |
| web | `manifest:stage` | 7 | 5.6ms | 6.9ms | +23.2% | 6.9ms | 1.4ms | 7 |
| web | `manifest:transform` | 3 | 0.2ms | 0.3ms | +50.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 774 | 360.7ms | 438.8ms | +21.7% | 438.8ms | 8.1ms | 6 |
| node | `route:module` | 774 | 154.2ms | 166.5ms | +8.0% | 166.5ms | 4.1ms | 6 |
| web | `route:client-entry` | 774 | 96.4ms | 122.1ms | +26.7% | 122.1ms | 6.5ms | 6 |
| node | `module:client-only-stub` | 3 | 42.2ms | 11.8ms | -72.0% | 11.8ms | 7.8ms | 3 |
| node | `manifest:transform` | 3 | 30.7ms | 45.4ms | +47.9% | 45.4ms | 18.8ms | 3 |
| web | `manifest:stage` | 6 | 5.3ms | 6.8ms | +28.3% | 6.8ms | 2.1ms | 6 |
| web | `manifest:transform` | 3 | 0.2ms | 0.3ms | +50.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 150 | 130.4ms | 123.7ms | -5.1% | 123.7ms | 7.5ms | 6 |
| node | `route:module` | 150 | 42.5ms | 45.7ms | +7.5% | 45.7ms | 0.7ms | 6 |
| web | `route:client-entry` | 150 | 28.3ms | 43.6ms | +54.1% | 43.6ms | 4.2ms | 6 |
| node | `module:client-only-stub` | 3 | 23.7ms | 21.4ms | -9.7% | 21.4ms | 11.1ms | 3 |
| node | `manifest:transform` | 3 | 12.8ms | 15.0ms | +17.2% | 15.0ms | 5.9ms | 3 |
| web | `manifest:stage` | 6 | 1.2ms | 1.7ms | +41.7% | 1.7ms | 0.4ms | 6 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 120.39s | 112.57s | -6.5% | 111.73s | - | 1.07x | - |
| complex app | 3 | 82.08s | 83.26s | +1.4% | 82.91s | - | 0.99x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 106.86s | 98.25s | -8.1% | 97.32s | 90.02s | 3.08s | 2.65s | 3.68s | 3.27s | -11.0% | 97.51s | - | 1.09x | - |

Profile: `ci-small+ci-large`; mode: `dev`; iterations: `3`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29130573400)

