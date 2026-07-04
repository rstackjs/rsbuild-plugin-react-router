<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `492286b` against base `c93ec98`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.47s | 31.56s | +7.1% | 19.72s | 16.00s | -18.9% | 3.97s | 3.05s | -23.1% | 3.27s | 2.95s | -9.7% | 0.93x |
| Large app | 1 | 13.83s | 13.28s | -3.9% | 8.44s | 7.06s | -16.4% | 2.01s | 1.55s | -22.7% | 1.75s | 1.54s | -12.1% | 1.04x |
| Standard fixtures | 6 | 15.65s | 18.28s | +16.8% | 11.28s | 8.94s | -20.7% | 1.96s | 1.50s | -23.5% | 1.52s | 1.41s | -6.8% | 0.86x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.71s | 7.32s | -15.9% | 7.38s | 7.61s | 1.19x | 1495 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.18s | 2.86s | -31.7% | 2.90s | 3.10s | 1.46x | 634 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.57s | 3.90s | -29.9% | 3.92s | 4.13s | 1.43x | 810 MB |
| `synthetic-256-sourcemaps` | 10 | 2.17s | 1.59s | -27.0% | 1.59s | 1.72s | 1.37x | 466 MB |
| `synthetic-256-ssr-esm` | 10 | 2.02s | 1.50s | -25.7% | 1.50s | 1.62s | 1.35x | 414 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.44s | 1.77s | -27.5% | 1.78s | 1.90s | 1.38x | 474 MB |
| `synthetic-48-ssr-esm` | 10 | 1.35s | 1.03s | -23.9% | 1.05s | 1.23s | 1.31x | 323 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.83s | 13.28s | -3.9% | 8.44s | 7.06s | 2.01s | 1.55s | 1.75s | 1.54s | -12.1% | 13.24s | 13.58s | 1.04x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.63s | 6.30s | +36.2% | 3.30s | 2.75s | 0.56s | 0.42s | 0.50s | 0.63s | +25.3% | 6.84s | 8.09s | 0.73x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.60s | 5.42s | +18.0% | 3.29s | 2.56s | 0.54s | 0.43s | 0.51s | 0.40s | -20.5% | 5.54s | 5.97s | 0.85x | - |
| `synthetic-256-sourcemaps` | 10 | 2.00s | 2.21s | +10.3% | 1.50s | 1.20s | 0.25s | 0.18s | 0.15s | 0.13s | -17.2% | 2.38s | 2.70s | 0.91x | - |
| `synthetic-256-ssr-esm` | 10 | 1.76s | 1.90s | +8.3% | 1.27s | 0.99s | 0.24s | 0.18s | 0.15s | 0.10s | -32.7% | 1.91s | 2.07s | 0.92x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.75s | 1.69s | -3.6% | 1.26s | 0.95s | 0.23s | 0.19s | 0.15s | 0.10s | -33.7% | 1.67s | 1.70s | 1.04x | - |
| `synthetic-48-ssr-esm` | 10 | 0.91s | 0.75s | -17.5% | 0.66s | 0.48s | 0.13s | 0.10s | 0.05s | 0.05s | -0.2% | 0.75s | 0.77s | 1.21x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1713.2ms | 1325.0ms | -22.7% | 1325.0ms | 15.7ms | 10 |
| node | `route:module` | 1785 | 910.1ms | 729.2ms | -19.9% | 729.2ms | 11.9ms | 10 |
| web | `route:client-entry` | 1785 | 380.3ms | 361.5ms | -4.9% | 361.5ms | 8.5ms | 10 |
| node | `manifest:transform` | 5 | 141.8ms | 156.0ms | +10.0% | 156.0ms | 38.0ms | 5 |
| web | `manifest:stage` | 15 | 14.4ms | 16.4ms | +13.9% | 16.4ms | 1.7ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 106.3ms | - | 106.3ms | 11.1ms | 10 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2035.1ms | 1549.5ms | -23.9% | 1549.5ms | 11.2ms | 10 |
| node | `route:module` | 5130 | 921.3ms | 780.4ms | -15.3% | 780.4ms | 13.3ms | 10 |
| web | `route:client-entry` | 5130 | 627.2ms | 440.7ms | -29.7% | 440.7ms | 6.0ms | 10 |
| node | `manifest:transform` | 5 | 208.2ms | 186.3ms | -10.5% | 186.3ms | 64.3ms | 5 |
| node | `module:client-only-stub` | 5 | 103.1ms | 163.9ms | +59.0% | 163.9ms | 59.1ms | 5 |
| web | `manifest:stage` | 15 | 59.4ms | 51.8ms | -12.8% | 51.8ms | 6.6ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 1.6ms | - | 1.6ms | 0.3ms | 10 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2056.4ms | 1534.8ms | -25.4% | 1534.8ms | 15.7ms | 10 |
| node | `route:module` | 5130 | 919.2ms | 789.4ms | -14.1% | 789.4ms | 13.2ms | 10 |
| web | `route:client-entry` | 5130 | 603.6ms | 468.1ms | -22.4% | 468.1ms | 6.8ms | 10 |
| node | `module:client-only-stub` | 5 | 469.5ms | 106.4ms | -77.3% | 106.4ms | 37.9ms | 5 |
| node | `manifest:transform` | 5 | 204.7ms | 166.0ms | -18.9% | 166.0ms | 35.2ms | 5 |
| web | `manifest:stage` | 16 | 60.7ms | 55.9ms | -7.9% | 55.9ms | 6.9ms | 16 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 11 | - | 1.8ms | - | 1.8ms | 0.3ms | 11 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1410.9ms | 1089.6ms | -22.8% | 1089.6ms | 11.4ms | 20 |
| node | `route:module` | 2580 | 598.2ms | 524.1ms | -12.4% | 524.1ms | 8.8ms | 20 |
| web | `route:client-entry` | 2580 | 397.2ms | 281.6ms | -29.1% | 281.6ms | 5.2ms | 20 |
| node | `module:client-only-stub` | 10 | 244.6ms | 24.5ms | -90.0% | 24.5ms | 7.7ms | 10 |
| node | `manifest:transform` | 10 | 145.5ms | 120.6ms | -17.1% | 120.6ms | 17.3ms | 10 |
| web | `manifest:stage` | 33 | 20.1ms | 23.5ms | +16.9% | 23.5ms | 1.2ms | 33 |
| web | `manifest:transform` | 10 | 1.0ms | 0.6ms | -40.0% | 0.6ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 23 | - | 4.2ms | - | 4.2ms | 0.3ms | 23 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1358.0ms | 1025.7ms | -24.5% | 1025.7ms | 9.6ms | 20 |
| node | `route:module` | 2580 | 553.6ms | 445.6ms | -19.5% | 445.6ms | 4.5ms | 20 |
| web | `route:client-entry` | 2580 | 383.5ms | 283.0ms | -26.2% | 283.0ms | 5.0ms | 20 |
| node | `module:client-only-stub` | 10 | 195.5ms | 62.9ms | -67.8% | 62.9ms | 16.4ms | 10 |
| node | `manifest:transform` | 10 | 151.0ms | 133.3ms | -11.7% | 133.3ms | 19.6ms | 10 |
| web | `manifest:stage` | 31 | 20.2ms | 22.0ms | +8.9% | 22.0ms | 1.2ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 0.9ms | -10.0% | 0.9ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 3.1ms | - | 3.1ms | 0.2ms | 21 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1325.3ms | 1026.0ms | -22.6% | 1026.0ms | 9.3ms | 22 |
| node | `route:module` | 2580 | 542.4ms | 463.5ms | -14.5% | 463.5ms | 4.7ms | 20 |
| web | `route:client-entry` | 2582 | 380.0ms | 280.9ms | -26.1% | 280.9ms | 5.6ms | 22 |
| node | `manifest:transform` | 10 | 179.8ms | 115.8ms | -35.6% | 115.8ms | 15.8ms | 10 |
| node | `module:client-only-stub` | 10 | 131.9ms | 176.1ms | +33.5% | 176.1ms | 42.5ms | 10 |
| web | `manifest:stage` | 32 | 20.6ms | 25.6ms | +24.3% | 25.6ms | 3.6ms | 32 |
| web | `manifest:transform` | 10 | 1.0ms | 0.7ms | -30.0% | 0.7ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 22 | - | 3.3ms | - | 3.3ms | 0.3ms | 22 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 487.5ms | 319.1ms | -34.5% | 319.1ms | 9.8ms | 20 |
| node | `route:module` | 500 | 163.8ms | 105.4ms | -35.7% | 105.4ms | 0.5ms | 20 |
| web | `route:client-entry` | 500 | 107.7ms | 67.1ms | -37.7% | 67.1ms | 1.7ms | 20 |
| node | `module:client-only-stub` | 10 | 76.8ms | 65.2ms | -15.1% | 65.2ms | 18.2ms | 10 |
| node | `manifest:transform` | 10 | 50.2ms | 36.0ms | -28.3% | 36.0ms | 6.0ms | 10 |
| web | `manifest:stage` | 30 | 5.5ms | 5.6ms | +1.8% | 5.6ms | 0.3ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 0.4ms | -60.0% | 0.4ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 3.0ms | - | 3.0ms | 0.2ms | 20 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 113.46s | 95.07s | -16.2% | 95.07s | - | 1.19x | - |
| complex app | 2 | 78.98s | 65.10s | -17.6% | 65.10s | - | 1.21x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 96.87s | 88.10s | -9.0% | 88.10s | 76.37s | 2.88s | 2.22s | 3.29s | 3.95s | +20.3% | 88.10s | - | 1.10x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28698749317)

