<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `e4ba975` against base `602a929`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 23.93s | 29.01s | +21.2% | 15.85s | 19.34s | +22.0% | 2.98s | 4.04s | +35.4% | 3.13s | 3.17s | +1.1% | 0.82x |
| Large app | 1 | 11.33s | 13.63s | +20.3% | 6.99s | 8.29s | +18.5% | 1.47s | 2.00s | +35.8% | 1.69s | 1.75s | +3.8% | 0.83x |
| Standard fixtures | 6 | 12.60s | 15.38s | +22.1% | 8.86s | 11.05s | +24.7% | 1.51s | 2.03s | +35.0% | 1.44s | 1.41s | -2.1% | 0.82x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 7.53s | 8.71s | +15.8% | 8.76s | 9.04s | 0.86x | 1549 MB |
| `synthetic-1024-ssr-esm` | 5 | 2.84s | 4.23s | +48.9% | 4.28s | 4.50s | 0.67x | 650 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 3.85s | 5.56s | +44.4% | 5.64s | 5.96s | 0.69x | 843 MB |
| `synthetic-256-sourcemaps` | 10 | 1.58s | 2.21s | +40.2% | 2.22s | 2.39s | 0.71x | 458 MB |
| `synthetic-256-ssr-esm` | 10 | 1.45s | 2.05s | +41.5% | 2.06s | 2.22s | 0.71x | 416 MB |
| `synthetic-256-ssr-esm-split` | 10 | 1.71s | 2.50s | +45.9% | 2.51s | 2.67s | 0.69x | 458 MB |
| `synthetic-48-ssr-esm` | 10 | 0.97s | 1.36s | +40.2% | 1.44s | 2.27s | 0.71x | 310 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 11.33s | 13.63s | +20.3% | 6.99s | 8.29s | 1.47s | 2.00s | 1.69s | 1.75s | +3.8% | 13.61s | 13.73s | 0.83x | - |
| `synthetic-1024-ssr-esm` | 5 | 3.75s | 4.52s | +20.5% | 2.66s | 3.21s | 0.42s | 0.58s | 0.43s | 0.48s | +11.3% | 4.52s | 4.62s | 0.83x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 3.64s | 4.61s | +26.7% | 2.47s | 3.29s | 0.44s | 0.60s | 0.41s | 0.48s | +17.8% | 4.68s | 5.00s | 0.79x | - |
| `synthetic-256-sourcemaps` | 10 | 1.57s | 1.97s | +25.4% | 1.15s | 1.49s | 0.19s | 0.23s | 0.15s | 0.15s | -0.1% | 1.97s | 2.03s | 0.80x | - |
| `synthetic-256-ssr-esm` | 10 | 1.53s | 1.71s | +11.7% | 1.05s | 1.22s | 0.19s | 0.25s | 0.25s | 0.13s | -49.8% | 1.72s | 1.82s | 0.90x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.38s | 1.69s | +22.6% | 1.01s | 1.21s | 0.18s | 0.25s | 0.13s | 0.13s | -1.5% | 1.69s | 1.74s | 0.82x | - |
| `synthetic-48-ssr-esm` | 10 | 0.73s | 0.88s | +21.0% | 0.51s | 0.62s | 0.10s | 0.13s | 0.07s | 0.05s | -31.5% | 0.88s | 0.93s | 0.83x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1369.3ms | 1746.7ms | +27.6% | 1746.7ms | 21.0ms | 10 |
| node | `route:module` | 1785 | 698.5ms | 914.9ms | +31.0% | 914.9ms | 10.4ms | 10 |
| web | `route:client-entry` | 1785 | 277.9ms | 373.7ms | +34.5% | 373.7ms | 5.4ms | 10 |
| node | `manifest:transform` | 5 | 90.9ms | 108.2ms | +19.0% | 108.2ms | 27.8ms | 5 |
| web | `manifest:stage` | 10 | 12.0ms | 14.3ms | +19.2% | 14.3ms | 1.9ms | 10 |
| web | `manifest:transform` | 5 | 0.1ms | 0.5ms | +400.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 1715.7ms | 2079.5ms | +21.2% | 2079.5ms | 21.5ms | 10 |
| node | `route:module` | 5130 | 773.9ms | 975.7ms | +26.1% | 975.7ms | 7.3ms | 10 |
| web | `route:client-entry` | 5130 | 389.2ms | 649.7ms | +66.9% | 649.7ms | 6.4ms | 10 |
| node | `module:client-only-stub` | 5 | 156.5ms | 302.7ms | +93.4% | 302.7ms | 217.1ms | 5 |
| node | `manifest:transform` | 5 | 155.5ms | 217.8ms | +40.1% | 217.8ms | 48.1ms | 5 |
| web | `manifest:stage` | 10 | 55.1ms | 60.0ms | +8.9% | 60.0ms | 8.4ms | 10 |
| web | `manifest:transform` | 5 | 0.3ms | 0.5ms | +66.7% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5131 | 1677.9ms | 2065.3ms | +23.1% | 2065.3ms | 17.0ms | 11 |
| node | `route:module` | 5130 | 779.7ms | 901.7ms | +15.6% | 901.7ms | 6.6ms | 10 |
| web | `route:client-entry` | 5131 | 423.9ms | 640.9ms | +51.2% | 640.9ms | 8.8ms | 11 |
| node | `manifest:transform` | 5 | 158.6ms | 206.8ms | +30.4% | 206.8ms | 44.0ms | 5 |
| node | `module:client-only-stub` | 5 | 144.5ms | 79.1ms | -45.3% | 79.1ms | 34.2ms | 5 |
| web | `manifest:stage` | 11 | 44.1ms | 61.4ms | +39.2% | 61.4ms | 8.6ms | 11 |
| web | `manifest:transform` | 5 | 0.4ms | 0.5ms | +25.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1128.3ms | 1388.9ms | +23.1% | 1388.9ms | 12.4ms | 22 |
| node | `route:module` | 2580 | 536.2ms | 628.4ms | +17.2% | 628.4ms | 4.2ms | 20 |
| web | `route:client-entry` | 2582 | 267.9ms | 411.0ms | +53.4% | 411.0ms | 5.4ms | 22 |
| node | `manifest:transform` | 10 | 104.1ms | 151.0ms | +45.1% | 151.0ms | 20.0ms | 10 |
| node | `module:client-only-stub` | 10 | 88.1ms | 140.2ms | +59.1% | 140.2ms | 62.0ms | 10 |
| web | `manifest:stage` | 22 | 16.7ms | 21.6ms | +29.3% | 21.6ms | 1.4ms | 22 |
| web | `manifest:transform` | 10 | 0.7ms | 1.0ms | +42.9% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1060.9ms | 1389.4ms | +31.0% | 1389.4ms | 17.4ms | 22 |
| node | `route:module` | 2580 | 455.9ms | 543.3ms | +19.2% | 543.3ms | 4.7ms | 20 |
| web | `route:client-entry` | 2582 | 293.1ms | 393.0ms | +34.1% | 393.0ms | 5.3ms | 22 |
| node | `module:client-only-stub` | 10 | 158.1ms | 131.0ms | -17.1% | 131.0ms | 39.3ms | 10 |
| node | `manifest:transform` | 10 | 120.1ms | 137.1ms | +14.2% | 137.1ms | 19.5ms | 10 |
| web | `manifest:stage` | 22 | 17.0ms | 21.6ms | +27.1% | 21.6ms | 1.4ms | 22 |
| web | `manifest:transform` | 10 | 0.6ms | 1.0ms | +66.7% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1029.2ms | 1394.8ms | +35.5% | 1394.8ms | 17.0ms | 20 |
| node | `route:module` | 2580 | 438.6ms | 562.7ms | +28.3% | 562.7ms | 8.6ms | 20 |
| web | `route:client-entry` | 2580 | 284.1ms | 391.1ms | +37.7% | 391.1ms | 4.9ms | 20 |
| node | `manifest:transform` | 10 | 117.1ms | 159.6ms | +36.3% | 159.6ms | 20.0ms | 10 |
| node | `module:client-only-stub` | 10 | 75.1ms | 204.4ms | +172.2% | 204.4ms | 51.6ms | 10 |
| web | `manifest:stage` | 20 | 17.9ms | 20.9ms | +16.8% | 20.9ms | 1.4ms | 20 |
| web | `manifest:transform` | 10 | 0.8ms | 1.0ms | +25.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 385.9ms | 400.3ms | +3.7% | 400.3ms | 9.4ms | 20 |
| node | `route:module` | 500 | 122.4ms | 159.5ms | +30.3% | 159.5ms | 6.4ms | 20 |
| web | `route:client-entry` | 500 | 85.8ms | 114.5ms | +33.4% | 114.5ms | 4.0ms | 20 |
| node | `module:client-only-stub` | 10 | 83.8ms | 80.7ms | -3.7% | 80.7ms | 15.7ms | 10 |
| node | `manifest:transform` | 10 | 36.0ms | 58.3ms | +61.9% | 58.3ms | 8.7ms | 10 |
| web | `manifest:stage` | 20 | 4.3ms | 5.4ms | +25.6% | 5.4ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 87.28s | 124.88s | +43.1% | 124.88s | - | 0.70x | - |
| complex app | 2 | 61.06s | 80.65s | +32.1% | 80.65s | - | 0.76x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 70.17s | 97.96s | +39.6% | 63.01s | 89.13s | 1.96s | 2.91s | 3.58s | 3.32s | -7.4% | 97.96s | - | 0.72x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29057275740)

