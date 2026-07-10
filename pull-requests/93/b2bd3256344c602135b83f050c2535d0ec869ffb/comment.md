<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `b2bd325` against base `c9535d8`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.93s | 32.58s | +8.9% | 19.94s | 20.02s | +0.4% | 4.05s | 4.10s | +1.3% | 3.31s | 3.01s | -9.0% | 0.92x |
| Large app | 1 | 13.97s | 16.09s | +15.2% | 8.49s | 8.62s | +1.5% | 2.02s | 2.00s | -0.7% | 1.80s | 1.83s | +1.7% | 0.87x |
| Standard fixtures | 6 | 15.96s | 16.49s | +3.3% | 11.45s | 11.41s | -0.4% | 2.03s | 2.09s | +3.3% | 1.52s | 1.19s | -21.8% | 0.97x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 9.02s | 9.02s | -0.0% | 9.00s | 9.23s | 1.00x | 1535 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.25s | 4.27s | +0.4% | 4.27s | 4.48s | 1.00x | 637 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.72s | 5.63s | -1.4% | 5.63s | 5.79s | 1.01x | 818 MB |
| `synthetic-256-sourcemaps` | 10 | 2.24s | 2.23s | -0.7% | 2.23s | 2.41s | 1.01x | 448 MB |
| `synthetic-256-ssr-esm` | 10 | 2.13s | 2.09s | -1.6% | 2.11s | 2.26s | 1.02x | 425 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.51s | 2.50s | -0.3% | 2.52s | 2.67s | 1.00x | 450 MB |
| `synthetic-48-ssr-esm` | 10 | 1.41s | 1.35s | -4.6% | 1.37s | 1.59s | 1.05x | 329 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.97s | 16.09s | +15.2% | 8.49s | 8.62s | 2.02s | 2.00s | 1.80s | 1.83s | +1.7% | 16.22s | 16.98s | 0.87x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.68s | 4.82s | +3.0% | 3.36s | 3.32s | 0.59s | 0.59s | 0.48s | 0.35s | -26.4% | 4.84s | 4.94s | 0.97x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.76s | 4.89s | +2.7% | 3.37s | 3.37s | 0.58s | 0.61s | 0.53s | 0.35s | -33.4% | 4.84s | 4.96s | 0.97x | - |
| `synthetic-256-sourcemaps` | 10 | 2.03s | 2.10s | +3.8% | 1.51s | 1.51s | 0.25s | 0.25s | 0.15s | 0.15s | -0.4% | 2.09s | 2.14s | 0.96x | - |
| `synthetic-256-ssr-esm` | 10 | 1.80s | 1.87s | +4.0% | 1.27s | 1.29s | 0.24s | 0.26s | 0.15s | 0.13s | -16.4% | 1.86s | 1.95s | 0.96x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.78s | 1.85s | +3.5% | 1.29s | 1.27s | 0.23s | 0.26s | 0.15s | 0.13s | -17.0% | 1.84s | 1.93s | 0.97x | - |
| `synthetic-48-ssr-esm` | 10 | 0.91s | 0.96s | +5.5% | 0.65s | 0.65s | 0.13s | 0.13s | 0.05s | 0.08s | +47.0% | 0.96s | 0.98s | 0.95x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1720.6ms | 1854.6ms | +7.8% | 1854.6ms | 20.4ms | 10 |
| node | `route:module` | 1785 | 847.2ms | 898.0ms | +6.0% | 898.0ms | 6.5ms | 10 |
| web | `route:client-entry` | 1785 | 374.3ms | 446.5ms | +19.3% | 446.5ms | 5.2ms | 10 |
| node | `manifest:transform` | 5 | 107.3ms | 181.5ms | +69.2% | 181.5ms | 66.9ms | 5 |
| web | `manifest:stage` | 15 | 16.0ms | 20.5ms | +28.1% | 20.5ms | 2.3ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2111.1ms | 2079.7ms | -1.5% | 2079.7ms | 17.1ms | 10 |
| node | `route:module` | 5130 | 977.0ms | 946.5ms | -3.1% | 946.5ms | 5.2ms | 10 |
| web | `route:client-entry` | 5130 | 647.5ms | 689.3ms | +6.5% | 689.3ms | 11.7ms | 10 |
| node | `manifest:transform` | 5 | 211.3ms | 207.4ms | -1.8% | 207.4ms | 42.5ms | 5 |
| node | `module:client-only-stub` | 5 | 201.8ms | 112.3ms | -44.4% | 112.3ms | 47.9ms | 5 |
| web | `manifest:stage` | 15 | 57.2ms | 71.5ms | +25.0% | 71.5ms | 8.0ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2135.0ms | 2112.1ms | -1.1% | 2112.1ms | 20.0ms | 10 |
| node | `route:module` | 5130 | 973.5ms | 957.9ms | -1.6% | 957.9ms | 6.1ms | 10 |
| web | `route:client-entry` | 5130 | 645.9ms | 706.9ms | +9.4% | 706.9ms | 7.1ms | 10 |
| node | `module:client-only-stub` | 5 | 274.8ms | 92.3ms | -66.4% | 92.3ms | 27.5ms | 5 |
| node | `manifest:transform` | 5 | 211.3ms | 210.9ms | -0.2% | 210.9ms | 45.1ms | 5 |
| web | `manifest:stage` | 15 | 60.0ms | 64.0ms | +6.7% | 64.0ms | 8.2ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1420.5ms | 1501.2ms | +5.7% | 1501.2ms | 24.7ms | 20 |
| node | `route:module` | 2580 | 607.0ms | 638.4ms | +5.2% | 638.4ms | 8.5ms | 20 |
| web | `route:client-entry` | 2580 | 407.4ms | 426.7ms | +4.7% | 426.7ms | 6.2ms | 20 |
| node | `module:client-only-stub` | 10 | 253.9ms | 312.7ms | +23.2% | 312.7ms | 72.9ms | 10 |
| node | `manifest:transform` | 10 | 159.8ms | 144.0ms | -9.9% | 144.0ms | 18.8ms | 10 |
| web | `manifest:stage` | 30 | 25.0ms | 31.5ms | +26.0% | 31.5ms | 3.2ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1410.1ms | 1431.2ms | +1.5% | 1431.2ms | 18.7ms | 20 |
| node | `route:module` | 2580 | 561.8ms | 551.4ms | -1.9% | 551.4ms | 5.4ms | 20 |
| web | `route:client-entry` | 2580 | 394.8ms | 422.9ms | +7.1% | 422.9ms | 5.2ms | 20 |
| node | `manifest:transform` | 10 | 175.7ms | 173.0ms | -1.5% | 173.0ms | 23.7ms | 10 |
| node | `module:client-only-stub` | 10 | 159.0ms | 51.0ms | -67.9% | 51.0ms | 17.3ms | 10 |
| web | `manifest:stage` | 30 | 22.3ms | 29.1ms | +30.5% | 29.1ms | 1.4ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1385.1ms | 1430.3ms | +3.3% | 1430.3ms | 22.8ms | 20 |
| node | `route:module` | 2580 | 550.5ms | 571.4ms | +3.8% | 571.4ms | 5.0ms | 20 |
| web | `route:client-entry` | 2580 | 398.3ms | 429.6ms | +7.9% | 429.6ms | 5.6ms | 20 |
| node | `manifest:transform` | 10 | 175.2ms | 163.6ms | -6.6% | 163.6ms | 21.9ms | 10 |
| node | `module:client-only-stub` | 10 | 81.4ms | 225.3ms | +176.8% | 225.3ms | 67.3ms | 10 |
| web | `manifest:stage` | 30 | 22.4ms | 29.3ms | +30.8% | 29.3ms | 1.4ms | 30 |
| web | `manifest:transform` | 10 | 1.1ms | 1.0ms | -9.1% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 481.7ms | 480.0ms | -0.4% | 480.0ms | 12.9ms | 20 |
| node | `route:module` | 500 | 169.5ms | 177.6ms | +4.8% | 177.6ms | 4.8ms | 20 |
| web | `route:client-entry` | 500 | 107.8ms | 128.6ms | +19.3% | 128.6ms | 3.7ms | 20 |
| node | `module:client-only-stub` | 10 | 73.8ms | 81.7ms | +10.7% | 81.7ms | 11.4ms | 10 |
| node | `manifest:transform` | 10 | 54.2ms | 55.6ms | +2.6% | 55.6ms | 7.7ms | 10 |
| web | `manifest:stage` | 30 | 5.5ms | 7.7ms | +40.0% | 7.7ms | 0.4ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.1ms | +10.0% | 1.1ms | 0.2ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 114.87s | 117.91s | +2.6% | 117.91s | - | 0.97x | - |
| complex app | 2 | 80.90s | 88.19s | +9.0% | 88.19s | - | 0.92x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 99.66s | 111.65s | +12.0% | 90.81s | 98.03s | 2.92s | 3.12s | 3.39s | 3.73s | +10.2% | 111.65s | - | 0.89x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29124614486)

