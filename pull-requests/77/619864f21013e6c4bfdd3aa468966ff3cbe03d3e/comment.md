<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `619864f` against base `a512cc2`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 27.96s | 27.99s | +0.1% | 18.70s | 18.61s | -0.5% | 3.79s | 3.90s | +3.0% | 3.16s | 3.15s | -0.3% | 1.00x |
| Large app | 1 | 13.14s | 13.22s | +0.6% | 8.06s | 8.06s | -0.1% | 1.89s | 1.93s | +2.3% | 1.70s | 1.74s | +2.4% | 0.99x |
| Standard fixtures | 6 | 14.82s | 14.77s | -0.4% | 10.64s | 10.56s | -0.8% | 1.90s | 1.97s | +3.6% | 1.46s | 1.41s | -3.4% | 1.00x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.46s | 8.51s | +0.6% | 8.50s | 8.63s | 0.99x | 1523 MB |
| `synthetic-1024-ssr-esm` | 5 | 3.87s | 3.89s | +0.6% | 3.92s | 4.15s | 0.99x | 634 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.24s | 5.27s | +0.7% | 5.24s | 5.44s | 0.99x | 817 MB |
| `synthetic-256-sourcemaps` | 10 | 2.07s | 2.05s | -1.0% | 2.06s | 2.20s | 1.01x | 443 MB |
| `synthetic-256-ssr-esm` | 10 | 1.93s | 1.90s | -1.4% | 1.92s | 2.11s | 1.01x | 399 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.30s | 2.29s | -0.1% | 2.30s | 2.43s | 1.00x | 444 MB |
| `synthetic-48-ssr-esm` | 10 | 1.32s | 1.32s | +0.1% | 1.34s | 1.59s | 1.00x | 316 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.14s | 13.22s | +0.6% | 8.06s | 8.06s | 1.89s | 1.93s | 1.70s | 1.74s | +2.4% | 13.45s | 14.51s | 0.99x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.33s | 4.37s | +1.0% | 3.07s | 3.11s | 0.52s | 0.55s | 0.50s | 0.48s | -4.8% | 4.48s | 4.87s | 0.99x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.35s | 4.36s | +0.1% | 3.09s | 3.07s | 0.57s | 0.58s | 0.48s | 0.48s | +0.0% | 4.36s | 4.42s | 1.00x | - |
| `synthetic-256-sourcemaps` | 10 | 1.91s | 1.88s | -1.9% | 1.42s | 1.41s | 0.24s | 0.22s | 0.15s | 0.15s | +0.1% | 1.88s | 1.91s | 1.02x | - |
| `synthetic-256-ssr-esm` | 10 | 1.68s | 1.64s | -2.4% | 1.21s | 1.17s | 0.22s | 0.24s | 0.15s | 0.13s | -16.4% | 1.64s | 1.73s | 1.02x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.67s | 1.67s | +0.3% | 1.20s | 1.19s | 0.23s | 0.25s | 0.13s | 0.13s | -0.6% | 1.69s | 1.78s | 1.00x | - |
| `synthetic-48-ssr-esm` | 10 | 0.88s | 0.85s | -3.4% | 0.64s | 0.60s | 0.12s | 0.13s | 0.05s | 0.05s | +0.3% | 0.86s | 0.90s | 1.04x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1689.3ms | 1796.6ms | +6.4% | 1796.6ms | 17.4ms | 10 |
| node | `route:module` | 1785 | 838.1ms | 817.9ms | -2.4% | 817.9ms | 8.6ms | 10 |
| web | `route:client-entry` | 1785 | 382.5ms | 356.6ms | -6.8% | 356.6ms | 7.3ms | 10 |
| node | `manifest:transform` | 5 | 102.8ms | 142.9ms | +39.0% | 142.9ms | 45.9ms | 5 |
| web | `manifest:stage` | 10 | 14.5ms | 14.9ms | +2.8% | 14.9ms | 2.0ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2087.4ms | 2021.4ms | -3.2% | 2021.4ms | 22.6ms | 10 |
| node | `route:module` | 5130 | 905.6ms | 956.2ms | +5.6% | 956.2ms | 12.5ms | 10 |
| web | `route:client-entry` | 5130 | 596.4ms | 658.3ms | +10.4% | 658.3ms | 8.0ms | 10 |
| node | `manifest:transform` | 5 | 207.3ms | 224.2ms | +8.2% | 224.2ms | 51.8ms | 5 |
| node | `module:client-only-stub` | 5 | 100.3ms | 252.2ms | +151.4% | 252.2ms | 148.7ms | 5 |
| web | `manifest:stage` | 10 | 67.1ms | 51.6ms | -23.1% | 51.6ms | 8.9ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2082.1ms | 2037.2ms | -2.2% | 2037.2ms | 13.7ms | 10 |
| node | `route:module` | 5130 | 965.6ms | 920.2ms | -4.7% | 920.2ms | 8.0ms | 10 |
| web | `route:client-entry` | 5130 | 631.7ms | 622.4ms | -1.5% | 622.4ms | 12.5ms | 10 |
| node | `manifest:transform` | 5 | 207.7ms | 208.2ms | +0.2% | 208.2ms | 44.5ms | 5 |
| node | `module:client-only-stub` | 5 | 158.0ms | 87.4ms | -44.7% | 87.4ms | 28.7ms | 5 |
| web | `manifest:stage` | 10 | 50.5ms | 59.9ms | +18.6% | 59.9ms | 9.0ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1423.3ms | 1386.7ms | -2.6% | 1386.7ms | 19.3ms | 20 |
| node | `route:module` | 2580 | 590.7ms | 635.1ms | +7.5% | 635.1ms | 9.5ms | 20 |
| web | `route:client-entry` | 2580 | 409.0ms | 393.0ms | -3.9% | 393.0ms | 5.6ms | 20 |
| node | `manifest:transform` | 10 | 150.6ms | 136.3ms | -9.5% | 136.3ms | 18.4ms | 10 |
| node | `module:client-only-stub` | 10 | 92.9ms | 116.2ms | +25.1% | 116.2ms | 57.7ms | 10 |
| web | `manifest:stage` | 20 | 22.9ms | 21.0ms | -8.3% | 21.0ms | 1.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1299.9ms | 1390.8ms | +7.0% | 1390.8ms | 13.0ms | 20 |
| node | `route:module` | 2580 | 579.1ms | 550.6ms | -4.9% | 550.6ms | 9.8ms | 20 |
| web | `route:client-entry` | 2580 | 387.3ms | 390.3ms | +0.8% | 390.3ms | 6.6ms | 20 |
| node | `module:client-only-stub` | 10 | 198.4ms | 396.9ms | +100.1% | 396.9ms | 105.9ms | 10 |
| node | `manifest:transform` | 10 | 162.8ms | 143.3ms | -12.0% | 143.3ms | 17.2ms | 10 |
| web | `manifest:stage` | 20 | 22.0ms | 21.2ms | -3.6% | 21.2ms | 1.5ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1318.0ms | 1387.7ms | +5.3% | 1387.7ms | 19.0ms | 21 |
| node | `route:module` | 2580 | 575.3ms | 556.2ms | -3.3% | 556.2ms | 4.8ms | 20 |
| web | `route:client-entry` | 2581 | 376.3ms | 413.3ms | +9.8% | 413.3ms | 6.4ms | 21 |
| node | `manifest:transform` | 10 | 144.5ms | 163.3ms | +13.0% | 163.3ms | 23.6ms | 10 |
| node | `module:client-only-stub` | 10 | 63.1ms | 256.6ms | +306.7% | 256.6ms | 135.8ms | 10 |
| web | `manifest:stage` | 21 | 21.6ms | 22.0ms | +1.9% | 22.0ms | 1.5ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 489.0ms | 398.3ms | -18.5% | 398.3ms | 10.3ms | 20 |
| node | `route:module` | 500 | 175.1ms | 157.8ms | -9.9% | 157.8ms | 6.5ms | 20 |
| web | `route:client-entry` | 500 | 103.7ms | 110.3ms | +6.4% | 110.3ms | 3.5ms | 20 |
| node | `module:client-only-stub` | 10 | 76.0ms | 106.6ms | +40.3% | 106.6ms | 17.9ms | 10 |
| node | `manifest:transform` | 10 | 50.4ms | 49.8ms | -1.2% | 49.8ms | 6.1ms | 10 |
| web | `manifest:stage` | 20 | 5.3ms | 5.9ms | +11.3% | 5.9ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 111.91s | 114.20s | +2.1% | 114.20s | - | 0.98x | - |
| complex app | 2 | 76.84s | 85.09s | +10.7% | 85.09s | - | 0.90x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 94.79s | 96.73s | +2.0% | 85.58s | 88.29s | 2.66s | 2.67s | 3.29s | 3.31s | +0.7% | 96.73s | - | 0.98x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28843325701)

