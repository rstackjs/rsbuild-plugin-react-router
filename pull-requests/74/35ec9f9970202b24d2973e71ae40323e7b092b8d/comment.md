<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `35ec9f9` against base `9018ef6`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 30.46s | 37.63s | +23.6% | 20.22s | 20.86s | +3.2% | 4.17s | 3.42s | -18.0% | 3.49s | 3.12s | -10.7% | 0.81x |
| Large app | 1 | 14.31s | 18.56s | +29.7% | 8.66s | 9.65s | +11.4% | 2.10s | 1.69s | -19.2% | 1.90s | 1.95s | +2.6% | 0.77x |
| Standard fixtures | 6 | 16.14s | 19.07s | +18.1% | 11.55s | 11.21s | -3.0% | 2.07s | 1.72s | -16.8% | 1.59s | 1.17s | -26.5% | 0.85x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.89s | 9.43s | +6.0% | 9.46s | 9.82s | 0.94x | 1616 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.21s | 3.62s | -13.9% | 3.63s | 3.78s | 1.16x | 644 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.68s | 5.32s | -6.4% | 5.36s | 5.84s | 1.07x | 875 MB |
| `synthetic-256-sourcemaps` | 10 | 2.24s | 1.93s | -14.1% | 1.94s | 2.09s | 1.16x | 465 MB |
| `synthetic-256-ssr-esm` | 10 | 2.09s | 1.81s | -13.4% | 1.82s | 1.98s | 1.15x | 441 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.48s | 2.25s | -9.3% | 2.28s | 2.61s | 1.10x | 487 MB |
| `synthetic-48-ssr-esm` | 10 | 1.36s | 1.17s | -13.7% | 1.20s | 1.41s | 1.16x | 328 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.31s | 18.56s | +29.7% | 8.66s | 9.65s | 2.10s | 1.69s | 1.90s | 1.95s | +2.6% | 19.45s | 21.01s | 0.77x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.76s | 5.67s | +19.1% | 3.36s | 3.28s | 0.60s | 0.49s | 0.50s | 0.31s | -38.8% | 5.58s | 6.28s | 0.84x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.81s | 5.99s | +24.6% | 3.40s | 3.42s | 0.59s | 0.50s | 0.56s | 0.40s | -27.4% | 5.89s | 6.24s | 0.80x | - |
| `synthetic-256-sourcemaps` | 10 | 2.08s | 2.51s | +20.3% | 1.55s | 1.52s | 0.27s | 0.21s | 0.15s | 0.13s | -16.2% | 2.47s | 2.62s | 0.83x | - |
| `synthetic-256-ssr-esm` | 10 | 1.76s | 2.06s | +16.9% | 1.27s | 1.22s | 0.24s | 0.20s | 0.15s | 0.10s | -33.3% | 2.11s | 2.60s | 0.86x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.80s | 1.97s | +9.0% | 1.30s | 1.21s | 0.25s | 0.21s | 0.15s | 0.18s | +17.5% | 2.05s | 2.58s | 0.92x | - |
| `synthetic-48-ssr-esm` | 10 | 0.92s | 0.87s | -5.5% | 0.67s | 0.56s | 0.13s | 0.11s | 0.08s | 0.05s | -32.3% | 0.89s | 1.03s | 1.06x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1810.3ms | 1443.2ms | -20.3% | 1443.2ms | 11.4ms | 10 |
| node | `route:module` | 1785 | 949.3ms | 708.6ms | -25.4% | 708.6ms | 14.6ms | 10 |
| web | `route:client-entry` | 1785 | 410.5ms | 424.7ms | +3.5% | 424.7ms | 9.8ms | 10 |
| node | `manifest:transform` | 5 | 118.3ms | 103.8ms | -12.3% | 103.8ms | 29.8ms | 5 |
| web | `manifest:stage` | 15 | 18.6ms | 18.8ms | +1.1% | 18.8ms | 1.9ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 122.5ms | - | 122.5ms | 13.3ms | 10 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5131 | 2119.2ms | 1567.9ms | -26.0% | 1567.9ms | 9.2ms | 11 |
| node | `route:module` | 5130 | 971.4ms | 793.5ms | -18.3% | 793.5ms | 18.8ms | 10 |
| web | `route:client-entry` | 5131 | 620.8ms | 507.0ms | -18.3% | 507.0ms | 6.6ms | 11 |
| node | `manifest:transform` | 5 | 225.0ms | 202.2ms | -10.1% | 202.2ms | 68.9ms | 5 |
| node | `module:client-only-stub` | 5 | 60.3ms | 106.4ms | +76.5% | 106.4ms | 32.2ms | 5 |
| web | `manifest:stage` | 16 | 60.0ms | 54.9ms | -8.5% | 54.9ms | 6.2ms | 16 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 11 | - | 2.4ms | - | 2.4ms | 0.4ms | 11 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2124.8ms | 1596.1ms | -24.9% | 1596.1ms | 9.1ms | 10 |
| node | `route:module` | 5130 | 973.0ms | 845.3ms | -13.1% | 845.3ms | 19.7ms | 10 |
| web | `route:client-entry` | 5130 | 638.2ms | 539.0ms | -15.5% | 539.0ms | 7.6ms | 10 |
| node | `manifest:transform` | 5 | 219.5ms | 192.2ms | -12.4% | 192.2ms | 58.2ms | 5 |
| node | `module:client-only-stub` | 5 | 124.7ms | 164.2ms | +31.7% | 164.2ms | 52.8ms | 5 |
| web | `manifest:stage` | 15 | 67.6ms | 52.5ms | -22.3% | 52.5ms | 6.3ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.0ms | - | 2.0ms | 0.3ms | 10 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1450.3ms | 1205.0ms | -16.9% | 1205.0ms | 13.0ms | 21 |
| node | `route:module` | 2580 | 609.4ms | 596.4ms | -2.1% | 596.4ms | 5.8ms | 20 |
| web | `route:client-entry` | 2581 | 410.2ms | 336.5ms | -18.0% | 336.5ms | 6.3ms | 21 |
| node | `module:client-only-stub` | 10 | 193.8ms | 27.0ms | -86.1% | 27.0ms | 4.3ms | 10 |
| node | `manifest:transform` | 10 | 171.7ms | 137.0ms | -20.2% | 137.0ms | 24.7ms | 10 |
| web | `manifest:stage` | 31 | 24.3ms | 25.2ms | +3.7% | 25.2ms | 1.3ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 5.4ms | - | 5.4ms | 0.4ms | 21 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1351.2ms | 1032.7ms | -23.6% | 1032.7ms | 12.3ms | 20 |
| node | `route:module` | 2580 | 539.8ms | 522.5ms | -3.2% | 522.5ms | 6.0ms | 20 |
| web | `route:client-entry` | 2580 | 395.6ms | 333.4ms | -15.7% | 333.4ms | 6.6ms | 20 |
| node | `manifest:transform` | 10 | 166.0ms | 140.4ms | -15.4% | 140.4ms | 17.2ms | 10 |
| node | `module:client-only-stub` | 10 | 96.2ms | 29.5ms | -69.3% | 29.5ms | 7.0ms | 10 |
| web | `manifest:stage` | 30 | 20.2ms | 30.7ms | +52.0% | 30.7ms | 3.0ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 0.9ms | -10.0% | 0.9ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 4.0ms | - | 4.0ms | 0.3ms | 20 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1414.3ms | 1054.1ms | -25.5% | 1054.1ms | 14.2ms | 21 |
| node | `route:module` | 2580 | 564.9ms | 520.0ms | -7.9% | 520.0ms | 10.0ms | 20 |
| web | `route:client-entry` | 2581 | 401.9ms | 321.5ms | -20.0% | 321.5ms | 5.7ms | 21 |
| node | `manifest:transform` | 10 | 162.1ms | 141.8ms | -12.5% | 141.8ms | 17.0ms | 10 |
| node | `module:client-only-stub` | 10 | 88.4ms | 21.7ms | -75.5% | 21.7ms | 2.5ms | 10 |
| web | `manifest:stage` | 31 | 21.4ms | 29.8ms | +39.3% | 29.8ms | 3.1ms | 31 |
| web | `manifest:transform` | 10 | 1.1ms | 0.9ms | -18.2% | 0.9ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 4.2ms | - | 4.2ms | 0.3ms | 21 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 502.3ms | 295.6ms | -41.2% | 295.6ms | 6.8ms | 20 |
| node | `route:module` | 500 | 165.2ms | 122.5ms | -25.8% | 122.5ms | 3.3ms | 20 |
| web | `route:client-entry` | 500 | 108.5ms | 77.3ms | -28.8% | 77.3ms | 2.2ms | 20 |
| node | `module:client-only-stub` | 10 | 83.4ms | 88.0ms | +5.5% | 88.0ms | 13.9ms | 10 |
| node | `manifest:transform` | 10 | 63.9ms | 41.4ms | -35.2% | 41.4ms | 6.6ms | 10 |
| web | `manifest:stage` | 30 | 5.3ms | 6.3ms | +18.9% | 6.3ms | 0.4ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 0.5ms | -50.0% | 0.5ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 4.4ms | - | 4.4ms | 0.3ms | 20 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 123.07s | 116.79s | -5.1% | 116.79s | - | 1.05x | - |
| complex app | 2 | 80.49s | 85.83s | +6.6% | 85.83s | - | 0.94x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 98.57s | 97.15s | -1.4% | 89.60s | 84.23s | 3.04s | 2.42s | 3.37s | 4.31s | +28.1% | 97.15s | - | 1.01x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29037402740)

