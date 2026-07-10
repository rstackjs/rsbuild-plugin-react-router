<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `fa46661` against base `b072c88`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 42.91s | 43.07s | +0.4% | 23.58s | 23.53s | -0.2% | 3.79s | 3.73s | -1.7% | 3.18s | 3.13s | -1.6% | 1.00x |
| Large app | 1 | 19.34s | 19.33s | -0.0% | 10.48s | 10.46s | -0.2% | 1.89s | 1.88s | -0.7% | 1.72s | 1.69s | -1.6% | 1.00x |
| Standard fixtures | 6 | 23.58s | 23.73s | +0.7% | 13.10s | 13.08s | -0.2% | 1.90s | 1.85s | -2.6% | 1.46s | 1.44s | -1.7% | 0.99x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 10.35s | 10.27s | -0.7% | 10.29s | 10.52s | 1.01x | 1598 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.44s | 4.37s | -1.5% | 4.40s | 4.59s | 1.02x | 649 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 6.53s | 6.24s | -4.4% | 6.29s | 6.57s | 1.05x | 861 MB |
| `synthetic-256-sourcemaps` | 10 | 2.29s | 2.25s | -1.8% | 2.26s | 2.45s | 1.02x | 463 MB |
| `synthetic-256-ssr-esm` | 10 | 2.15s | 2.12s | -1.5% | 2.13s | 2.28s | 1.02x | 432 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.71s | 2.65s | -1.9% | 2.66s | 2.83s | 1.02x | 488 MB |
| `synthetic-48-ssr-esm` | 10 | 1.42s | 1.36s | -4.6% | 1.38s | 1.61s | 1.05x | 326 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 19.34s | 19.33s | -0.0% | 10.48s | 10.46s | 1.89s | 1.88s | 1.72s | 1.69s | -1.6% | 19.29s | 19.37s | 1.00x | - |
| `synthetic-1024-ssr-esm` | 5 | 7.50s | 7.49s | -0.2% | 3.91s | 3.94s | 0.53s | 0.53s | 0.51s | 0.50s | -0.4% | 7.49s | 7.58s | 1.00x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 7.52s | 7.48s | -0.6% | 3.91s | 3.92s | 0.53s | 0.52s | 0.53s | 0.50s | -4.1% | 7.48s | 7.50s | 1.01x | - |
| `synthetic-256-sourcemaps` | 10 | 2.71s | 3.00s | +10.7% | 1.69s | 1.68s | 0.22s | 0.22s | 0.13s | 0.13s | -1.0% | 2.95s | 3.07s | 0.90x | - |
| `synthetic-256-ssr-esm` | 10 | 2.40s | 2.35s | -2.4% | 1.46s | 1.43s | 0.24s | 0.22s | 0.13s | 0.13s | -0.1% | 2.35s | 2.47s | 1.02x | - |
| `synthetic-256-ssr-esm-split` | 10 | 2.39s | 2.39s | +0.0% | 1.45s | 1.43s | 0.24s | 0.22s | 0.13s | 0.13s | -0.1% | 2.36s | 2.42s | 1.00x | - |
| `synthetic-48-ssr-esm` | 10 | 1.05s | 1.03s | -2.0% | 0.68s | 0.66s | 0.13s | 0.13s | 0.05s | 0.05s | +1.3% | 1.03s | 1.08s | 1.02x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1527.5ms | 1515.1ms | -0.8% | 1515.1ms | 13.3ms | 10 |
| node | `route:module` | 1785 | 768.5ms | 759.4ms | -1.2% | 759.4ms | 10.0ms | 10 |
| web | `route:client-entry` | 1785 | 480.1ms | 434.4ms | -9.5% | 434.4ms | 9.5ms | 10 |
| node | `assets:relocate-ssr-only` | 10 | 136.3ms | 138.5ms | +1.6% | 138.5ms | 14.6ms | 10 |
| node | `manifest:transform` | 5 | 104.8ms | 102.6ms | -2.1% | 102.6ms | 22.4ms | 5 |
| web | `manifest:stage` | 15 | 19.4ms | 19.0ms | -2.1% | 19.0ms | 1.9ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 1767.5ms | 1792.2ms | +1.4% | 1792.2ms | 7.4ms | 10 |
| node | `route:module` | 5130 | 941.2ms | 915.3ms | -2.8% | 915.3ms | 9.2ms | 10 |
| web | `route:client-entry` | 5130 | 618.1ms | 607.0ms | -1.8% | 607.0ms | 7.4ms | 10 |
| node | `manifest:transform` | 5 | 233.3ms | 194.0ms | -16.8% | 194.0ms | 41.6ms | 5 |
| node | `module:client-only-stub` | 5 | 150.5ms | 226.9ms | +50.8% | 226.9ms | 72.0ms | 5 |
| web | `manifest:stage` | 15 | 56.9ms | 56.8ms | -0.2% | 56.8ms | 6.4ms | 15 |
| node | `assets:relocate-ssr-only` | 10 | 2.1ms | 2.4ms | +14.3% | 2.4ms | 0.4ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 1763.6ms | 1761.8ms | -0.1% | 1761.8ms | 7.6ms | 10 |
| node | `route:module` | 5130 | 917.4ms | 915.3ms | -0.2% | 915.3ms | 5.7ms | 10 |
| web | `route:client-entry` | 5130 | 606.9ms | 613.3ms | +1.1% | 613.3ms | 7.5ms | 10 |
| node | `module:client-only-stub` | 5 | 255.6ms | 260.4ms | +1.9% | 260.4ms | 72.8ms | 5 |
| node | `manifest:transform` | 5 | 219.2ms | 201.1ms | -8.3% | 201.1ms | 46.1ms | 5 |
| web | `manifest:stage` | 15 | 58.8ms | 60.1ms | +2.2% | 60.1ms | 7.8ms | 15 |
| node | `assets:relocate-ssr-only` | 10 | 2.3ms | 2.4ms | +4.3% | 2.4ms | 0.4ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1327.7ms | 1321.9ms | -0.4% | 1321.9ms | 11.4ms | 22 |
| node | `route:module` | 2580 | 593.3ms | 608.6ms | +2.6% | 608.6ms | 5.0ms | 20 |
| web | `route:client-entry` | 2582 | 414.4ms | 381.5ms | -7.9% | 381.5ms | 5.2ms | 22 |
| node | `manifest:transform` | 10 | 154.4ms | 170.7ms | +10.6% | 170.7ms | 21.5ms | 10 |
| node | `module:client-only-stub` | 10 | 49.2ms | 21.0ms | -57.3% | 21.0ms | 2.3ms | 10 |
| web | `manifest:stage` | 32 | 31.5ms | 27.1ms | -14.0% | 27.1ms | 1.3ms | 32 |
| node | `assets:relocate-ssr-only` | 22 | 6.7ms | 5.7ms | -14.9% | 5.7ms | 0.4ms | 22 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1279.1ms | 1261.2ms | -1.4% | 1261.2ms | 10.7ms | 22 |
| node | `route:module` | 2580 | 520.4ms | 570.4ms | +9.6% | 570.4ms | 6.2ms | 20 |
| web | `route:client-entry` | 2582 | 461.5ms | 393.0ms | -14.8% | 393.0ms | 5.8ms | 22 |
| node | `manifest:transform` | 10 | 171.1ms | 167.3ms | -2.2% | 167.3ms | 20.4ms | 10 |
| node | `module:client-only-stub` | 10 | 42.5ms | 21.5ms | -49.4% | 21.5ms | 3.4ms | 10 |
| web | `manifest:stage` | 32 | 26.0ms | 27.6ms | +6.2% | 27.6ms | 1.3ms | 32 |
| node | `assets:relocate-ssr-only` | 22 | 4.0ms | 4.5ms | +12.5% | 4.5ms | 0.4ms | 22 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1294.5ms | 1262.3ms | -2.5% | 1262.3ms | 10.8ms | 22 |
| node | `route:module` | 2580 | 565.1ms | 568.3ms | +0.6% | 568.3ms | 4.7ms | 20 |
| web | `route:client-entry` | 2582 | 432.3ms | 414.4ms | -4.1% | 414.4ms | 5.4ms | 22 |
| node | `manifest:transform` | 10 | 148.0ms | 168.5ms | +13.9% | 168.5ms | 23.2ms | 10 |
| web | `manifest:stage` | 32 | 28.8ms | 27.2ms | -5.6% | 27.2ms | 1.3ms | 32 |
| node | `module:client-only-stub` | 10 | 19.4ms | 20.2ms | +4.1% | 20.2ms | 2.3ms | 10 |
| node | `assets:relocate-ssr-only` | 22 | 4.7ms | 4.3ms | -8.5% | 4.3ms | 0.4ms | 22 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 362.8ms | 367.1ms | +1.2% | 367.1ms | 10.0ms | 20 |
| node | `route:module` | 500 | 122.4ms | 143.7ms | +17.4% | 143.7ms | 0.6ms | 20 |
| web | `route:client-entry` | 500 | 92.7ms | 90.7ms | -2.2% | 90.7ms | 1.9ms | 20 |
| node | `module:client-only-stub` | 10 | 63.9ms | 72.4ms | +13.3% | 72.4ms | 12.1ms | 10 |
| node | `manifest:transform` | 10 | 42.3ms | 47.6ms | +12.5% | 47.6ms | 6.3ms | 10 |
| web | `manifest:stage` | 30 | 7.4ms | 7.6ms | +2.7% | 7.6ms | 0.4ms | 30 |
| node | `assets:relocate-ssr-only` | 20 | 4.6ms | 4.2ms | -8.7% | 4.2ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 116.23s | 117.18s | +0.8% | 117.18s | - | 0.99x | - |
| complex app | 2 | 83.19s | 83.98s | +0.9% | 83.98s | - | 0.99x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 100.85s | 100.86s | +0.0% | 88.71s | 88.89s | 2.94s | 2.87s | 3.22s | 3.12s | -2.9% | 100.86s | - | 1.00x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29062542019)

