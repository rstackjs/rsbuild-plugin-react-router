<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `77d92a5` against base `96ed301`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 28.21s | 31.09s | +10.2% | 18.83s | 18.83s | +0.0% | 3.79s | 3.85s | +1.6% | 3.19s | 2.88s | -9.6% | 0.91x |
| Large app | 1 | 13.27s | 15.68s | +18.2% | 8.13s | 8.15s | +0.2% | 1.92s | 1.95s | +1.6% | 1.72s | 1.80s | +4.1% | 0.85x |
| Standard fixtures | 6 | 14.95s | 15.41s | +3.1% | 10.70s | 10.68s | -0.2% | 1.88s | 1.91s | +1.5% | 1.47s | 1.09s | -25.8% | 0.97x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.57s | 8.39s | -2.0% | 8.45s | 8.69s | 1.02x | 1537 MB |
| `synthetic-1024-ssr-esm` | 5 | 3.94s | 3.90s | -1.0% | 3.93s | 4.17s | 1.01x | 646 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.33s | 5.26s | -1.2% | 5.34s | 5.54s | 1.01x | 841 MB |
| `synthetic-256-sourcemaps` | 10 | 2.12s | 2.13s | +0.4% | 2.13s | 2.26s | 1.00x | 452 MB |
| `synthetic-256-ssr-esm` | 10 | 1.99s | 1.97s | -1.3% | 1.98s | 2.16s | 1.01x | 433 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.40s | 2.34s | -2.2% | 2.36s | 2.51s | 1.02x | 459 MB |
| `synthetic-48-ssr-esm` | 10 | 1.32s | 1.31s | -0.5% | 1.34s | 1.58s | 1.00x | 314 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.27s | 15.68s | +18.2% | 8.13s | 8.15s | 1.92s | 1.95s | 1.72s | 1.80s | +4.1% | 15.66s | 16.10s | 0.85x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.36s | 4.54s | +4.1% | 3.10s | 3.13s | 0.53s | 0.55s | 0.50s | 0.33s | -34.8% | 4.52s | 4.61s | 0.96x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.43s | 4.52s | +2.2% | 3.15s | 3.15s | 0.54s | 0.54s | 0.48s | 0.33s | -31.8% | 4.58s | 4.75s | 0.98x | - |
| `synthetic-256-sourcemaps` | 10 | 1.91s | 1.99s | +4.2% | 1.42s | 1.43s | 0.24s | 0.22s | 0.15s | 0.13s | -16.3% | 1.99s | 2.04s | 0.96x | - |
| `synthetic-256-ssr-esm` | 10 | 1.70s | 1.71s | +0.8% | 1.20s | 1.18s | 0.22s | 0.24s | 0.15s | 0.13s | -16.4% | 1.71s | 1.76s | 0.99x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.67s | 1.74s | +4.6% | 1.20s | 1.19s | 0.22s | 0.24s | 0.13s | 0.13s | -0.1% | 1.74s | 1.80s | 0.96x | - |
| `synthetic-48-ssr-esm` | 10 | 0.88s | 0.89s | +1.3% | 0.63s | 0.61s | 0.12s | 0.12s | 0.05s | 0.05s | -1.8% | 0.89s | 0.93s | 0.99x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1700.9ms | 1844.0ms | +8.4% | 1844.0ms | 22.1ms | 10 |
| node | `route:module` | 1785 | 851.6ms | 888.2ms | +4.3% | 888.2ms | 12.4ms | 10 |
| web | `route:client-entry` | 1785 | 389.2ms | 404.1ms | +3.8% | 404.1ms | 6.0ms | 10 |
| node | `manifest:transform` | 5 | 129.2ms | 91.5ms | -29.2% | 91.5ms | 20.1ms | 5 |
| web | `manifest:stage` | 15 | 14.7ms | 24.2ms | +64.6% | 24.2ms | 5.0ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2076.1ms | 2079.1ms | +0.1% | 2079.1ms | 15.3ms | 10 |
| node | `route:module` | 5130 | 974.9ms | 952.9ms | -2.3% | 952.9ms | 11.0ms | 10 |
| web | `route:client-entry` | 5130 | 648.8ms | 687.6ms | +6.0% | 687.6ms | 8.5ms | 10 |
| node | `manifest:transform` | 5 | 203.7ms | 215.5ms | +5.8% | 215.5ms | 50.7ms | 5 |
| node | `module:client-only-stub` | 5 | 160.3ms | 140.8ms | -12.2% | 140.8ms | 75.0ms | 5 |
| web | `manifest:stage` | 15 | 62.1ms | 74.4ms | +19.8% | 74.4ms | 7.8ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.6ms | +20.0% | 0.6ms | 0.2ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2075.5ms | 2104.8ms | +1.4% | 2104.8ms | 23.5ms | 10 |
| node | `route:module` | 5130 | 926.2ms | 954.2ms | +3.0% | 954.2ms | 14.8ms | 10 |
| web | `route:client-entry` | 5130 | 608.7ms | 657.8ms | +8.1% | 657.8ms | 7.3ms | 10 |
| node | `manifest:transform` | 5 | 215.1ms | 231.5ms | +7.6% | 231.5ms | 66.0ms | 5 |
| node | `module:client-only-stub` | 5 | 97.9ms | 161.5ms | +65.0% | 161.5ms | 65.3ms | 5 |
| web | `manifest:stage` | 15 | 62.4ms | 66.9ms | +7.2% | 66.9ms | 8.4ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1411.0ms | 1466.8ms | +4.0% | 1466.8ms | 13.0ms | 21 |
| node | `route:module` | 2580 | 608.5ms | 597.1ms | -1.9% | 597.1ms | 4.6ms | 20 |
| web | `route:client-entry` | 2581 | 397.5ms | 398.6ms | +0.3% | 398.6ms | 5.5ms | 21 |
| node | `module:client-only-stub` | 10 | 248.7ms | 209.9ms | -15.6% | 209.9ms | 89.3ms | 10 |
| node | `manifest:transform` | 10 | 154.7ms | 154.9ms | +0.1% | 154.9ms | 29.3ms | 10 |
| web | `manifest:stage` | 32 | 22.8ms | 30.0ms | +31.6% | 30.0ms | 1.4ms | 32 |
| web | `manifest:transform` | 10 | 0.9ms | 1.0ms | +11.1% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1368.0ms | 1386.5ms | +1.4% | 1386.5ms | 16.3ms | 20 |
| node | `route:module` | 2580 | 542.6ms | 559.7ms | +3.2% | 559.7ms | 9.4ms | 20 |
| web | `route:client-entry` | 2580 | 394.5ms | 410.5ms | +4.1% | 410.5ms | 6.8ms | 20 |
| node | `module:client-only-stub` | 10 | 200.9ms | 102.3ms | -49.1% | 102.3ms | 78.9ms | 10 |
| node | `manifest:transform` | 10 | 162.4ms | 159.3ms | -1.9% | 159.3ms | 21.0ms | 10 |
| web | `manifest:stage` | 30 | 21.1ms | 28.7ms | +36.0% | 28.7ms | 1.4ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1328.4ms | 1398.7ms | +5.3% | 1398.7ms | 19.3ms | 21 |
| node | `route:module` | 2580 | 541.3ms | 570.3ms | +5.4% | 570.3ms | 9.3ms | 20 |
| web | `route:client-entry` | 2581 | 394.6ms | 403.2ms | +2.2% | 403.2ms | 5.7ms | 21 |
| node | `module:client-only-stub` | 10 | 159.7ms | 153.4ms | -3.9% | 153.4ms | 45.2ms | 10 |
| node | `manifest:transform` | 10 | 142.8ms | 164.7ms | +15.3% | 164.7ms | 21.3ms | 10 |
| web | `manifest:stage` | 31 | 20.9ms | 29.7ms | +42.1% | 29.7ms | 1.5ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 504.0ms | 438.0ms | -13.1% | 438.0ms | 8.9ms | 20 |
| node | `route:module` | 500 | 169.6ms | 157.1ms | -7.4% | 157.1ms | 4.0ms | 20 |
| web | `route:client-entry` | 500 | 108.2ms | 125.7ms | +16.2% | 125.7ms | 3.6ms | 20 |
| node | `module:client-only-stub` | 10 | 75.9ms | 77.6ms | +2.2% | 77.6ms | 13.2ms | 10 |
| node | `manifest:transform` | 10 | 53.3ms | 56.0ms | +5.1% | 56.0ms | 10.2ms | 10 |
| web | `manifest:stage` | 30 | 5.5ms | 7.5ms | +36.4% | 7.5ms | 0.4ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 113.31s | 128.51s | +13.4% | 128.51s | - | 0.88x | - |
| complex app | 2 | 79.95s | 79.12s | -1.0% | 79.12s | - | 1.01x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 94.99s | 94.03s | -1.0% | 86.49s | 85.65s | 2.69s | 2.66s | 3.31s | 3.30s | -0.2% | 94.03s | - | 1.01x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29072827665)

