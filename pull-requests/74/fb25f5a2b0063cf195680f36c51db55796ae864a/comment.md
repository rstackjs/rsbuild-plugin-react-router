<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `fb25f5a` against base `c93ec98`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.47s | 35.36s | +20.0% | 19.72s | 18.78s | -4.8% | 3.97s | 3.63s | -8.5% | 3.27s | 3.02s | -7.4% | 0.83x |
| Large app | 1 | 13.83s | 14.63s | +5.8% | 8.44s | 7.91s | -6.3% | 2.01s | 1.83s | -9.1% | 1.75s | 1.59s | -9.3% | 0.95x |
| Standard fixtures | 6 | 15.65s | 20.73s | +32.5% | 11.28s | 10.87s | -3.7% | 1.96s | 1.80s | -8.0% | 1.52s | 1.44s | -5.3% | 0.75x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.71s | 8.26s | -5.2% | 8.30s | 8.48s | 1.05x | 1520 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.18s | 3.80s | -9.2% | 3.82s | 4.00s | 1.10x | 639 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.57s | 5.17s | -7.2% | 5.20s | 5.38s | 1.08x | 824 MB |
| `synthetic-256-sourcemaps` | 10 | 2.17s | 2.06s | -5.4% | 2.06s | 2.19s | 1.06x | 460 MB |
| `synthetic-256-ssr-esm` | 10 | 2.02s | 1.92s | -5.1% | 1.93s | 2.06s | 1.05x | 415 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.44s | 2.28s | -6.5% | 2.28s | 2.43s | 1.07x | 448 MB |
| `synthetic-48-ssr-esm` | 10 | 1.35s | 1.30s | -3.7% | 1.34s | 1.57s | 1.04x | 329 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.83s | 14.63s | +5.8% | 8.44s | 7.91s | 2.01s | 1.83s | 1.75s | 1.59s | -9.3% | 14.63s | 14.89s | 0.95x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.63s | 6.47s | +39.9% | 3.30s | 3.16s | 0.56s | 0.51s | 0.50s | 0.50s | -0.2% | 6.47s | 6.56s | 0.71x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.60s | 6.48s | +41.0% | 3.29s | 3.20s | 0.54s | 0.51s | 0.51s | 0.50s | -0.6% | 6.50s | 6.66s | 0.71x | - |
| `synthetic-256-sourcemaps` | 10 | 2.00s | 2.66s | +33.0% | 1.50s | 1.45s | 0.25s | 0.22s | 0.15s | 0.13s | -16.7% | 2.65s | 2.70s | 0.75x | - |
| `synthetic-256-ssr-esm` | 10 | 1.76s | 2.07s | +17.6% | 1.27s | 1.22s | 0.24s | 0.22s | 0.15s | 0.13s | -16.6% | 2.07s | 2.10s | 0.85x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.75s | 2.09s | +19.0% | 1.26s | 1.23s | 0.23s | 0.22s | 0.15s | 0.13s | -17.1% | 2.06s | 2.14s | 0.84x | - |
| `synthetic-48-ssr-esm` | 10 | 0.91s | 0.97s | +6.0% | 0.66s | 0.60s | 0.13s | 0.13s | 0.05s | 0.05s | -0.2% | 0.96s | 1.01s | 0.94x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1713.2ms | 1470.8ms | -14.1% | 1470.8ms | 18.6ms | 10 |
| node | `route:module` | 1785 | 910.1ms | 733.3ms | -19.4% | 733.3ms | 7.6ms | 10 |
| web | `route:client-entry` | 1785 | 380.3ms | 431.4ms | +13.4% | 431.4ms | 10.2ms | 10 |
| node | `manifest:transform` | 5 | 141.8ms | 173.9ms | +22.6% | 173.9ms | 57.4ms | 5 |
| web | `manifest:stage` | 15 | 14.4ms | 20.5ms | +42.4% | 20.5ms | 2.4ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2035.1ms | 1701.0ms | -16.4% | 1701.0ms | 10.6ms | 10 |
| node | `route:module` | 5130 | 921.3ms | 732.7ms | -20.5% | 732.7ms | 4.8ms | 10 |
| web | `route:client-entry` | 5130 | 627.2ms | 554.9ms | -11.5% | 554.9ms | 8.9ms | 10 |
| node | `manifest:transform` | 5 | 208.2ms | 226.6ms | +8.8% | 226.6ms | 51.2ms | 5 |
| node | `module:client-only-stub` | 5 | 103.1ms | 55.0ms | -46.7% | 55.0ms | 15.2ms | 5 |
| web | `manifest:stage` | 15 | 59.4ms | 63.8ms | +7.4% | 63.8ms | 7.3ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2056.4ms | 1724.7ms | -16.1% | 1724.7ms | 14.8ms | 10 |
| node | `route:module` | 5130 | 919.2ms | 806.4ms | -12.3% | 806.4ms | 8.9ms | 10 |
| web | `route:client-entry` | 5130 | 603.6ms | 573.7ms | -5.0% | 573.7ms | 7.4ms | 10 |
| node | `module:client-only-stub` | 5 | 469.5ms | 145.6ms | -69.0% | 145.6ms | 40.8ms | 5 |
| node | `manifest:transform` | 5 | 204.7ms | 214.2ms | +4.6% | 214.2ms | 44.7ms | 5 |
| web | `manifest:stage` | 15 | 60.7ms | 64.7ms | +6.6% | 64.7ms | 8.5ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1410.9ms | 1311.5ms | -7.0% | 1311.5ms | 17.1ms | 20 |
| node | `route:module` | 2580 | 598.2ms | 564.6ms | -5.6% | 564.6ms | 4.8ms | 20 |
| web | `route:client-entry` | 2580 | 397.2ms | 360.8ms | -9.2% | 360.8ms | 5.7ms | 20 |
| node | `module:client-only-stub` | 10 | 244.6ms | 388.5ms | +58.8% | 388.5ms | 200.9ms | 10 |
| node | `manifest:transform` | 10 | 145.5ms | 150.6ms | +3.5% | 150.6ms | 19.3ms | 10 |
| web | `manifest:stage` | 30 | 20.1ms | 28.5ms | +41.8% | 28.5ms | 1.4ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1358.0ms | 1221.9ms | -10.0% | 1221.9ms | 14.8ms | 20 |
| node | `route:module` | 2580 | 553.6ms | 522.5ms | -5.6% | 522.5ms | 10.3ms | 20 |
| web | `route:client-entry` | 2580 | 383.5ms | 345.0ms | -10.0% | 345.0ms | 5.7ms | 20 |
| node | `module:client-only-stub` | 10 | 195.5ms | 133.0ms | -32.0% | 133.0ms | 43.2ms | 10 |
| node | `manifest:transform` | 10 | 151.0ms | 154.5ms | +2.3% | 154.5ms | 22.7ms | 10 |
| web | `manifest:stage` | 30 | 20.2ms | 28.2ms | +39.6% | 28.2ms | 1.4ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1325.3ms | 1240.3ms | -6.4% | 1240.3ms | 16.7ms | 22 |
| node | `route:module` | 2580 | 542.4ms | 579.4ms | +6.8% | 579.4ms | 10.0ms | 20 |
| web | `route:client-entry` | 2582 | 380.0ms | 370.8ms | -2.4% | 370.8ms | 5.8ms | 22 |
| node | `manifest:transform` | 10 | 179.8ms | 175.6ms | -2.3% | 175.6ms | 24.6ms | 10 |
| node | `module:client-only-stub` | 10 | 131.9ms | 385.0ms | +191.9% | 385.0ms | 135.4ms | 10 |
| web | `manifest:stage` | 32 | 20.6ms | 30.8ms | +49.5% | 30.8ms | 3.0ms | 32 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 487.5ms | 429.0ms | -12.0% | 429.0ms | 15.5ms | 20 |
| node | `route:module` | 500 | 163.8ms | 118.7ms | -27.5% | 118.7ms | 3.4ms | 20 |
| web | `route:client-entry` | 500 | 107.7ms | 82.3ms | -23.6% | 82.3ms | 2.0ms | 20 |
| node | `module:client-only-stub` | 10 | 76.8ms | 66.1ms | -13.9% | 66.1ms | 11.5ms | 10 |
| node | `manifest:transform` | 10 | 50.2ms | 54.6ms | +8.8% | 54.6ms | 8.2ms | 10 |
| web | `manifest:stage` | 30 | 5.5ms | 8.4ms | +52.7% | 8.4ms | 0.4ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 2.7ms | +170.0% | 2.7ms | 1.8ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 113.46s | 111.68s | -1.6% | 111.68s | - | 1.02x | - |
| complex app | 2 | 78.98s | 80.18s | +1.5% | 80.18s | - | 0.99x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 96.87s | 98.12s | +1.3% | 88.10s | 86.42s | 2.88s | 2.64s | 3.29s | 3.23s | -1.7% | 98.12s | - | 0.99x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28689622533)

