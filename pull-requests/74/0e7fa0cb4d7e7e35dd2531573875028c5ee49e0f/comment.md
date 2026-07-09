<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `0e7fa0c` against base `602a929`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 28.18s | 41.43s | +47.0% | 18.81s | 24.26s | +29.0% | 3.83s | 4.00s | +4.4% | 3.13s | 2.94s | -6.1% | 0.68x |
| Large app | 1 | 13.25s | 20.39s | +53.9% | 8.09s | 10.87s | +34.2% | 1.90s | 2.02s | +6.4% | 1.69s | 1.90s | +12.3% | 0.65x |
| Standard fixtures | 6 | 14.93s | 21.04s | +40.9% | 10.71s | 13.40s | +25.1% | 1.93s | 1.98s | +2.3% | 1.44s | 1.04s | -27.8% | 0.71x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.58s | 10.71s | +24.9% | 10.75s | 10.89s | 0.80x | 1588 MB |
| `synthetic-1024-ssr-esm` | 5 | 3.90s | 4.43s | +13.3% | 4.47s | 4.67s | 0.88x | 668 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.38s | 6.50s | +21.0% | 6.53s | 6.80s | 0.83x | 887 MB |
| `synthetic-256-sourcemaps` | 10 | 2.14s | 2.33s | +8.7% | 2.34s | 2.53s | 0.92x | 461 MB |
| `synthetic-256-ssr-esm` | 10 | 1.99s | 2.17s | +9.2% | 2.19s | 2.34s | 0.92x | 430 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.36s | 2.71s | +14.8% | 2.73s | 2.91s | 0.87x | 484 MB |
| `synthetic-48-ssr-esm` | 10 | 1.32s | 1.41s | +7.4% | 1.46s | 1.73s | 0.93x | 316 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.25s | 20.39s | +53.9% | 8.09s | 10.87s | 1.90s | 2.02s | 1.69s | 1.90s | +12.3% | 20.34s | 20.54s | 0.65x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.40s | 6.35s | +44.4% | 3.15s | 4.00s | 0.58s | 0.56s | 0.48s | 0.33s | -31.5% | 6.34s | 6.37s | 0.69x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.35s | 6.41s | +47.3% | 3.08s | 4.03s | 0.53s | 0.56s | 0.48s | 0.33s | -31.1% | 6.40s | 6.46s | 0.68x | - |
| `synthetic-256-sourcemaps` | 10 | 1.91s | 2.77s | +44.5% | 1.43s | 1.74s | 0.24s | 0.24s | 0.15s | 0.13s | -16.2% | 2.74s | 2.78s | 0.69x | - |
| `synthetic-256-ssr-esm` | 10 | 1.68s | 2.23s | +32.4% | 1.20s | 1.46s | 0.23s | 0.24s | 0.15s | 0.10s | -32.4% | 2.23s | 2.28s | 0.76x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.70s | 2.25s | +32.2% | 1.21s | 1.48s | 0.24s | 0.24s | 0.13s | 0.10s | -20.2% | 2.24s | 2.27s | 0.76x | - |
| `synthetic-48-ssr-esm` | 10 | 0.89s | 1.04s | +16.8% | 0.64s | 0.69s | 0.12s | 0.13s | 0.05s | 0.05s | -0.1% | 1.04s | 1.11s | 0.86x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1714.6ms | 1584.6ms | -7.6% | 1584.6ms | 13.3ms | 10 |
| node | `route:module` | 1785 | 881.2ms | 773.7ms | -12.2% | 773.7ms | 11.3ms | 10 |
| web | `route:client-entry` | 1785 | 388.3ms | 492.9ms | +26.9% | 492.9ms | 10.8ms | 10 |
| node | `manifest:transform` | 5 | 108.8ms | 120.1ms | +10.4% | 120.1ms | 32.8ms | 5 |
| web | `manifest:stage` | 15 | 14.9ms | 20.4ms | +36.9% | 20.4ms | 1.9ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 140.6ms | - | 140.6ms | 15.4ms | 10 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2073.7ms | 1799.9ms | -13.2% | 1799.9ms | 7.9ms | 10 |
| node | `route:module` | 5130 | 950.8ms | 924.3ms | -2.8% | 924.3ms | 8.2ms | 10 |
| web | `route:client-entry` | 5130 | 626.9ms | 596.1ms | -4.9% | 596.1ms | 7.7ms | 10 |
| node | `manifest:transform` | 5 | 221.4ms | 206.8ms | -6.6% | 206.8ms | 43.9ms | 5 |
| node | `module:client-only-stub` | 5 | 102.5ms | 193.5ms | +88.8% | 193.5ms | 59.7ms | 5 |
| web | `manifest:stage` | 15 | 51.7ms | 58.5ms | +13.2% | 58.5ms | 6.5ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.1ms | - | 2.1ms | 0.4ms | 10 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2064.0ms | 1845.2ms | -10.6% | 1845.2ms | 6.5ms | 10 |
| node | `route:module` | 5130 | 957.1ms | 916.6ms | -4.2% | 916.6ms | 15.7ms | 10 |
| web | `route:client-entry` | 5130 | 606.2ms | 639.4ms | +5.5% | 639.4ms | 8.3ms | 10 |
| node | `manifest:transform` | 5 | 194.6ms | 249.7ms | +28.3% | 249.7ms | 77.9ms | 5 |
| node | `module:client-only-stub` | 5 | 180.5ms | 188.7ms | +4.5% | 188.7ms | 58.9ms | 5 |
| web | `manifest:stage` | 15 | 55.8ms | 59.8ms | +7.2% | 59.8ms | 6.8ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.4ms | - | 2.4ms | 0.5ms | 10 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1382.2ms | 1323.5ms | -4.2% | 1323.5ms | 11.4ms | 20 |
| node | `route:module` | 2580 | 578.0ms | 627.7ms | +8.6% | 627.7ms | 6.0ms | 20 |
| web | `route:client-entry` | 2580 | 401.6ms | 380.9ms | -5.2% | 380.9ms | 5.7ms | 20 |
| node | `module:client-only-stub` | 10 | 143.5ms | 24.7ms | -82.8% | 24.7ms | 3.2ms | 10 |
| node | `manifest:transform` | 10 | 142.5ms | 167.8ms | +17.8% | 167.8ms | 23.9ms | 10 |
| web | `manifest:stage` | 31 | 23.2ms | 27.3ms | +17.7% | 27.3ms | 1.4ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 6.2ms | - | 6.2ms | 0.4ms | 21 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1359.5ms | 1258.5ms | -7.4% | 1258.5ms | 10.8ms | 21 |
| node | `route:module` | 2580 | 563.2ms | 610.1ms | +8.3% | 610.1ms | 8.6ms | 20 |
| web | `route:client-entry` | 2581 | 392.0ms | 385.6ms | -1.6% | 385.6ms | 6.0ms | 21 |
| node | `module:client-only-stub` | 10 | 317.9ms | 27.8ms | -91.3% | 27.8ms | 5.0ms | 10 |
| node | `manifest:transform` | 10 | 153.9ms | 155.3ms | +0.9% | 155.3ms | 23.0ms | 10 |
| web | `manifest:stage` | 31 | 21.8ms | 30.8ms | +41.3% | 30.8ms | 3.2ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 4.7ms | - | 4.7ms | 0.4ms | 21 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1323.2ms | 1263.9ms | -4.5% | 1263.9ms | 11.2ms | 20 |
| node | `route:module` | 2580 | 543.3ms | 619.7ms | +14.1% | 619.7ms | 9.0ms | 20 |
| web | `route:client-entry` | 2580 | 399.3ms | 404.4ms | +1.3% | 404.4ms | 5.7ms | 20 |
| node | `manifest:transform` | 10 | 170.4ms | 177.2ms | +4.0% | 177.2ms | 23.8ms | 10 |
| node | `module:client-only-stub` | 10 | 58.3ms | 26.2ms | -55.1% | 26.2ms | 4.8ms | 10 |
| web | `manifest:stage` | 30 | 22.1ms | 27.2ms | +23.1% | 27.2ms | 1.4ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 4.6ms | - | 4.6ms | 0.4ms | 20 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 501.1ms | 379.4ms | -24.3% | 379.4ms | 7.8ms | 20 |
| node | `route:module` | 500 | 170.5ms | 147.0ms | -13.8% | 147.0ms | 0.7ms | 20 |
| web | `route:client-entry` | 500 | 107.0ms | 91.3ms | -14.7% | 91.3ms | 2.1ms | 20 |
| node | `module:client-only-stub` | 10 | 89.4ms | 82.1ms | -8.2% | 82.1ms | 12.7ms | 10 |
| node | `manifest:transform` | 10 | 53.8ms | 46.6ms | -13.4% | 46.6ms | 6.2ms | 10 |
| web | `manifest:stage` | 30 | 5.1ms | 8.1ms | +58.8% | 8.1ms | 0.4ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 5.8ms | - | 5.8ms | 1.1ms | 20 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 116.86s | 130.88s | +12.0% | 130.88s | - | 0.89x | - |
| complex app | 2 | 81.65s | 92.04s | +12.7% | 92.04s | - | 0.89x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 103.05s | 106.59s | +3.4% | 93.92s | 93.92s | 2.86s | 3.02s | 3.77s | 3.34s | -11.3% | 106.59s | - | 0.97x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29054221725)

