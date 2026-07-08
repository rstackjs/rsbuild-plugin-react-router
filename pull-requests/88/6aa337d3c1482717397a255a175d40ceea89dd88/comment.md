<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `6aa337d` against base `602a929`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 30.63s | 30.39s | -0.8% | 20.16s | 20.10s | -0.3% | 4.29s | 4.21s | -1.9% | 3.50s | 3.36s | -3.9% | 1.01x |
| Large app | 1 | 14.45s | 14.40s | -0.3% | 8.71s | 8.70s | -0.1% | 2.13s | 2.09s | -1.7% | 1.91s | 1.88s | -1.8% | 1.00x |
| Standard fixtures | 6 | 16.18s | 15.98s | -1.2% | 11.45s | 11.40s | -0.4% | 2.16s | 2.11s | -2.1% | 1.59s | 1.49s | -6.4% | 1.01x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 9.32s | 9.14s | -1.9% | 9.15s | 9.34s | 1.02x | 1537 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.38s | 4.15s | -5.0% | 4.25s | 4.63s | 1.05x | 649 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.81s | 5.82s | +0.1% | 5.86s | 6.06s | 1.00x | 821 MB |
| `synthetic-256-sourcemaps` | 10 | 2.32s | 2.27s | -1.8% | 2.29s | 2.51s | 1.02x | 456 MB |
| `synthetic-256-ssr-esm` | 10 | 2.17s | 2.12s | -2.1% | 2.14s | 2.33s | 1.02x | 418 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.57s | 2.55s | -0.8% | 2.53s | 2.63s | 1.01x | 455 MB |
| `synthetic-48-ssr-esm` | 10 | 1.37s | 1.39s | +0.9% | 1.39s | 1.58s | 0.99x | 315 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.45s | 14.40s | -0.3% | 8.71s | 8.70s | 2.13s | 2.09s | 1.91s | 1.88s | -1.8% | 14.28s | 14.64s | 1.00x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.68s | 4.68s | -0.1% | 3.29s | 3.28s | 0.62s | 0.59s | 0.50s | 0.50s | -0.6% | 4.65s | 4.74s | 1.00x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.77s | 4.74s | -0.5% | 3.30s | 3.38s | 0.63s | 0.60s | 0.56s | 0.50s | -9.4% | 4.71s | 4.83s | 1.01x | - |
| `synthetic-256-sourcemaps` | 10 | 2.08s | 2.05s | -1.4% | 1.53s | 1.53s | 0.27s | 0.26s | 0.15s | 0.15s | +0.5% | 2.04s | 2.15s | 1.01x | - |
| `synthetic-256-ssr-esm` | 10 | 1.86s | 1.78s | -4.4% | 1.33s | 1.27s | 0.25s | 0.26s | 0.15s | 0.13s | -15.2% | 1.78s | 1.88s | 1.05x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.84s | 1.82s | -1.0% | 1.31s | 1.31s | 0.25s | 0.27s | 0.15s | 0.15s | -0.1% | 1.82s | 1.88s | 1.01x | - |
| `synthetic-48-ssr-esm` | 10 | 0.95s | 0.91s | -4.0% | 0.68s | 0.63s | 0.13s | 0.14s | 0.08s | 0.05s | -31.3% | 0.91s | 0.94s | 1.04x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1771.6ms | 1808.4ms | +2.1% | 1808.4ms | 13.5ms | 10 |
| node | `route:module` | 1785 | 961.5ms | 889.5ms | -7.5% | 889.5ms | 14.8ms | 10 |
| web | `route:client-entry` | 1785 | 397.9ms | 373.2ms | -6.2% | 373.2ms | 6.1ms | 10 |
| node | `manifest:transform` | 5 | 104.3ms | 107.3ms | +2.9% | 107.3ms | 25.4ms | 5 |
| web | `manifest:stage` | 10 | 14.8ms | 14.9ms | +0.7% | 14.9ms | 1.9ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2012.0ms | 2050.1ms | +1.9% | 2050.1ms | 22.7ms | 10 |
| node | `route:module` | 5130 | 957.6ms | 934.8ms | -2.4% | 934.8ms | 6.1ms | 10 |
| web | `route:client-entry` | 5130 | 643.5ms | 639.3ms | -0.7% | 639.3ms | 7.2ms | 10 |
| node | `module:client-only-stub` | 5 | 642.1ms | 115.2ms | -82.1% | 115.2ms | 61.6ms | 5 |
| node | `manifest:transform` | 5 | 212.9ms | 207.5ms | -2.5% | 207.5ms | 47.9ms | 5 |
| web | `manifest:stage` | 10 | 53.5ms | 49.3ms | -7.9% | 49.3ms | 8.2ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2063.6ms | 2127.5ms | +3.1% | 2127.5ms | 21.4ms | 10 |
| node | `route:module` | 5130 | 991.9ms | 943.8ms | -4.8% | 943.8ms | 10.5ms | 10 |
| web | `route:client-entry` | 5130 | 627.4ms | 666.6ms | +6.2% | 666.6ms | 7.4ms | 10 |
| node | `manifest:transform` | 5 | 209.0ms | 219.9ms | +5.2% | 219.9ms | 47.4ms | 5 |
| node | `module:client-only-stub` | 5 | 81.7ms | 89.3ms | +9.3% | 89.3ms | 44.6ms | 5 |
| web | `manifest:stage` | 10 | 55.4ms | 59.7ms | +7.8% | 59.7ms | 8.8ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1460.8ms | 1429.7ms | -2.1% | 1429.7ms | 16.5ms | 20 |
| node | `route:module` | 2580 | 623.8ms | 671.6ms | +7.7% | 671.6ms | 14.6ms | 20 |
| web | `route:client-entry` | 2580 | 401.7ms | 409.9ms | +2.0% | 409.9ms | 5.4ms | 20 |
| node | `module:client-only-stub` | 10 | 183.8ms | 241.3ms | +31.3% | 241.3ms | 118.4ms | 10 |
| node | `manifest:transform` | 10 | 175.3ms | 159.0ms | -9.3% | 159.0ms | 22.2ms | 10 |
| web | `manifest:stage` | 20 | 22.5ms | 21.5ms | -4.4% | 21.5ms | 1.5ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2583 | 1389.6ms | 1444.9ms | +4.0% | 1444.9ms | 21.8ms | 23 |
| node | `route:module` | 2580 | 548.9ms | 565.0ms | +2.9% | 565.0ms | 4.8ms | 20 |
| web | `route:client-entry` | 2583 | 391.9ms | 409.8ms | +4.6% | 409.8ms | 5.6ms | 23 |
| node | `manifest:transform` | 10 | 179.6ms | 178.0ms | -0.9% | 178.0ms | 22.6ms | 10 |
| node | `module:client-only-stub` | 10 | 48.6ms | 265.0ms | +445.3% | 265.0ms | 136.9ms | 10 |
| web | `manifest:stage` | 23 | 23.3ms | 23.2ms | -0.4% | 23.2ms | 1.5ms | 23 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1374.2ms | 1511.8ms | +10.0% | 1511.8ms | 17.1ms | 21 |
| node | `route:module` | 2580 | 553.3ms | 583.3ms | +5.4% | 583.3ms | 4.9ms | 20 |
| web | `route:client-entry` | 2581 | 394.8ms | 423.0ms | +7.1% | 423.0ms | 7.1ms | 21 |
| node | `manifest:transform` | 10 | 181.8ms | 155.7ms | -14.4% | 155.7ms | 19.9ms | 10 |
| node | `module:client-only-stub` | 10 | 88.1ms | 467.2ms | +430.3% | 467.2ms | 177.1ms | 10 |
| web | `manifest:stage` | 21 | 22.2ms | 22.5ms | +1.4% | 22.5ms | 1.5ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 492.4ms | 398.1ms | -19.2% | 398.1ms | 9.2ms | 20 |
| node | `route:module` | 500 | 185.9ms | 160.8ms | -13.5% | 160.8ms | 5.3ms | 20 |
| web | `route:client-entry` | 500 | 110.1ms | 109.0ms | -1.0% | 109.0ms | 3.6ms | 20 |
| node | `module:client-only-stub` | 10 | 85.1ms | 120.2ms | +41.2% | 120.2ms | 29.3ms | 10 |
| node | `manifest:transform` | 10 | 57.3ms | 61.5ms | +7.3% | 61.5ms | 15.3ms | 10 |
| web | `manifest:stage` | 20 | 5.9ms | 6.0ms | +1.7% | 6.0ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 122.19s | 119.94s | -1.8% | 119.94s | - | 1.02x | - |
| complex app | 2 | 85.63s | 87.95s | +2.7% | 87.95s | - | 0.97x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 102.03s | 110.05s | +7.9% | 92.60s | 99.98s | 3.14s | 3.28s | 3.64s | 3.90s | +7.4% | 110.05s | - | 0.93x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28977932695)

