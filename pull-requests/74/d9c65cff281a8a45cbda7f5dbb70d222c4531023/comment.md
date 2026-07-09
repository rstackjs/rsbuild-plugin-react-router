<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `d9c65cf` against base `602a929`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 28.18s | 37.12s | +31.7% | 18.81s | 21.50s | +14.3% | 3.83s | 3.68s | -3.9% | 3.13s | 2.79s | -10.9% | 0.76x |
| Large app | 1 | 13.25s | 18.41s | +39.0% | 8.09s | 9.55s | +18.0% | 1.90s | 1.85s | -2.7% | 1.69s | 1.75s | +3.7% | 0.72x |
| Standard fixtures | 6 | 14.93s | 18.71s | +25.3% | 10.71s | 11.95s | +11.5% | 1.93s | 1.83s | -5.2% | 1.44s | 1.04s | -28.0% | 0.80x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.58s | 9.44s | +9.9% | 9.49s | 9.62s | 0.91x | 1602 MB |
| `synthetic-1024-ssr-esm` | 5 | 3.90s | 4.01s | +2.6% | 4.01s | 4.18s | 0.97x | 651 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.38s | 5.87s | +9.3% | 5.83s | 6.02s | 0.92x | 865 MB |
| `synthetic-256-sourcemaps` | 10 | 2.14s | 2.17s | +1.2% | 2.18s | 2.30s | 0.99x | 469 MB |
| `synthetic-256-ssr-esm` | 10 | 1.99s | 2.03s | +1.7% | 2.06s | 2.22s | 0.98x | 433 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.36s | 2.50s | +5.8% | 2.52s | 2.70s | 0.94x | 488 MB |
| `synthetic-48-ssr-esm` | 10 | 1.32s | 1.33s | +1.2% | 1.35s | 1.58s | 0.99x | 327 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.25s | 18.41s | +39.0% | 8.09s | 9.55s | 1.90s | 1.85s | 1.69s | 1.75s | +3.7% | 18.33s | 18.56s | 0.72x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.40s | 5.65s | +28.5% | 3.15s | 3.56s | 0.58s | 0.52s | 0.48s | 0.33s | -31.7% | 5.64s | 5.67s | 0.78x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.35s | 5.64s | +29.6% | 3.08s | 3.51s | 0.53s | 0.52s | 0.48s | 0.33s | -31.6% | 5.64s | 5.70s | 0.77x | - |
| `synthetic-256-sourcemaps` | 10 | 1.91s | 2.44s | +27.5% | 1.43s | 1.58s | 0.24s | 0.22s | 0.15s | 0.13s | -16.3% | 2.42s | 2.50s | 0.78x | - |
| `synthetic-256-ssr-esm` | 10 | 1.68s | 2.00s | +18.7% | 1.20s | 1.32s | 0.23s | 0.22s | 0.15s | 0.10s | -32.1% | 1.99s | 2.03s | 0.84x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.70s | 2.02s | +18.7% | 1.21s | 1.34s | 0.24s | 0.22s | 0.13s | 0.10s | -20.2% | 2.02s | 2.04s | 0.84x | - |
| `synthetic-48-ssr-esm` | 10 | 0.89s | 0.96s | +8.8% | 0.64s | 0.64s | 0.12s | 0.12s | 0.05s | 0.05s | -0.4% | 0.97s | 1.02s | 0.92x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1714.6ms | 1528.4ms | -10.9% | 1528.4ms | 12.4ms | 10 |
| node | `route:module` | 1785 | 881.2ms | 789.2ms | -10.4% | 789.2ms | 11.8ms | 10 |
| web | `route:client-entry` | 1785 | 388.3ms | 448.9ms | +15.6% | 448.9ms | 10.6ms | 10 |
| node | `manifest:transform` | 5 | 108.8ms | 98.3ms | -9.7% | 98.3ms | 22.7ms | 5 |
| web | `manifest:stage` | 15 | 14.9ms | 20.4ms | +36.9% | 20.4ms | 2.0ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 134.8ms | - | 134.8ms | 14.6ms | 10 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2073.7ms | 1796.7ms | -13.4% | 1796.7ms | 6.3ms | 10 |
| node | `route:module` | 5130 | 950.8ms | 948.4ms | -0.3% | 948.4ms | 18.0ms | 10 |
| web | `route:client-entry` | 5130 | 626.9ms | 572.8ms | -8.6% | 572.8ms | 7.7ms | 10 |
| node | `manifest:transform` | 5 | 221.4ms | 228.9ms | +3.4% | 228.9ms | 72.5ms | 5 |
| node | `module:client-only-stub` | 5 | 102.5ms | 193.3ms | +88.6% | 193.3ms | 49.8ms | 5 |
| web | `manifest:stage` | 15 | 51.7ms | 60.4ms | +16.8% | 60.4ms | 7.0ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.3ms | - | 2.3ms | 0.4ms | 10 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2064.0ms | 1792.0ms | -13.2% | 1792.0ms | 6.9ms | 10 |
| node | `route:module` | 5130 | 957.1ms | 894.1ms | -6.6% | 894.1ms | 18.8ms | 10 |
| web | `route:client-entry` | 5130 | 606.2ms | 606.6ms | +0.1% | 606.6ms | 8.2ms | 10 |
| node | `manifest:transform` | 5 | 194.6ms | 229.2ms | +17.8% | 229.2ms | 69.4ms | 5 |
| node | `module:client-only-stub` | 5 | 180.5ms | 166.9ms | -7.5% | 166.9ms | 51.1ms | 5 |
| web | `manifest:stage` | 15 | 55.8ms | 60.3ms | +8.1% | 60.3ms | 7.1ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.1ms | - | 2.1ms | 0.4ms | 10 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2583 | 1382.2ms | 1319.3ms | -4.6% | 1319.3ms | 15.1ms | 23 |
| node | `route:module` | 2580 | 578.0ms | 608.6ms | +5.3% | 608.6ms | 6.6ms | 20 |
| web | `route:client-entry` | 2583 | 401.6ms | 400.3ms | -0.3% | 400.3ms | 5.9ms | 23 |
| node | `module:client-only-stub` | 10 | 143.5ms | 31.6ms | -78.0% | 31.6ms | 5.1ms | 10 |
| node | `manifest:transform` | 10 | 142.5ms | 158.8ms | +11.4% | 158.8ms | 21.1ms | 10 |
| web | `manifest:stage` | 33 | 23.2ms | 28.1ms | +21.1% | 28.1ms | 1.4ms | 33 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 23 | - | 5.8ms | - | 5.8ms | 0.4ms | 23 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2583 | 1359.5ms | 1206.1ms | -11.3% | 1206.1ms | 12.8ms | 23 |
| node | `route:module` | 2580 | 563.2ms | 602.7ms | +7.0% | 602.7ms | 12.6ms | 20 |
| web | `route:client-entry` | 2583 | 392.0ms | 396.8ms | +1.2% | 396.8ms | 5.9ms | 23 |
| node | `module:client-only-stub` | 10 | 317.9ms | 27.5ms | -91.3% | 27.5ms | 4.8ms | 10 |
| node | `manifest:transform` | 10 | 153.9ms | 142.1ms | -7.7% | 142.1ms | 20.9ms | 10 |
| web | `manifest:stage` | 33 | 21.8ms | 30.7ms | +40.8% | 30.7ms | 3.1ms | 33 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 23 | - | 4.5ms | - | 4.5ms | 0.4ms | 23 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1323.2ms | 1223.3ms | -7.5% | 1223.3ms | 17.0ms | 21 |
| node | `route:module` | 2580 | 543.3ms | 609.5ms | +12.2% | 609.5ms | 11.4ms | 20 |
| web | `route:client-entry` | 2581 | 399.3ms | 392.0ms | -1.8% | 392.0ms | 5.9ms | 21 |
| node | `manifest:transform` | 10 | 170.4ms | 188.9ms | +10.9% | 188.9ms | 22.2ms | 10 |
| node | `module:client-only-stub` | 10 | 58.3ms | 26.9ms | -53.9% | 26.9ms | 6.5ms | 10 |
| web | `manifest:stage` | 31 | 22.1ms | 34.5ms | +56.1% | 34.5ms | 3.3ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 4.1ms | - | 4.1ms | 0.3ms | 21 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 501 | 501.1ms | 368.4ms | -26.5% | 368.4ms | 9.7ms | 21 |
| node | `route:module` | 500 | 170.5ms | 145.0ms | -15.0% | 145.0ms | 3.9ms | 20 |
| web | `route:client-entry` | 501 | 107.0ms | 85.1ms | -20.5% | 85.1ms | 2.6ms | 21 |
| node | `module:client-only-stub` | 10 | 89.4ms | 88.5ms | -1.0% | 88.5ms | 12.7ms | 10 |
| node | `manifest:transform` | 10 | 53.8ms | 42.5ms | -21.0% | 42.5ms | 6.2ms | 10 |
| web | `manifest:stage` | 32 | 5.1ms | 8.7ms | +70.6% | 8.7ms | 0.4ms | 32 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 22 | - | 4.7ms | - | 4.7ms | 0.4ms | 22 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 116.86s | 135.27s | +15.7% | 135.27s | - | 0.86x | - |
| complex app | 2 | 81.65s | 100.56s | +23.2% | 100.56s | - | 0.81x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 103.05s | 107.05s | +3.9% | 93.92s | 94.30s | 2.86s | 2.88s | 3.77s | 3.52s | -6.6% | 107.05s | - | 0.96x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29050371916)

