<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `8b9a4a4` against base `96ed301`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 28.21s | 30.75s | +9.0% | 18.83s | 18.94s | +0.6% | 3.79s | 3.83s | +1.1% | 3.19s | 2.83s | -11.2% | 0.92x |
| Large app | 1 | 13.27s | 15.27s | +15.1% | 8.13s | 8.17s | +0.6% | 1.92s | 1.90s | -0.9% | 1.72s | 1.74s | +1.1% | 0.87x |
| Standard fixtures | 6 | 14.95s | 15.48s | +3.6% | 10.70s | 10.77s | +0.6% | 1.88s | 1.93s | +3.0% | 1.47s | 1.09s | -25.7% | 0.97x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.57s | 8.46s | -1.3% | 8.52s | 8.80s | 1.01x | 1524 MB |
| `synthetic-1024-ssr-esm` | 5 | 3.94s | 3.96s | +0.5% | 4.01s | 4.23s | 1.00x | 642 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.33s | 5.24s | -1.6% | 5.33s | 5.64s | 1.02x | 823 MB |
| `synthetic-256-sourcemaps` | 10 | 2.12s | 2.11s | -0.1% | 2.13s | 2.30s | 1.00x | 465 MB |
| `synthetic-256-ssr-esm` | 10 | 1.99s | 1.97s | -1.1% | 1.99s | 2.15s | 1.01x | 421 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.40s | 2.35s | -2.0% | 2.36s | 2.54s | 1.02x | 464 MB |
| `synthetic-48-ssr-esm` | 10 | 1.32s | 1.30s | -1.4% | 1.32s | 1.51s | 1.01x | 311 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.27s | 15.27s | +15.1% | 8.13s | 8.17s | 1.92s | 1.90s | 1.72s | 1.74s | +1.1% | 15.46s | 16.31s | 0.87x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.36s | 4.52s | +3.6% | 3.10s | 3.13s | 0.53s | 0.55s | 0.50s | 0.33s | -34.9% | 4.57s | 4.73s | 0.97x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.43s | 4.60s | +3.9% | 3.15s | 3.22s | 0.54s | 0.54s | 0.48s | 0.33s | -31.4% | 4.60s | 4.70s | 0.96x | - |
| `synthetic-256-sourcemaps` | 10 | 1.91s | 1.98s | +3.2% | 1.42s | 1.42s | 0.24s | 0.24s | 0.15s | 0.13s | -16.1% | 1.98s | 2.03s | 0.97x | - |
| `synthetic-256-ssr-esm` | 10 | 1.70s | 1.75s | +3.4% | 1.20s | 1.19s | 0.22s | 0.24s | 0.15s | 0.13s | -16.3% | 1.75s | 1.83s | 0.97x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.67s | 1.73s | +3.5% | 1.20s | 1.19s | 0.22s | 0.24s | 0.13s | 0.13s | -0.2% | 1.73s | 1.84s | 0.97x | - |
| `synthetic-48-ssr-esm` | 10 | 0.88s | 0.91s | +3.3% | 0.63s | 0.62s | 0.12s | 0.12s | 0.05s | 0.05s | -1.9% | 0.90s | 0.95s | 0.97x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1700.9ms | 1708.1ms | +0.4% | 1708.1ms | 24.7ms | 10 |
| node | `route:module` | 1785 | 851.6ms | 888.6ms | +4.3% | 888.6ms | 11.6ms | 10 |
| web | `route:client-entry` | 1785 | 389.2ms | 412.7ms | +6.0% | 412.7ms | 6.4ms | 10 |
| node | `manifest:transform` | 5 | 129.2ms | 120.7ms | -6.6% | 120.7ms | 51.3ms | 5 |
| web | `manifest:stage` | 15 | 14.7ms | 19.7ms | +34.0% | 19.7ms | 2.0ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2076.1ms | 2044.1ms | -1.5% | 2044.1ms | 11.9ms | 10 |
| node | `route:module` | 5130 | 974.9ms | 969.2ms | -0.6% | 969.2ms | 15.1ms | 10 |
| web | `route:client-entry` | 5130 | 648.8ms | 654.2ms | +0.8% | 654.2ms | 7.6ms | 10 |
| node | `manifest:transform` | 5 | 203.7ms | 216.7ms | +6.4% | 216.7ms | 46.3ms | 5 |
| node | `module:client-only-stub` | 5 | 160.3ms | 163.1ms | +1.7% | 163.1ms | 79.5ms | 5 |
| web | `manifest:stage` | 15 | 62.1ms | 71.6ms | +15.3% | 71.6ms | 8.9ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2075.5ms | 2089.1ms | +0.7% | 2089.1ms | 20.0ms | 10 |
| node | `route:module` | 5130 | 926.2ms | 959.6ms | +3.6% | 959.6ms | 5.8ms | 10 |
| web | `route:client-entry` | 5130 | 608.7ms | 647.6ms | +6.4% | 647.6ms | 6.7ms | 10 |
| node | `manifest:transform` | 5 | 215.1ms | 234.2ms | +8.9% | 234.2ms | 76.5ms | 5 |
| node | `module:client-only-stub` | 5 | 97.9ms | 92.7ms | -5.3% | 92.7ms | 47.7ms | 5 |
| web | `manifest:stage` | 15 | 62.4ms | 73.6ms | +17.9% | 73.6ms | 8.9ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1411.0ms | 1464.4ms | +3.8% | 1464.4ms | 21.1ms | 21 |
| node | `route:module` | 2580 | 608.5ms | 630.8ms | +3.7% | 630.8ms | 5.2ms | 20 |
| web | `route:client-entry` | 2581 | 397.5ms | 404.1ms | +1.7% | 404.1ms | 5.7ms | 21 |
| node | `module:client-only-stub` | 10 | 248.7ms | 200.8ms | -19.3% | 200.8ms | 67.1ms | 10 |
| node | `manifest:transform` | 10 | 154.7ms | 129.3ms | -16.4% | 129.3ms | 20.5ms | 10 |
| web | `manifest:stage` | 32 | 22.8ms | 35.0ms | +53.5% | 35.0ms | 3.0ms | 32 |
| web | `manifest:transform` | 10 | 0.9ms | 1.0ms | +11.1% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1368.0ms | 1415.1ms | +3.4% | 1415.1ms | 9.9ms | 21 |
| node | `route:module` | 2580 | 542.6ms | 542.1ms | -0.1% | 542.1ms | 5.6ms | 20 |
| web | `route:client-entry` | 2581 | 394.5ms | 396.7ms | +0.6% | 396.7ms | 5.7ms | 21 |
| node | `module:client-only-stub` | 10 | 200.9ms | 271.0ms | +34.9% | 271.0ms | 162.6ms | 10 |
| node | `manifest:transform` | 10 | 162.4ms | 169.6ms | +4.4% | 169.6ms | 25.1ms | 10 |
| web | `manifest:stage` | 32 | 21.1ms | 30.7ms | +45.5% | 30.7ms | 1.8ms | 32 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1328.4ms | 1406.0ms | +5.8% | 1406.0ms | 13.0ms | 21 |
| node | `route:module` | 2580 | 541.3ms | 546.9ms | +1.0% | 546.9ms | 4.7ms | 20 |
| web | `route:client-entry` | 2581 | 394.6ms | 410.1ms | +3.9% | 410.1ms | 5.4ms | 21 |
| node | `module:client-only-stub` | 10 | 159.7ms | 83.0ms | -48.0% | 83.0ms | 23.7ms | 10 |
| node | `manifest:transform` | 10 | 142.8ms | 151.4ms | +6.0% | 151.4ms | 20.2ms | 10 |
| web | `manifest:stage` | 31 | 20.9ms | 29.8ms | +42.6% | 29.8ms | 1.5ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 501 | 504.0ms | 449.5ms | -10.8% | 449.5ms | 11.2ms | 21 |
| node | `route:module` | 500 | 169.6ms | 161.4ms | -4.8% | 161.4ms | 4.4ms | 20 |
| web | `route:client-entry` | 501 | 108.2ms | 115.2ms | +6.5% | 115.2ms | 3.6ms | 21 |
| node | `module:client-only-stub` | 10 | 75.9ms | 92.0ms | +21.2% | 92.0ms | 13.4ms | 10 |
| node | `manifest:transform` | 10 | 53.3ms | 60.5ms | +13.5% | 60.5ms | 7.7ms | 10 |
| web | `manifest:stage` | 31 | 5.5ms | 7.9ms | +43.6% | 7.9ms | 0.4ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 0.8ms | -20.0% | 0.8ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 113.31s | 112.64s | -0.6% | 112.64s | - | 1.01x | - |
| complex app | 2 | 79.95s | 78.90s | -1.3% | 78.90s | - | 1.01x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 94.99s | 98.65s | +3.9% | 86.49s | 87.96s | 2.69s | 2.70s | 3.31s | 3.37s | +1.8% | 98.65s | - | 0.96x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29068201913)

