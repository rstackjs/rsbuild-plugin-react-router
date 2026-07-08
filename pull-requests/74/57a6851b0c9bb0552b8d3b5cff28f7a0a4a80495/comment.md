<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `57a6851` against base `9018ef6`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 27.90s | 39.61s | +41.9% | 18.64s | 19.34s | +3.8% | 3.74s | 3.13s | -16.3% | 3.14s | 3.00s | -4.4% | 0.70x |
| Large app | 1 | 12.99s | 17.59s | +35.3% | 7.95s | 8.59s | +8.0% | 1.86s | 1.52s | -18.3% | 1.65s | 1.71s | +3.5% | 0.74x |
| Standard fixtures | 6 | 14.91s | 22.02s | +47.7% | 10.69s | 10.75s | +0.6% | 1.88s | 1.61s | -14.3% | 1.49s | 1.29s | -13.3% | 0.68x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.37s | 8.64s | +3.2% | 8.67s | 8.92s | 0.97x | 1618 MB |
| `synthetic-1024-ssr-esm` | 5 | 3.96s | 3.18s | -19.6% | 3.22s | 3.44s | 1.24x | 655 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.27s | 4.64s | -12.0% | 4.68s | 4.85s | 1.14x | 866 MB |
| `synthetic-256-sourcemaps` | 10 | 2.10s | 1.71s | -18.7% | 1.72s | 1.90s | 1.23x | 480 MB |
| `synthetic-256-ssr-esm` | 10 | 1.99s | 1.67s | -16.1% | 1.66s | 1.74s | 1.19x | 432 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.33s | 1.97s | -15.8% | 2.00s | 2.20s | 1.19x | 484 MB |
| `synthetic-48-ssr-esm` | 10 | 1.31s | 1.08s | -17.5% | 1.10s | 1.28s | 1.21x | 326 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 12.99s | 17.59s | +35.3% | 7.95s | 8.59s | 1.86s | 1.52s | 1.65s | 1.71s | +3.5% | 17.52s | 17.84s | 0.74x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.35s | 6.66s | +53.3% | 3.09s | 3.28s | 0.51s | 0.45s | 0.50s | 0.43s | -14.8% | 7.12s | 8.21s | 0.65x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.43s | 7.41s | +67.3% | 3.14s | 3.19s | 0.56s | 0.46s | 0.48s | 0.40s | -15.7% | 7.12s | 7.77s | 0.60x | - |
| `synthetic-256-sourcemaps` | 10 | 1.92s | 2.87s | +49.7% | 1.43s | 1.50s | 0.24s | 0.20s | 0.15s | 0.15s | -0.2% | 2.85s | 3.15s | 0.67x | - |
| `synthetic-256-ssr-esm` | 10 | 1.68s | 2.17s | +29.4% | 1.21s | 1.14s | 0.22s | 0.19s | 0.15s | 0.13s | -16.6% | 2.14s | 2.59s | 0.77x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.66s | 2.04s | +22.5% | 1.20s | 1.13s | 0.22s | 0.20s | 0.15s | 0.13s | -16.8% | 2.01s | 2.13s | 0.82x | - |
| `synthetic-48-ssr-esm` | 10 | 0.88s | 0.87s | -1.0% | 0.63s | 0.53s | 0.12s | 0.10s | 0.05s | 0.05s | +5.4% | 0.87s | 0.93s | 1.01x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1716.9ms | 1255.6ms | -26.9% | 1255.6ms | 9.7ms | 10 |
| node | `route:module` | 1785 | 921.3ms | 627.9ms | -31.8% | 627.9ms | 12.2ms | 10 |
| web | `route:client-entry` | 1785 | 388.0ms | 358.6ms | -7.6% | 358.6ms | 9.2ms | 10 |
| node | `manifest:transform` | 5 | 110.8ms | 89.4ms | -19.3% | 89.4ms | 20.4ms | 5 |
| web | `manifest:stage` | 15 | 14.7ms | 16.2ms | +10.2% | 16.2ms | 1.7ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 106.3ms | - | 106.3ms | 11.4ms | 10 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2053.5ms | 1511.2ms | -26.4% | 1511.2ms | 19.1ms | 10 |
| node | `route:module` | 5130 | 925.2ms | 784.8ms | -15.2% | 784.8ms | 13.8ms | 10 |
| web | `route:client-entry` | 5130 | 640.3ms | 487.1ms | -23.9% | 487.1ms | 7.4ms | 10 |
| node | `manifest:transform` | 5 | 213.6ms | 163.9ms | -23.3% | 163.9ms | 37.4ms | 5 |
| node | `module:client-only-stub` | 5 | 137.5ms | 114.1ms | -17.0% | 114.1ms | 44.3ms | 5 |
| web | `manifest:stage` | 15 | 72.3ms | 49.9ms | -31.0% | 49.9ms | 7.3ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.0ms | - | 2.0ms | 0.3ms | 10 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 1994.5ms | 1511.3ms | -24.2% | 1511.3ms | 7.9ms | 10 |
| node | `route:module` | 5130 | 945.6ms | 759.7ms | -19.7% | 759.7ms | 15.3ms | 10 |
| web | `route:client-entry` | 5130 | 614.0ms | 459.4ms | -25.2% | 459.4ms | 7.0ms | 10 |
| node | `manifest:transform` | 5 | 197.2ms | 171.8ms | -12.9% | 171.8ms | 45.0ms | 5 |
| node | `module:client-only-stub` | 5 | 149.4ms | 85.1ms | -43.0% | 85.1ms | 43.0ms | 5 |
| web | `manifest:stage` | 15 | 58.1ms | 48.6ms | -16.4% | 48.6ms | 5.8ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.0ms | - | 2.0ms | 0.3ms | 10 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1406.2ms | 1060.6ms | -24.6% | 1060.6ms | 8.5ms | 20 |
| node | `route:module` | 2580 | 598.5ms | 522.7ms | -12.7% | 522.7ms | 5.0ms | 20 |
| web | `route:client-entry` | 2580 | 397.2ms | 323.9ms | -18.5% | 323.9ms | 5.6ms | 20 |
| node | `manifest:transform` | 10 | 147.3ms | 120.6ms | -18.1% | 120.6ms | 18.5ms | 10 |
| node | `module:client-only-stub` | 10 | 81.8ms | 21.2ms | -74.1% | 21.2ms | 3.2ms | 10 |
| web | `manifest:stage` | 32 | 24.1ms | 22.6ms | -6.2% | 22.6ms | 1.2ms | 32 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 22 | - | 4.7ms | - | 4.7ms | 0.4ms | 22 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1302.0ms | 970.3ms | -25.5% | 970.3ms | 9.8ms | 21 |
| node | `route:module` | 2580 | 542.6ms | 449.4ms | -17.2% | 449.4ms | 10.2ms | 20 |
| web | `route:client-entry` | 2581 | 383.3ms | 308.1ms | -19.6% | 308.1ms | 6.5ms | 21 |
| node | `module:client-only-stub` | 10 | 197.3ms | 31.9ms | -83.8% | 31.9ms | 13.5ms | 10 |
| node | `manifest:transform` | 10 | 157.3ms | 135.3ms | -14.0% | 135.3ms | 20.8ms | 10 |
| web | `manifest:stage` | 31 | 21.7ms | 22.3ms | +2.8% | 22.3ms | 1.2ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 4.0ms | - | 4.0ms | 0.3ms | 21 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1285.7ms | 992.8ms | -22.8% | 992.8ms | 12.5ms | 20 |
| node | `route:module` | 2580 | 538.8ms | 472.1ms | -12.4% | 472.1ms | 6.6ms | 20 |
| web | `route:client-entry` | 2580 | 375.7ms | 312.9ms | -16.7% | 312.9ms | 5.4ms | 20 |
| node | `manifest:transform` | 10 | 162.2ms | 149.3ms | -8.0% | 149.3ms | 19.6ms | 10 |
| node | `module:client-only-stub` | 10 | 28.9ms | 28.8ms | -0.3% | 28.8ms | 6.5ms | 10 |
| web | `manifest:stage` | 30 | 21.2ms | 25.3ms | +19.3% | 25.3ms | 2.9ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 4.0ms | - | 4.0ms | 0.3ms | 20 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 479.6ms | 277.5ms | -42.1% | 277.5ms | 6.3ms | 20 |
| node | `route:module` | 500 | 157.9ms | 106.7ms | -32.4% | 106.7ms | 0.8ms | 20 |
| web | `route:client-entry` | 500 | 107.0ms | 66.3ms | -38.0% | 66.3ms | 1.9ms | 20 |
| node | `module:client-only-stub` | 10 | 72.2ms | 71.5ms | -1.0% | 71.5ms | 14.1ms | 10 |
| node | `manifest:transform` | 10 | 55.5ms | 38.4ms | -30.8% | 38.4ms | 5.0ms | 10 |
| web | `manifest:stage` | 30 | 5.3ms | 5.8ms | +9.4% | 5.8ms | 0.3ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 0.4ms | -60.0% | 0.4ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 4.4ms | - | 4.4ms | 0.3ms | 20 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 110.09s | 101.79s | -7.5% | 101.79s | - | 1.08x | - |
| complex app | 2 | 78.78s | 77.77s | -1.3% | 77.77s | - | 1.01x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 93.57s | 91.55s | -2.2% | 85.16s | 79.97s | 2.69s | 2.22s | 3.37s | 3.87s | +14.9% | 91.55s | - | 1.02x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28976698549)

