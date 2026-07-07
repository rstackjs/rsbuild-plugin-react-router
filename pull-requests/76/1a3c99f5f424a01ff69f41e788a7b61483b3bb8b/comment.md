<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `1a3c99f` against base `18fb279`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 26.46s | 26.47s | +0.0% | 17.69s | 17.73s | +0.2% | 3.63s | 3.71s | +2.2% | 2.98s | 2.92s | -2.1% | 1.00x |
| Large app | 1 | 12.45s | 12.53s | +0.7% | 7.63s | 7.68s | +0.7% | 1.78s | 1.79s | +0.7% | 1.62s | 1.65s | +2.1% | 0.99x |
| Standard fixtures | 6 | 14.01s | 13.94s | -0.5% | 10.07s | 10.05s | -0.1% | 1.85s | 1.92s | +3.7% | 1.36s | 1.26s | -7.1% | 1.01x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.05s | 8.06s | +0.0% | 8.06s | 8.19s | 1.00x | 1520 MB |
| `synthetic-1024-ssr-esm` | 5 | 3.58s | 3.67s | +2.5% | 3.72s | 3.95s | 0.98x | 621 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 4.92s | 4.87s | -0.9% | 4.92s | 5.12s | 1.01x | 799 MB |
| `synthetic-256-sourcemaps` | 10 | 1.95s | 1.91s | -1.9% | 1.92s | 2.07s | 1.02x | 429 MB |
| `synthetic-256-ssr-esm` | 10 | 1.79s | 1.79s | +0.4% | 1.80s | 1.95s | 1.00x | 400 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.16s | 2.14s | -0.9% | 2.15s | 2.29s | 1.01x | 441 MB |
| `synthetic-48-ssr-esm` | 10 | 1.22s | 1.22s | -0.6% | 1.23s | 1.43s | 1.01x | 317 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 12.45s | 12.53s | +0.7% | 7.63s | 7.68s | 1.78s | 1.79s | 1.62s | 1.65s | +2.1% | 12.55s | 12.67s | 0.99x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.15s | 4.15s | +0.0% | 2.98s | 2.99s | 0.56s | 0.56s | 0.43s | 0.43s | -0.2% | 4.13s | 4.18s | 1.00x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.09s | 4.06s | -0.9% | 2.90s | 2.91s | 0.51s | 0.55s | 0.48s | 0.41s | -14.8% | 4.08s | 4.13s | 1.01x | - |
| `synthetic-256-sourcemaps` | 10 | 1.81s | 1.80s | -0.3% | 1.33s | 1.34s | 0.24s | 0.22s | 0.13s | 0.13s | +0.3% | 1.79s | 1.84s | 1.00x | - |
| `synthetic-256-ssr-esm` | 10 | 1.57s | 1.56s | -0.8% | 1.13s | 1.12s | 0.22s | 0.24s | 0.15s | 0.13s | -16.1% | 1.55s | 1.59s | 1.01x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.57s | 1.56s | -0.9% | 1.14s | 1.12s | 0.22s | 0.23s | 0.13s | 0.13s | -1.2% | 1.57s | 1.61s | 1.01x | - |
| `synthetic-48-ssr-esm` | 10 | 0.82s | 0.81s | -1.0% | 0.59s | 0.57s | 0.11s | 0.12s | 0.05s | 0.05s | +0.3% | 0.81s | 0.84s | 1.01x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1733.7ms | 1678.3ms | -3.2% | 1678.3ms | 23.7ms | 10 |
| node | `route:module` | 1785 | 859.7ms | 835.2ms | -2.8% | 835.2ms | 11.7ms | 10 |
| web | `route:client-entry` | 1785 | 356.7ms | 332.3ms | -6.8% | 332.3ms | 5.0ms | 10 |
| node | `manifest:transform` | 5 | 107.8ms | 106.0ms | -1.7% | 106.0ms | 27.1ms | 5 |
| web | `manifest:stage` | 10 | 13.9ms | 13.8ms | -0.7% | 13.8ms | 1.9ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 1944.6ms | 1971.4ms | +1.4% | 1971.4ms | 18.2ms | 10 |
| node | `route:module` | 5130 | 917.2ms | 919.0ms | +0.2% | 919.0ms | 12.7ms | 10 |
| web | `route:client-entry` | 5130 | 565.2ms | 566.2ms | +0.2% | 566.2ms | 6.0ms | 10 |
| node | `manifest:transform` | 5 | 177.4ms | 187.6ms | +5.7% | 187.6ms | 38.2ms | 5 |
| web | `manifest:stage` | 10 | 56.4ms | 57.2ms | +1.4% | 57.2ms | 9.0ms | 10 |
| node | `module:client-only-stub` | 5 | 55.0ms | 122.0ms | +121.8% | 122.0ms | 43.2ms | 5 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 1915.3ms | 1986.9ms | +3.7% | 1986.9ms | 36.6ms | 10 |
| node | `route:module` | 5130 | 931.7ms | 914.3ms | -1.9% | 914.3ms | 5.4ms | 10 |
| web | `route:client-entry` | 5130 | 577.3ms | 550.3ms | -4.7% | 550.3ms | 6.3ms | 10 |
| node | `module:client-only-stub` | 5 | 282.0ms | 186.8ms | -33.8% | 186.8ms | 79.3ms | 5 |
| node | `manifest:transform` | 5 | 193.7ms | 186.3ms | -3.8% | 186.3ms | 41.0ms | 5 |
| web | `manifest:stage` | 10 | 70.5ms | 56.5ms | -19.9% | 56.5ms | 9.0ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2583 | 1335.5ms | 1312.7ms | -1.7% | 1312.7ms | 18.6ms | 23 |
| node | `route:module` | 2580 | 570.3ms | 596.5ms | +4.6% | 596.5ms | 4.1ms | 20 |
| web | `route:client-entry` | 2583 | 353.2ms | 366.3ms | +3.7% | 366.3ms | 4.5ms | 23 |
| node | `module:client-only-stub` | 10 | 240.7ms | 128.3ms | -46.7% | 128.3ms | 41.6ms | 10 |
| node | `manifest:transform` | 10 | 145.8ms | 152.5ms | +4.6% | 152.5ms | 19.8ms | 10 |
| web | `manifest:stage` | 23 | 21.5ms | 22.1ms | +2.8% | 22.1ms | 1.6ms | 23 |
| web | `manifest:transform` | 10 | 0.9ms | 1.0ms | +11.1% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1207.2ms | 1285.1ms | +6.5% | 1285.1ms | 14.4ms | 20 |
| node | `route:module` | 2580 | 547.4ms | 513.6ms | -6.2% | 513.6ms | 8.7ms | 20 |
| web | `route:client-entry` | 2580 | 358.5ms | 374.1ms | +4.4% | 374.1ms | 4.7ms | 20 |
| node | `module:client-only-stub` | 10 | 195.1ms | 182.4ms | -6.5% | 182.4ms | 132.7ms | 10 |
| node | `manifest:transform` | 10 | 137.4ms | 134.0ms | -2.5% | 134.0ms | 16.6ms | 10 |
| web | `manifest:stage` | 20 | 20.2ms | 20.4ms | +1.0% | 20.4ms | 1.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1241.4ms | 1295.6ms | +4.4% | 1295.6ms | 14.3ms | 22 |
| node | `route:module` | 2580 | 528.5ms | 527.3ms | -0.2% | 527.3ms | 4.6ms | 20 |
| web | `route:client-entry` | 2582 | 361.1ms | 365.7ms | +1.3% | 365.7ms | 5.5ms | 22 |
| node | `manifest:transform` | 10 | 136.4ms | 167.9ms | +23.1% | 167.9ms | 20.1ms | 10 |
| node | `module:client-only-stub` | 10 | 118.6ms | 207.3ms | +74.8% | 207.3ms | 90.2ms | 10 |
| web | `manifest:stage` | 22 | 20.2ms | 21.5ms | +6.4% | 21.5ms | 1.3ms | 22 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 447.3ms | 407.9ms | -8.8% | 407.9ms | 8.7ms | 20 |
| node | `route:module` | 500 | 143.2ms | 145.7ms | +1.7% | 145.7ms | 0.6ms | 20 |
| node | `module:client-only-stub` | 10 | 101.7ms | 86.3ms | -15.1% | 86.3ms | 12.5ms | 10 |
| web | `route:client-entry` | 500 | 97.4ms | 106.4ms | +9.2% | 106.4ms | 3.0ms | 20 |
| node | `manifest:transform` | 10 | 56.4ms | 44.7ms | -20.7% | 44.7ms | 5.6ms | 10 |
| web | `manifest:stage` | 20 | 5.0ms | 5.2ms | +4.0% | 5.2ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 0.9ms | 1.0ms | +11.1% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 105.45s | 105.85s | +0.4% | 105.85s | - | 1.00x | - |
| complex app | 2 | 73.10s | 72.44s | -0.9% | 72.44s | - | 1.01x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 88.64s | 89.33s | +0.8% | 80.81s | 81.44s | 2.55s | 2.56s | 3.12s | 3.11s | -0.3% | 89.33s | - | 0.99x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28843662759)

