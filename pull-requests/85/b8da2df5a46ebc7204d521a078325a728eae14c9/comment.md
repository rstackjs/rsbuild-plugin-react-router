<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `b8da2df` against base `96ed301`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 28.88s | 28.60s | -1.0% | 19.32s | 19.14s | -0.9% | 3.90s | 3.92s | +0.7% | 3.24s | 3.12s | -3.9% | 1.01x |
| Large app | 1 | 13.47s | 13.37s | -0.7% | 8.23s | 8.20s | -0.4% | 1.98s | 1.94s | -1.6% | 1.70s | 1.70s | -0.1% | 1.01x |
| Standard fixtures | 6 | 15.42s | 15.23s | -1.2% | 11.09s | 10.94s | -1.3% | 1.92s | 1.98s | +3.0% | 1.54s | 1.42s | -8.1% | 1.01x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 | Head client JS gzip | Client JS gzip delta | Head total gzip |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.61s | 8.59s | -0.2% | 8.62s | 8.80s | 1.00x | 1548 MB | 5.0 MB | +0.2% | 14.8 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.09s | 4.12s | +0.5% | 4.18s | 4.43s | 0.99x | 637 MB | 626.1 kB | -4.1% | 1.4 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.53s | 5.56s | +0.5% | 5.60s | 5.88s | 1.00x | 818 MB | 927.8 kB | -2.5% | 1.7 MB |
| `synthetic-256-sourcemaps` | 10 | 2.19s | 2.19s | +0.2% | 2.20s | 2.36s | 1.00x | 449 MB | 228.7 kB | -2.9% | 1.4 MB |
| `synthetic-256-ssr-esm` | 10 | 2.07s | 2.04s | -1.2% | 2.05s | 2.19s | 1.01x | 423 MB | 228.7 kB | -2.9% | 918.8 kB |
| `synthetic-256-ssr-esm-split` | 10 | 2.49s | 2.46s | -1.2% | 2.47s | 2.64s | 1.01x | 458 MB | 305.6 kB | -1.9% | 998.3 kB |
| `synthetic-48-ssr-esm` | 10 | 1.35s | 1.33s | -1.2% | 1.35s | 1.55s | 1.01x | 311 MB | 121.9 kB | -1.1% | 763.9 kB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.47s | 13.37s | -0.7% | 8.23s | 8.20s | 1.98s | 1.94s | 1.70s | 1.70s | -0.1% | 13.66s | 14.86s | 1.01x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.52s | 4.49s | -0.8% | 3.22s | 3.21s | 0.53s | 0.56s | 0.53s | 0.48s | -9.6% | 4.55s | 4.86s | 1.01x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.55s | 4.51s | -0.9% | 3.25s | 3.23s | 0.55s | 0.56s | 0.53s | 0.48s | -9.2% | 4.51s | 4.55s | 1.01x | - |
| `synthetic-256-sourcemaps` | 10 | 1.98s | 1.95s | -1.4% | 1.48s | 1.44s | 0.25s | 0.24s | 0.15s | 0.15s | -0.3% | 1.96s | 2.09s | 1.01x | - |
| `synthetic-256-ssr-esm` | 10 | 1.74s | 1.71s | -2.0% | 1.25s | 1.22s | 0.24s | 0.24s | 0.15s | 0.13s | -15.9% | 1.72s | 1.76s | 1.02x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.72s | 1.71s | -0.2% | 1.24s | 1.23s | 0.23s | 0.24s | 0.13s | 0.13s | +0.5% | 1.72s | 1.78s | 1.00x | - |
| `synthetic-48-ssr-esm` | 10 | 0.90s | 0.86s | -4.6% | 0.65s | 0.61s | 0.12s | 0.13s | 0.05s | 0.05s | -1.2% | 0.86s | 0.88s | 1.05x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1786 | 1689.1ms | 1747.8ms | +3.5% | 1747.8ms | 25.5ms | 11 |
| node | `route:module` | 1785 | 882.7ms | 860.9ms | -2.5% | 860.9ms | 5.9ms | 10 |
| web | `route:client-entry` | 1786 | 393.7ms | 373.0ms | -5.3% | 373.0ms | 5.1ms | 11 |
| node | `manifest:transform` | 5 | 119.5ms | 142.6ms | +19.3% | 142.6ms | 53.4ms | 5 |
| web | `manifest:stage` | 11 | 14.3ms | 15.1ms | +5.6% | 15.1ms | 1.8ms | 11 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2099.3ms | 2028.9ms | -3.4% | 2028.9ms | 14.6ms | 10 |
| node | `route:module` | 5130 | 937.7ms | 926.8ms | -1.2% | 926.8ms | 5.4ms | 10 |
| web | `route:client-entry` | 5130 | 640.0ms | 654.6ms | +2.3% | 654.6ms | 6.7ms | 10 |
| node | `module:client-only-stub` | 5 | 534.1ms | 233.9ms | -56.2% | 233.9ms | 104.0ms | 5 |
| node | `manifest:transform` | 5 | 215.8ms | 208.7ms | -3.3% | 208.7ms | 47.0ms | 5 |
| web | `manifest:stage` | 10 | 65.6ms | 58.8ms | -10.4% | 58.8ms | 6.8ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2007.3ms | 2040.4ms | +1.6% | 2040.4ms | 14.1ms | 10 |
| node | `route:module` | 5130 | 923.0ms | 935.2ms | +1.3% | 935.2ms | 5.9ms | 10 |
| node | `module:client-only-stub` | 5 | 640.5ms | 292.3ms | -54.4% | 292.3ms | 162.4ms | 5 |
| web | `route:client-entry` | 5130 | 631.5ms | 651.2ms | +3.1% | 651.2ms | 7.1ms | 10 |
| node | `manifest:transform` | 5 | 216.8ms | 200.9ms | -7.3% | 200.9ms | 43.7ms | 5 |
| web | `manifest:stage` | 10 | 64.3ms | 53.7ms | -16.5% | 53.7ms | 7.9ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2584 | 1371.4ms | 1372.8ms | +0.1% | 1372.8ms | 16.9ms | 24 |
| node | `route:module` | 2580 | 568.8ms | 621.3ms | +9.2% | 621.3ms | 4.6ms | 20 |
| web | `route:client-entry` | 2584 | 383.8ms | 416.7ms | +8.6% | 416.7ms | 4.7ms | 24 |
| node | `manifest:transform` | 10 | 144.0ms | 162.2ms | +12.6% | 162.2ms | 25.8ms | 10 |
| node | `module:client-only-stub` | 10 | 123.5ms | 270.5ms | +119.0% | 270.5ms | 98.3ms | 10 |
| web | `manifest:stage` | 24 | 23.1ms | 23.6ms | +2.2% | 23.6ms | 1.4ms | 24 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1310.5ms | 1405.8ms | +7.3% | 1405.8ms | 17.4ms | 22 |
| node | `route:module` | 2580 | 538.0ms | 541.8ms | +0.7% | 541.8ms | 4.5ms | 20 |
| web | `route:client-entry` | 2582 | 384.0ms | 385.6ms | +0.4% | 385.6ms | 4.8ms | 22 |
| node | `manifest:transform` | 10 | 167.4ms | 166.6ms | -0.5% | 166.6ms | 23.2ms | 10 |
| node | `module:client-only-stub` | 10 | 94.2ms | 105.2ms | +11.7% | 105.2ms | 69.4ms | 10 |
| web | `manifest:stage` | 22 | 21.6ms | 21.8ms | +0.9% | 21.8ms | 1.4ms | 22 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2583 | 1319.8ms | 1406.3ms | +6.6% | 1406.3ms | 17.5ms | 23 |
| node | `route:module` | 2580 | 574.2ms | 545.0ms | -5.1% | 545.0ms | 4.7ms | 20 |
| web | `route:client-entry` | 2583 | 388.1ms | 406.4ms | +4.7% | 406.4ms | 4.8ms | 23 |
| node | `module:client-only-stub` | 10 | 173.4ms | 262.5ms | +51.4% | 262.5ms | 128.5ms | 10 |
| node | `manifest:transform` | 10 | 163.7ms | 167.7ms | +2.4% | 167.7ms | 20.0ms | 10 |
| web | `manifest:stage` | 23 | 20.2ms | 22.5ms | +11.4% | 22.5ms | 1.4ms | 23 |
| web | `manifest:transform` | 10 | 1.1ms | 1.0ms | -9.1% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 492.9ms | 383.2ms | -22.3% | 383.2ms | 9.2ms | 20 |
| node | `route:module` | 500 | 174.2ms | 153.1ms | -12.1% | 153.1ms | 3.4ms | 20 |
| web | `route:client-entry` | 500 | 106.3ms | 110.8ms | +4.2% | 110.8ms | 3.5ms | 20 |
| node | `module:client-only-stub` | 10 | 78.4ms | 100.4ms | +28.1% | 100.4ms | 31.2ms | 10 |
| node | `manifest:transform` | 10 | 57.6ms | 53.4ms | -7.3% | 53.4ms | 6.5ms | 10 |
| web | `manifest:stage` | 20 | 5.6ms | 5.9ms | +5.4% | 5.9ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 | Head client JS gzip | Client JS gzip delta | Head total gzip |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 110.31s | 110.08s | -0.2% | 110.08s | - | 1.00x | - | - | - | - |
| complex app | 2 | 77.02s | 76.97s | -0.1% | 76.97s | - | 1.00x | - | - | - | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 94.12s | 94.45s | +0.3% | 85.60s | 85.91s | 2.81s | 2.80s | 3.23s | 3.27s | +1.2% | 94.45s | - | 1.00x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29060046616)

