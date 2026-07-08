<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `0efa1fe` against base `9018ef6`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.54s | 32.49s | +10.0% | 19.68s | 22.79s | +15.8% | 3.98s | 4.08s | +2.5% | 3.31s | 2.99s | -9.8% | 0.91x |
| Large app | 1 | 13.76s | 14.13s | +2.7% | 8.35s | 8.84s | +5.9% | 1.99s | 2.03s | +1.8% | 1.79s | 1.60s | -10.8% | 0.97x |
| Standard fixtures | 6 | 15.78s | 18.36s | +16.3% | 11.34s | 13.95s | +23.0% | 1.99s | 2.05s | +3.2% | 1.52s | 1.39s | -8.6% | 0.86x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.84s | 9.31s | +5.3% | 9.36s | 9.66s | 0.95x | 1584 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.26s | 5.53s | +29.8% | 5.63s | 6.22s | 0.77x | 720 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.76s | 6.83s | +18.6% | 6.82s | 6.92s | 0.84x | 838 MB |
| `synthetic-256-sourcemaps` | 10 | 2.22s | 2.47s | +11.6% | 2.49s | 2.63s | 0.90x | 477 MB |
| `synthetic-256-ssr-esm` | 10 | 2.11s | 2.46s | +16.6% | 2.47s | 2.72s | 0.86x | 466 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.51s | 2.83s | +12.9% | 2.85s | 3.04s | 0.89x | 481 MB |
| `synthetic-48-ssr-esm` | 10 | 1.38s | 1.43s | +3.5% | 1.46s | 1.73s | 0.97x | 319 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.76s | 14.13s | +2.7% | 8.35s | 8.84s | 1.99s | 2.03s | 1.79s | 1.60s | -10.8% | 14.14s | 14.21s | 0.97x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.53s | 5.54s | +22.3% | 3.24s | 4.21s | 0.56s | 0.59s | 0.48s | 0.48s | -0.4% | 5.57s | 5.75s | 0.82x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.76s | 5.57s | +17.0% | 3.37s | 4.24s | 0.56s | 0.59s | 0.53s | 0.48s | -9.6% | 5.58s | 5.69s | 0.85x | - |
| `synthetic-256-sourcemaps` | 10 | 2.03s | 2.23s | +9.6% | 1.51s | 1.71s | 0.25s | 0.25s | 0.15s | 0.13s | -16.7% | 2.22s | 2.25s | 0.91x | - |
| `synthetic-256-ssr-esm` | 10 | 1.76s | 2.05s | +16.7% | 1.27s | 1.56s | 0.24s | 0.25s | 0.15s | 0.13s | -17.1% | 2.05s | 2.14s | 0.86x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.79s | 2.07s | +15.6% | 1.30s | 1.58s | 0.25s | 0.25s | 0.15s | 0.13s | -16.8% | 2.08s | 2.16s | 0.86x | - |
| `synthetic-48-ssr-esm` | 10 | 0.91s | 0.89s | -1.4% | 0.65s | 0.65s | 0.13s | 0.12s | 0.05s | 0.05s | -0.3% | 0.89s | 0.91s | 1.01x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1727.6ms | 5229.7ms | +202.7% | 5229.7ms | 32.7ms | 1785 |
| node | `route:module` | 1785 | 949.9ms | 1653.1ms | +74.0% | 1653.1ms | 9.7ms | 1785 |
| web | `route:client-entry` | 1785 | 389.1ms | 377.7ms | -2.9% | 377.7ms | 5.7ms | 10 |
| node | `manifest:transform` | 5 | 159.2ms | 96.9ms | -39.1% | 96.9ms | 22.4ms | 5 |
| web | `manifest:stage` | 10 | 14.2ms | 14.6ms | +2.8% | 14.6ms | 1.9ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2040.3ms | 3731.3ms | +82.9% | 3731.3ms | 22.6ms | 5130 |
| node | `route:module` | 5130 | 983.2ms | 1830.0ms | +86.1% | 1830.0ms | 6.8ms | 5130 |
| node | `module:client-only-stub` | 5 | 749.7ms | 49.3ms | -93.4% | 49.3ms | 11.8ms | 5 |
| web | `route:client-entry` | 5130 | 649.7ms | 666.2ms | +2.5% | 666.2ms | 7.8ms | 10 |
| node | `manifest:transform` | 5 | 211.0ms | 220.4ms | +4.5% | 220.4ms | 49.7ms | 5 |
| web | `manifest:stage` | 10 | 52.0ms | 66.2ms | +27.3% | 66.2ms | 8.9ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2085.3ms | 3849.2ms | +84.6% | 3849.2ms | 35.5ms | 5130 |
| node | `route:module` | 5130 | 943.6ms | 1809.6ms | +91.8% | 1809.6ms | 10.7ms | 5130 |
| web | `route:client-entry` | 5130 | 644.5ms | 665.6ms | +3.3% | 665.6ms | 7.5ms | 10 |
| node | `manifest:transform` | 5 | 206.2ms | 220.1ms | +6.7% | 220.1ms | 47.4ms | 5 |
| node | `module:client-only-stub` | 5 | 128.8ms | 53.5ms | -58.5% | 53.5ms | 20.2ms | 5 |
| web | `manifest:stage` | 10 | 51.9ms | 55.5ms | +6.9% | 55.5ms | 6.9ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1462.1ms | 3175.2ms | +117.2% | 3175.2ms | 25.1ms | 2581 |
| node | `route:module` | 2580 | 601.3ms | 1158.6ms | +92.7% | 1158.6ms | 6.0ms | 2580 |
| web | `route:client-entry` | 2581 | 394.6ms | 426.8ms | +8.2% | 426.8ms | 5.5ms | 21 |
| node | `manifest:transform` | 10 | 170.5ms | 160.9ms | -5.6% | 160.9ms | 19.8ms | 10 |
| node | `module:client-only-stub` | 10 | 163.1ms | 89.7ms | -45.0% | 89.7ms | 25.3ms | 10 |
| web | `manifest:stage` | 21 | 21.5ms | 21.1ms | -1.9% | 21.1ms | 1.3ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1357.6ms | 2952.7ms | +117.5% | 2952.7ms | 24.6ms | 2582 |
| node | `route:module` | 2580 | 541.9ms | 1095.9ms | +102.2% | 1095.9ms | 6.5ms | 2580 |
| web | `route:client-entry` | 2581 | 390.6ms | 385.2ms | -1.4% | 385.2ms | 6.1ms | 21 |
| node | `manifest:transform` | 10 | 175.9ms | 150.6ms | -14.4% | 150.6ms | 19.1ms | 10 |
| node | `module:client-only-stub` | 10 | 162.1ms | 106.7ms | -34.2% | 106.7ms | 30.6ms | 10 |
| web | `manifest:stage` | 21 | 21.4ms | 21.4ms | +0.0% | 21.4ms | 1.4ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1346.4ms | 2984.7ms | +121.7% | 2984.7ms | 22.2ms | 2582 |
| node | `route:module` | 2580 | 559.9ms | 1063.3ms | +89.9% | 1063.3ms | 7.0ms | 2580 |
| web | `route:client-entry` | 2582 | 396.6ms | 422.3ms | +6.5% | 422.3ms | 5.3ms | 22 |
| node | `manifest:transform` | 10 | 165.7ms | 165.6ms | -0.1% | 165.6ms | 21.4ms | 10 |
| node | `module:client-only-stub` | 10 | 142.7ms | 82.2ms | -42.4% | 82.2ms | 11.5ms | 10 |
| web | `manifest:stage` | 22 | 21.6ms | 25.3ms | +17.1% | 25.3ms | 4.7ms | 22 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 505.1ms | 437.1ms | -13.5% | 437.1ms | 7.0ms | 500 |
| node | `route:module` | 500 | 167.7ms | 171.0ms | +2.0% | 171.0ms | 1.5ms | 500 |
| web | `route:client-entry` | 500 | 107.0ms | 102.9ms | -3.8% | 102.9ms | 3.3ms | 20 |
| node | `module:client-only-stub` | 10 | 73.4ms | 97.0ms | +32.2% | 97.0ms | 13.7ms | 10 |
| node | `manifest:transform` | 10 | 57.0ms | 59.2ms | +3.9% | 59.2ms | 6.9ms | 10 |
| web | `manifest:stage` | 20 | 5.4ms | 5.2ms | -3.7% | 5.2ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 114.11s | 120.42s | +5.5% | 120.42s | - | 0.95x | - |
| complex app | 2 | 84.16s | 77.53s | -7.9% | 77.53s | - | 1.09x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 100.41s | 93.78s | -6.6% | 91.44s | 85.76s | 3.02s | 3.00s | 3.36s | 2.35s | -30.2% | 93.78s | - | 1.07x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28978440236)

