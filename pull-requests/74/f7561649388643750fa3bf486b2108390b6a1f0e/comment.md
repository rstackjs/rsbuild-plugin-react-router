<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `f756164` against base `9018ef6`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 27.90s | 40.29s | +44.4% | 18.64s | 21.42s | +14.9% | 3.74s | 3.66s | -2.2% | 3.14s | 3.18s | +1.2% | 0.69x |
| Large app | 1 | 12.99s | 17.96s | +38.2% | 7.95s | 9.34s | +17.6% | 1.86s | 1.78s | -4.0% | 1.65s | 1.69s | +2.4% | 0.72x |
| Standard fixtures | 6 | 14.91s | 22.33s | +49.7% | 10.69s | 12.08s | +13.0% | 1.88s | 1.87s | -0.4% | 1.49s | 1.49s | -0.1% | 0.67x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.37s | 9.31s | +11.2% | 9.37s | 9.53s | 0.90x | 1602 MB |
| `synthetic-1024-ssr-esm` | 5 | 3.96s | 3.95s | -0.3% | 3.99s | 4.19s | 1.00x | 658 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.27s | 5.70s | +8.1% | 5.74s | 5.94s | 0.92x | 870 MB |
| `synthetic-256-sourcemaps` | 10 | 2.10s | 2.13s | +1.3% | 2.14s | 2.31s | 0.99x | 469 MB |
| `synthetic-256-ssr-esm` | 10 | 1.99s | 2.00s | +0.5% | 2.01s | 2.14s | 0.99x | 430 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.33s | 2.46s | +5.4% | 2.47s | 2.65s | 0.95x | 479 MB |
| `synthetic-48-ssr-esm` | 10 | 1.31s | 1.33s | +1.2% | 1.34s | 1.54s | 0.99x | 325 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 12.99s | 17.96s | +38.2% | 7.95s | 9.34s | 1.86s | 1.78s | 1.65s | 1.69s | +2.4% | 18.03s | 18.39s | 0.72x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.35s | 7.05s | +62.2% | 3.09s | 3.56s | 0.51s | 0.54s | 0.50s | 0.53s | +4.9% | 7.08s | 7.19s | 0.62x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.43s | 7.05s | +59.0% | 3.14s | 3.60s | 0.56s | 0.53s | 0.48s | 0.53s | +10.3% | 7.03s | 7.07s | 0.63x | - |
| `synthetic-256-sourcemaps` | 10 | 1.92s | 2.77s | +44.4% | 1.43s | 1.58s | 0.24s | 0.22s | 0.15s | 0.13s | -16.8% | 2.74s | 2.84s | 0.69x | - |
| `synthetic-256-ssr-esm` | 10 | 1.68s | 2.24s | +33.2% | 1.21s | 1.35s | 0.22s | 0.23s | 0.15s | 0.13s | -16.8% | 2.23s | 2.31s | 0.75x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.66s | 2.24s | +35.0% | 1.20s | 1.35s | 0.22s | 0.23s | 0.15s | 0.13s | -16.0% | 2.23s | 2.28s | 0.74x | - |
| `synthetic-48-ssr-esm` | 10 | 0.88s | 0.98s | +12.2% | 0.63s | 0.64s | 0.12s | 0.12s | 0.05s | 0.05s | -0.7% | 0.99s | 1.02s | 0.89x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1716.9ms | 1552.3ms | -9.6% | 1552.3ms | 12.3ms | 10 |
| node | `route:module` | 1785 | 921.3ms | 759.0ms | -17.6% | 759.0ms | 8.6ms | 10 |
| web | `route:client-entry` | 1785 | 388.0ms | 433.0ms | +11.6% | 433.0ms | 9.3ms | 10 |
| node | `manifest:transform` | 5 | 110.8ms | 107.9ms | -2.6% | 107.9ms | 25.7ms | 5 |
| web | `manifest:stage` | 15 | 14.7ms | 19.9ms | +35.4% | 19.9ms | 2.1ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 132.3ms | - | 132.3ms | 14.0ms | 10 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2053.5ms | 1795.1ms | -12.6% | 1795.1ms | 9.8ms | 10 |
| node | `route:module` | 5130 | 925.2ms | 888.4ms | -4.0% | 888.4ms | 11.7ms | 10 |
| web | `route:client-entry` | 5130 | 640.3ms | 596.0ms | -6.9% | 596.0ms | 11.2ms | 10 |
| node | `manifest:transform` | 5 | 213.6ms | 227.5ms | +6.5% | 227.5ms | 53.6ms | 5 |
| node | `module:client-only-stub` | 5 | 137.5ms | 93.2ms | -32.2% | 93.2ms | 42.7ms | 5 |
| web | `manifest:stage` | 15 | 72.3ms | 63.6ms | -12.0% | 63.6ms | 8.7ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.3ms | - | 2.3ms | 0.4ms | 10 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 1994.5ms | 1807.9ms | -9.4% | 1807.9ms | 7.2ms | 10 |
| node | `route:module` | 5130 | 945.6ms | 901.9ms | -4.6% | 901.9ms | 7.1ms | 10 |
| web | `route:client-entry` | 5130 | 614.0ms | 595.9ms | -2.9% | 595.9ms | 8.4ms | 10 |
| node | `manifest:transform` | 5 | 197.2ms | 196.1ms | -0.6% | 196.1ms | 41.1ms | 5 |
| node | `module:client-only-stub` | 5 | 149.4ms | 134.6ms | -9.9% | 134.6ms | 45.7ms | 5 |
| web | `manifest:stage` | 15 | 58.1ms | 61.2ms | +5.3% | 61.2ms | 7.2ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.3ms | - | 2.3ms | 0.4ms | 10 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1406.2ms | 1311.7ms | -6.7% | 1311.7ms | 16.1ms | 22 |
| node | `route:module` | 2580 | 598.5ms | 603.0ms | +0.8% | 603.0ms | 4.8ms | 20 |
| web | `route:client-entry` | 2582 | 397.2ms | 385.3ms | -3.0% | 385.3ms | 5.8ms | 22 |
| node | `manifest:transform` | 10 | 147.3ms | 161.8ms | +9.8% | 161.8ms | 21.8ms | 10 |
| node | `module:client-only-stub` | 10 | 81.8ms | 40.7ms | -50.2% | 40.7ms | 17.1ms | 10 |
| web | `manifest:stage` | 32 | 24.1ms | 29.0ms | +20.3% | 29.0ms | 3.2ms | 32 |
| web | `manifest:transform` | 10 | 1.0ms | 1.1ms | +10.0% | 1.1ms | 0.2ms | 10 |
| node | `assets:relocate-ssr-only` | 22 | - | 5.7ms | - | 5.7ms | 0.4ms | 22 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1302.0ms | 1236.3ms | -5.0% | 1236.3ms | 9.8ms | 22 |
| node | `route:module` | 2580 | 542.6ms | 587.1ms | +8.2% | 587.1ms | 9.8ms | 20 |
| web | `route:client-entry` | 2582 | 383.3ms | 390.5ms | +1.9% | 390.5ms | 6.2ms | 22 |
| node | `module:client-only-stub` | 10 | 197.3ms | 23.0ms | -88.3% | 23.0ms | 2.7ms | 10 |
| node | `manifest:transform` | 10 | 157.3ms | 160.7ms | +2.2% | 160.7ms | 26.1ms | 10 |
| web | `manifest:stage` | 32 | 21.7ms | 28.6ms | +31.8% | 28.6ms | 1.5ms | 32 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 22 | - | 4.9ms | - | 4.9ms | 0.5ms | 22 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1285.7ms | 1225.2ms | -4.7% | 1225.2ms | 14.9ms | 21 |
| node | `route:module` | 2580 | 538.8ms | 565.7ms | +5.0% | 565.7ms | 5.0ms | 20 |
| web | `route:client-entry` | 2581 | 375.7ms | 390.7ms | +4.0% | 390.7ms | 6.1ms | 21 |
| node | `manifest:transform` | 10 | 162.2ms | 154.7ms | -4.6% | 154.7ms | 21.1ms | 10 |
| node | `module:client-only-stub` | 10 | 28.9ms | 35.6ms | +23.2% | 35.6ms | 10.7ms | 10 |
| web | `manifest:stage` | 31 | 21.2ms | 28.0ms | +32.1% | 28.0ms | 1.4ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 4.9ms | - | 4.9ms | 0.6ms | 21 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 479.6ms | 344.2ms | -28.2% | 344.2ms | 7.8ms | 20 |
| node | `route:module` | 500 | 157.9ms | 130.3ms | -17.5% | 130.3ms | 0.6ms | 20 |
| web | `route:client-entry` | 500 | 107.0ms | 85.2ms | -20.4% | 85.2ms | 2.0ms | 20 |
| node | `module:client-only-stub` | 10 | 72.2ms | 69.8ms | -3.3% | 69.8ms | 11.3ms | 10 |
| node | `manifest:transform` | 10 | 55.5ms | 47.6ms | -14.2% | 47.6ms | 6.0ms | 10 |
| web | `manifest:stage` | 30 | 5.3ms | 8.2ms | +54.7% | 8.2ms | 0.4ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 4.0ms | - | 4.0ms | 0.3ms | 20 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 110.09s | 124.45s | +13.1% | 124.45s | - | 0.88x | - |
| complex app | 2 | 78.78s | 86.62s | +9.9% | 86.62s | - | 0.91x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 93.57s | 104.49s | +11.7% | 85.16s | 91.95s | 2.69s | 2.86s | 3.37s | 3.46s | +2.7% | 104.49s | - | 0.90x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28968138430)

