<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `de023ad` against base `602a929`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 23.93s | 27.96s | +16.8% | 15.85s | 18.43s | +16.3% | 2.98s | 3.76s | +26.2% | 3.13s | 3.12s | -0.6% | 0.86x |
| Large app | 1 | 11.33s | 12.99s | +14.6% | 6.99s | 7.89s | +12.8% | 1.47s | 1.87s | +26.7% | 1.69s | 1.70s | +0.8% | 0.87x |
| Standard fixtures | 6 | 12.60s | 14.98s | +18.9% | 8.86s | 10.55s | +19.0% | 1.51s | 1.89s | +25.8% | 1.44s | 1.41s | -2.1% | 0.84x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 7.53s | 8.31s | +10.4% | 8.36s | 8.57s | 0.91x | 1525 MB |
| `synthetic-1024-ssr-esm` | 5 | 2.84s | 3.95s | +38.8% | 3.96s | 4.17s | 0.72x | 643 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 3.85s | 5.24s | +36.1% | 5.27s | 5.62s | 0.73x | 823 MB |
| `synthetic-256-sourcemaps` | 10 | 1.58s | 2.11s | +33.9% | 2.13s | 2.29s | 0.75x | 464 MB |
| `synthetic-256-ssr-esm` | 10 | 1.45s | 1.95s | +35.1% | 1.97s | 2.13s | 0.74x | 430 MB |
| `synthetic-256-ssr-esm-split` | 10 | 1.71s | 2.33s | +36.3% | 2.33s | 2.48s | 0.73x | 447 MB |
| `synthetic-48-ssr-esm` | 10 | 0.97s | 1.30s | +33.5% | 1.33s | 1.59s | 0.75x | 318 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 11.33s | 12.99s | +14.6% | 6.99s | 7.89s | 1.47s | 1.87s | 1.69s | 1.70s | +0.8% | 12.97s | 13.10s | 0.87x | - |
| `synthetic-1024-ssr-esm` | 5 | 3.75s | 4.34s | +15.5% | 2.66s | 3.13s | 0.42s | 0.53s | 0.43s | 0.48s | +11.1% | 4.35s | 4.37s | 0.87x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 3.64s | 4.64s | +27.5% | 2.47s | 3.05s | 0.44s | 0.55s | 0.41s | 0.48s | +17.6% | 4.55s | 4.73s | 0.78x | - |
| `synthetic-256-sourcemaps` | 10 | 1.57s | 1.87s | +18.9% | 1.15s | 1.41s | 0.19s | 0.22s | 0.15s | 0.15s | -0.1% | 1.88s | 1.94s | 0.84x | - |
| `synthetic-256-ssr-esm` | 10 | 1.53s | 1.64s | +7.6% | 1.05s | 1.18s | 0.19s | 0.24s | 0.25s | 0.13s | -49.7% | 1.65s | 1.71s | 0.93x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.38s | 1.65s | +19.1% | 1.01s | 1.18s | 0.18s | 0.24s | 0.13s | 0.13s | -0.8% | 1.66s | 1.72s | 0.84x | - |
| `synthetic-48-ssr-esm` | 10 | 0.73s | 0.84s | +16.0% | 0.51s | 0.59s | 0.10s | 0.12s | 0.07s | 0.05s | -31.1% | 0.85s | 0.90s | 0.86x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1369.3ms | 1703.9ms | +24.4% | 1703.9ms | 25.5ms | 10 |
| node | `route:module` | 1785 | 698.5ms | 907.0ms | +29.8% | 907.0ms | 9.6ms | 10 |
| web | `route:client-entry` | 1785 | 277.9ms | 370.3ms | +33.2% | 370.3ms | 6.4ms | 10 |
| node | `manifest:transform` | 5 | 90.9ms | 101.0ms | +11.1% | 101.0ms | 23.2ms | 5 |
| web | `manifest:stage` | 10 | 12.0ms | 14.7ms | +22.5% | 14.7ms | 2.0ms | 10 |
| web | `manifest:transform` | 5 | 0.1ms | 0.5ms | +400.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 1715.7ms | 2005.8ms | +16.9% | 2005.8ms | 17.9ms | 10 |
| node | `route:module` | 5130 | 773.9ms | 929.8ms | +20.1% | 929.8ms | 6.7ms | 10 |
| web | `route:client-entry` | 5130 | 389.2ms | 636.3ms | +63.5% | 636.3ms | 10.2ms | 10 |
| node | `module:client-only-stub` | 5 | 156.5ms | 101.6ms | -35.1% | 101.6ms | 28.1ms | 5 |
| node | `manifest:transform` | 5 | 155.5ms | 213.3ms | +37.2% | 213.3ms | 45.0ms | 5 |
| web | `manifest:stage` | 10 | 55.1ms | 49.4ms | -10.3% | 49.4ms | 7.3ms | 10 |
| web | `manifest:transform` | 5 | 0.3ms | 0.5ms | +66.7% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5132 | 1677.9ms | 2085.3ms | +24.3% | 2085.3ms | 20.8ms | 12 |
| node | `route:module` | 5130 | 779.7ms | 945.0ms | +21.2% | 945.0ms | 5.8ms | 10 |
| web | `route:client-entry` | 5132 | 423.9ms | 625.1ms | +47.5% | 625.1ms | 7.1ms | 12 |
| node | `manifest:transform` | 5 | 158.6ms | 197.3ms | +24.4% | 197.3ms | 43.4ms | 5 |
| node | `module:client-only-stub` | 5 | 144.5ms | 114.1ms | -21.0% | 114.1ms | 56.8ms | 5 |
| web | `manifest:stage` | 12 | 44.1ms | 67.5ms | +53.1% | 67.5ms | 8.6ms | 12 |
| web | `manifest:transform` | 5 | 0.4ms | 0.5ms | +25.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1128.3ms | 1390.4ms | +23.2% | 1390.4ms | 16.6ms | 20 |
| node | `route:module` | 2580 | 536.2ms | 616.6ms | +15.0% | 616.6ms | 4.4ms | 20 |
| web | `route:client-entry` | 2580 | 267.9ms | 415.3ms | +55.0% | 415.3ms | 5.7ms | 20 |
| node | `manifest:transform` | 10 | 104.1ms | 139.9ms | +34.4% | 139.9ms | 18.9ms | 10 |
| node | `module:client-only-stub` | 10 | 88.1ms | 363.4ms | +312.5% | 363.4ms | 207.7ms | 10 |
| web | `manifest:stage` | 20 | 16.7ms | 21.5ms | +28.7% | 21.5ms | 1.7ms | 20 |
| web | `manifest:transform` | 10 | 0.7ms | 1.0ms | +42.9% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1060.9ms | 1406.4ms | +32.6% | 1406.4ms | 16.6ms | 22 |
| node | `route:module` | 2580 | 455.9ms | 549.0ms | +20.4% | 549.0ms | 5.6ms | 20 |
| web | `route:client-entry` | 2582 | 293.1ms | 389.3ms | +32.8% | 389.3ms | 5.0ms | 22 |
| node | `module:client-only-stub` | 10 | 158.1ms | 243.8ms | +54.2% | 243.8ms | 109.6ms | 10 |
| node | `manifest:transform` | 10 | 120.1ms | 144.5ms | +20.3% | 144.5ms | 21.1ms | 10 |
| web | `manifest:stage` | 22 | 17.0ms | 22.4ms | +31.8% | 22.4ms | 1.4ms | 22 |
| web | `manifest:transform` | 10 | 0.6ms | 1.0ms | +66.7% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1029.2ms | 1416.7ms | +37.7% | 1416.7ms | 19.6ms | 21 |
| node | `route:module` | 2580 | 438.6ms | 549.5ms | +25.3% | 549.5ms | 7.7ms | 20 |
| web | `route:client-entry` | 2581 | 284.1ms | 388.2ms | +36.6% | 388.2ms | 5.6ms | 21 |
| node | `manifest:transform` | 10 | 117.1ms | 149.0ms | +27.2% | 149.0ms | 19.0ms | 10 |
| node | `module:client-only-stub` | 10 | 75.1ms | 193.3ms | +157.4% | 193.3ms | 126.1ms | 10 |
| web | `manifest:stage` | 21 | 17.9ms | 21.7ms | +21.2% | 21.7ms | 1.4ms | 21 |
| web | `manifest:transform` | 10 | 0.8ms | 1.0ms | +25.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 385.9ms | 404.9ms | +4.9% | 404.9ms | 9.4ms | 20 |
| node | `route:module` | 500 | 122.4ms | 160.5ms | +31.1% | 160.5ms | 6.3ms | 20 |
| web | `route:client-entry` | 500 | 85.8ms | 120.2ms | +40.1% | 120.2ms | 3.6ms | 20 |
| node | `module:client-only-stub` | 10 | 83.8ms | 102.2ms | +22.0% | 102.2ms | 14.5ms | 10 |
| node | `manifest:transform` | 10 | 36.0ms | 51.8ms | +43.9% | 51.8ms | 8.8ms | 10 |
| web | `manifest:stage` | 20 | 4.3ms | 5.7ms | +32.6% | 5.7ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 87.28s | 109.46s | +25.4% | 109.46s | - | 0.80x | - |
| complex app | 2 | 61.06s | 77.99s | +27.7% | 77.99s | - | 0.78x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 70.17s | 94.81s | +35.1% | 63.01s | 86.50s | 1.96s | 2.68s | 3.58s | 3.20s | -10.8% | 94.81s | - | 0.74x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29055711354)

