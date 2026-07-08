<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `1bef625` against base `9018ef6`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 27.90s | 43.79s | +56.9% | 18.64s | 23.73s | +27.3% | 3.74s | 3.90s | +4.4% | 3.14s | 3.31s | +5.5% | 0.64x |
| Large app | 1 | 12.99s | 19.92s | +53.3% | 7.95s | 10.68s | +34.3% | 1.86s | 1.98s | +6.6% | 1.65s | 1.83s | +10.3% | 0.65x |
| Standard fixtures | 6 | 14.91s | 23.87s | +60.1% | 10.69s | 13.05s | +22.1% | 1.88s | 1.92s | +2.2% | 1.49s | 1.49s | +0.0% | 0.62x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.37s | 10.60s | +26.6% | 10.57s | 10.78s | 0.79x | 1601 MB |
| `synthetic-1024-ssr-esm` | 5 | 3.96s | 4.36s | +10.0% | 4.41s | 4.59s | 0.91x | 655 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.27s | 6.28s | +19.2% | 6.33s | 6.52s | 0.84x | 836 MB |
| `synthetic-256-sourcemaps` | 10 | 2.10s | 2.27s | +8.2% | 2.30s | 2.52s | 0.92x | 459 MB |
| `synthetic-256-ssr-esm` | 10 | 1.99s | 2.15s | +7.8% | 2.16s | 2.31s | 0.93x | 428 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.33s | 2.66s | +14.0% | 2.68s | 2.83s | 0.88x | 477 MB |
| `synthetic-48-ssr-esm` | 10 | 1.31s | 1.38s | +5.2% | 1.41s | 1.67s | 0.95x | 322 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 12.99s | 19.92s | +53.3% | 7.95s | 10.68s | 1.86s | 1.98s | 1.65s | 1.83s | +10.3% | 19.94s | 20.10s | 0.65x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.35s | 7.61s | +75.0% | 3.09s | 3.95s | 0.51s | 0.55s | 0.50s | 0.53s | +4.9% | 7.61s | 7.64s | 0.57x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.43s | 7.46s | +68.4% | 3.14s | 3.86s | 0.56s | 0.55s | 0.48s | 0.53s | +10.2% | 7.40s | 7.61s | 0.59x | - |
| `synthetic-256-sourcemaps` | 10 | 1.92s | 3.03s | +58.2% | 1.43s | 1.69s | 0.24s | 0.23s | 0.15s | 0.13s | -16.2% | 2.98s | 3.12s | 0.63x | - |
| `synthetic-256-ssr-esm` | 10 | 1.68s | 2.37s | +41.0% | 1.21s | 1.44s | 0.22s | 0.23s | 0.15s | 0.13s | -16.3% | 2.35s | 2.43s | 0.71x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.66s | 2.35s | +41.6% | 1.20s | 1.43s | 0.22s | 0.23s | 0.15s | 0.13s | -16.1% | 2.33s | 2.41s | 0.71x | - |
| `synthetic-48-ssr-esm` | 10 | 0.88s | 1.05s | +19.4% | 0.63s | 0.68s | 0.12s | 0.13s | 0.05s | 0.05s | +0.5% | 1.05s | 1.09s | 0.84x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1716.9ms | 1536.3ms | -10.5% | 1536.3ms | 16.0ms | 10 |
| node | `route:module` | 1785 | 921.3ms | 775.5ms | -15.8% | 775.5ms | 16.8ms | 10 |
| web | `route:client-entry` | 1785 | 388.0ms | 424.1ms | +9.3% | 424.1ms | 10.2ms | 10 |
| node | `manifest:transform` | 5 | 110.8ms | 88.7ms | -19.9% | 88.7ms | 19.9ms | 5 |
| web | `manifest:stage` | 15 | 14.7ms | 20.8ms | +41.5% | 20.8ms | 2.0ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 137.9ms | - | 137.9ms | 14.4ms | 10 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2053.5ms | 1788.9ms | -12.9% | 1788.9ms | 7.6ms | 10 |
| node | `route:module` | 5130 | 925.2ms | 972.6ms | +5.1% | 972.6ms | 17.9ms | 10 |
| web | `route:client-entry` | 5130 | 640.3ms | 643.0ms | +0.4% | 643.0ms | 8.0ms | 10 |
| node | `manifest:transform` | 5 | 213.6ms | 204.4ms | -4.3% | 204.4ms | 44.1ms | 5 |
| node | `module:client-only-stub` | 5 | 137.5ms | 143.6ms | +4.4% | 143.6ms | 64.9ms | 5 |
| web | `manifest:stage` | 15 | 72.3ms | 59.3ms | -18.0% | 59.3ms | 7.1ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.3ms | - | 2.3ms | 0.4ms | 10 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5131 | 1994.5ms | 1781.7ms | -10.7% | 1781.7ms | 8.5ms | 11 |
| node | `route:module` | 5130 | 945.6ms | 941.7ms | -0.4% | 941.7ms | 11.3ms | 10 |
| web | `route:client-entry` | 5131 | 614.0ms | 634.9ms | +3.4% | 634.9ms | 7.8ms | 11 |
| node | `manifest:transform` | 5 | 197.2ms | 203.8ms | +3.3% | 203.8ms | 45.4ms | 5 |
| node | `module:client-only-stub` | 5 | 149.4ms | 83.2ms | -44.3% | 83.2ms | 36.9ms | 5 |
| web | `manifest:stage` | 16 | 58.1ms | 61.4ms | +5.7% | 61.4ms | 6.6ms | 16 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 11 | - | 2.7ms | - | 2.7ms | 0.4ms | 11 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1406.2ms | 1342.7ms | -4.5% | 1342.7ms | 11.8ms | 22 |
| node | `route:module` | 2580 | 598.5ms | 666.0ms | +11.3% | 666.0ms | 7.3ms | 20 |
| web | `route:client-entry` | 2582 | 397.2ms | 420.6ms | +5.9% | 420.6ms | 5.9ms | 22 |
| node | `manifest:transform` | 10 | 147.3ms | 183.5ms | +24.6% | 183.5ms | 24.1ms | 10 |
| node | `module:client-only-stub` | 10 | 81.8ms | 29.2ms | -64.3% | 29.2ms | 7.0ms | 10 |
| web | `manifest:stage` | 33 | 24.1ms | 31.0ms | +28.6% | 31.0ms | 3.5ms | 33 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 23 | - | 6.2ms | - | 6.2ms | 0.4ms | 23 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1302.0ms | 1251.8ms | -3.9% | 1251.8ms | 10.8ms | 22 |
| node | `route:module` | 2580 | 542.6ms | 567.0ms | +4.5% | 567.0ms | 8.3ms | 20 |
| web | `route:client-entry` | 2582 | 383.3ms | 391.6ms | +2.2% | 391.6ms | 5.8ms | 22 |
| node | `module:client-only-stub` | 10 | 197.3ms | 23.4ms | -88.1% | 23.4ms | 3.4ms | 10 |
| node | `manifest:transform` | 10 | 157.3ms | 179.9ms | +14.4% | 179.9ms | 22.4ms | 10 |
| web | `manifest:stage` | 32 | 21.7ms | 32.1ms | +47.9% | 32.1ms | 5.1ms | 32 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 22 | - | 4.5ms | - | 4.5ms | 0.4ms | 22 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2584 | 1285.7ms | 1251.9ms | -2.6% | 1251.9ms | 11.1ms | 24 |
| node | `route:module` | 2580 | 538.8ms | 603.1ms | +11.9% | 603.1ms | 8.1ms | 20 |
| web | `route:client-entry` | 2584 | 375.7ms | 405.5ms | +7.9% | 405.5ms | 5.9ms | 24 |
| node | `manifest:transform` | 10 | 162.2ms | 162.2ms | 0.0% | 162.2ms | 25.6ms | 10 |
| node | `module:client-only-stub` | 10 | 28.9ms | 24.0ms | -17.0% | 24.0ms | 3.2ms | 10 |
| web | `manifest:stage` | 34 | 21.2ms | 29.7ms | +40.1% | 29.7ms | 1.4ms | 34 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 24 | - | 5.2ms | - | 5.2ms | 0.4ms | 24 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 479.6ms | 366.5ms | -23.6% | 366.5ms | 8.4ms | 20 |
| node | `route:module` | 500 | 157.9ms | 139.4ms | -11.7% | 139.4ms | 3.5ms | 20 |
| web | `route:client-entry` | 500 | 107.0ms | 92.9ms | -13.2% | 92.9ms | 2.1ms | 20 |
| node | `module:client-only-stub` | 10 | 72.2ms | 89.1ms | +23.4% | 89.1ms | 18.9ms | 10 |
| node | `manifest:transform` | 10 | 55.5ms | 54.0ms | -2.7% | 54.0ms | 6.3ms | 10 |
| web | `manifest:stage` | 30 | 5.3ms | 7.8ms | +47.2% | 7.8ms | 0.4ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 4.6ms | - | 4.6ms | 0.5ms | 20 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 110.09s | 126.78s | +15.2% | 126.78s | - | 0.87x | - |
| complex app | 2 | 78.78s | 94.60s | +20.1% | 94.60s | - | 0.83x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 93.57s | 108.84s | +16.3% | 85.16s | 95.91s | 2.69s | 3.01s | 3.37s | 3.50s | +3.8% | 108.84s | - | 0.86x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28970488140)

