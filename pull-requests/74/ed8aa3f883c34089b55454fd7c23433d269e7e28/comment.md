<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `ed8aa3f` against base `c93ec98`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.47s | 36.45s | +23.7% | 19.72s | 19.31s | -2.1% | 3.97s | 3.78s | -4.6% | 3.27s | 3.16s | -3.3% | 0.81x |
| Large app | 1 | 13.83s | 15.15s | +9.6% | 8.44s | 8.15s | -3.5% | 2.01s | 1.92s | -4.3% | 1.75s | 1.69s | -3.2% | 0.91x |
| Standard fixtures | 6 | 15.65s | 21.30s | +36.1% | 11.28s | 11.16s | -1.0% | 1.96s | 1.86s | -4.9% | 1.52s | 1.47s | -3.3% | 0.73x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.71s | 8.54s | -2.0% | 8.54s | 8.79s | 1.02x | 1534 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.18s | 3.81s | -9.0% | 3.87s | 4.12s | 1.10x | 634 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.57s | 5.31s | -4.7% | 5.27s | 5.41s | 1.05x | 836 MB |
| `synthetic-256-sourcemaps` | 10 | 2.17s | 2.09s | -3.8% | 2.11s | 2.27s | 1.04x | 451 MB |
| `synthetic-256-ssr-esm` | 10 | 2.02s | 1.94s | -4.3% | 1.95s | 2.10s | 1.04x | 409 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.44s | 2.34s | -4.1% | 2.35s | 2.49s | 1.04x | 463 MB |
| `synthetic-48-ssr-esm` | 10 | 1.35s | 1.33s | -2.0% | 1.35s | 1.59s | 1.02x | 341 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.83s | 15.15s | +9.6% | 8.44s | 8.15s | 2.01s | 1.92s | 1.75s | 1.69s | -3.2% | 15.16s | 15.26s | 0.91x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.63s | 6.69s | +44.6% | 3.30s | 3.31s | 0.56s | 0.53s | 0.50s | 0.53s | +4.8% | 6.75s | 6.94s | 0.69x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.60s | 6.64s | +44.6% | 3.29s | 3.22s | 0.54s | 0.53s | 0.51s | 0.50s | -0.6% | 6.65s | 6.93s | 0.69x | - |
| `synthetic-256-sourcemaps` | 10 | 2.00s | 2.67s | +33.4% | 1.50s | 1.47s | 0.25s | 0.22s | 0.15s | 0.13s | -16.2% | 2.65s | 2.72s | 0.75x | - |
| `synthetic-256-ssr-esm` | 10 | 1.76s | 2.17s | +23.7% | 1.27s | 1.27s | 0.24s | 0.23s | 0.15s | 0.13s | -15.7% | 2.15s | 2.24s | 0.81x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.75s | 2.14s | +21.9% | 1.26s | 1.27s | 0.23s | 0.23s | 0.15s | 0.13s | -15.7% | 2.12s | 2.17s | 0.82x | - |
| `synthetic-48-ssr-esm` | 10 | 0.91s | 0.99s | +8.1% | 0.66s | 0.63s | 0.13s | 0.13s | 0.05s | 0.05s | +1.0% | 0.99s | 1.02s | 0.93x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1713.2ms | 1701.6ms | -0.7% | 1701.6ms | 22.2ms | 10 |
| node | `route:module` | 1785 | 910.1ms | 756.8ms | -16.8% | 756.8ms | 11.0ms | 10 |
| web | `route:client-entry` | 1785 | 380.3ms | 454.5ms | +19.5% | 454.5ms | 10.6ms | 10 |
| node | `manifest:transform` | 5 | 141.8ms | 120.6ms | -15.0% | 120.6ms | 35.0ms | 5 |
| web | `manifest:stage` | 15 | 14.4ms | 19.8ms | +37.5% | 19.8ms | 2.0ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2035.1ms | 1800.6ms | -11.5% | 1800.6ms | 17.9ms | 10 |
| node | `route:module` | 5130 | 921.3ms | 794.0ms | -13.8% | 794.0ms | 14.1ms | 10 |
| web | `route:client-entry` | 5130 | 627.2ms | 589.3ms | -6.0% | 589.3ms | 8.9ms | 10 |
| node | `manifest:transform` | 5 | 208.2ms | 214.4ms | +3.0% | 214.4ms | 49.0ms | 5 |
| node | `module:client-only-stub` | 5 | 103.1ms | 166.1ms | +61.1% | 166.1ms | 101.3ms | 5 |
| web | `manifest:stage` | 15 | 59.4ms | 63.7ms | +7.2% | 63.7ms | 7.4ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2056.4ms | 1769.0ms | -14.0% | 1769.0ms | 16.7ms | 10 |
| node | `route:module` | 5130 | 919.2ms | 796.6ms | -13.3% | 796.6ms | 13.9ms | 10 |
| web | `route:client-entry` | 5130 | 603.6ms | 559.2ms | -7.4% | 559.2ms | 7.0ms | 10 |
| node | `module:client-only-stub` | 5 | 469.5ms | 93.0ms | -80.2% | 93.0ms | 40.6ms | 5 |
| node | `manifest:transform` | 5 | 204.7ms | 219.4ms | +7.2% | 219.4ms | 57.8ms | 5 |
| web | `manifest:stage` | 15 | 60.7ms | 66.0ms | +8.7% | 66.0ms | 8.6ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1410.9ms | 1346.9ms | -4.5% | 1346.9ms | 16.8ms | 21 |
| node | `route:module` | 2580 | 598.2ms | 575.1ms | -3.9% | 575.1ms | 7.9ms | 20 |
| web | `route:client-entry` | 2581 | 397.2ms | 409.7ms | +3.1% | 409.7ms | 9.1ms | 21 |
| node | `module:client-only-stub` | 10 | 244.6ms | 170.8ms | -30.2% | 170.8ms | 78.8ms | 10 |
| node | `manifest:transform` | 10 | 145.5ms | 161.0ms | +10.7% | 161.0ms | 19.9ms | 10 |
| web | `manifest:stage` | 32 | 20.1ms | 30.9ms | +53.7% | 30.9ms | 1.5ms | 32 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1358.0ms | 1257.4ms | -7.4% | 1257.4ms | 14.2ms | 21 |
| node | `route:module` | 2580 | 553.6ms | 507.3ms | -8.4% | 507.3ms | 10.6ms | 20 |
| web | `route:client-entry` | 2581 | 383.5ms | 400.7ms | +4.5% | 400.7ms | 8.2ms | 21 |
| node | `module:client-only-stub` | 10 | 195.5ms | 89.5ms | -54.2% | 89.5ms | 57.2ms | 10 |
| node | `manifest:transform` | 10 | 151.0ms | 176.3ms | +16.8% | 176.3ms | 24.3ms | 10 |
| web | `manifest:stage` | 31 | 20.2ms | 29.9ms | +48.0% | 29.9ms | 1.5ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2583 | 1325.3ms | 1238.4ms | -6.6% | 1238.4ms | 17.5ms | 23 |
| node | `route:module` | 2580 | 542.4ms | 519.0ms | -4.3% | 519.0ms | 8.6ms | 20 |
| web | `route:client-entry` | 2583 | 380.0ms | 370.8ms | -2.4% | 370.8ms | 6.1ms | 23 |
| node | `manifest:transform` | 10 | 179.8ms | 179.8ms | -0.0% | 179.8ms | 24.7ms | 10 |
| node | `module:client-only-stub` | 10 | 131.9ms | 150.1ms | +13.8% | 150.1ms | 60.6ms | 10 |
| web | `manifest:stage` | 33 | 20.6ms | 31.0ms | +50.5% | 31.0ms | 1.5ms | 33 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 487.5ms | 409.4ms | -16.0% | 409.4ms | 11.6ms | 20 |
| node | `route:module` | 500 | 163.8ms | 125.3ms | -23.5% | 125.3ms | 3.4ms | 20 |
| web | `route:client-entry` | 500 | 107.7ms | 84.3ms | -21.7% | 84.3ms | 2.3ms | 20 |
| node | `module:client-only-stub` | 10 | 76.8ms | 70.5ms | -8.2% | 70.5ms | 10.8ms | 10 |
| node | `manifest:transform` | 10 | 50.2ms | 49.0ms | -2.4% | 49.0ms | 5.9ms | 10 |
| web | `manifest:stage` | 30 | 5.5ms | 8.0ms | +45.5% | 8.0ms | 0.4ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 113.46s | 115.98s | +2.2% | 115.98s | - | 0.98x | - |
| complex app | 2 | 78.98s | 81.81s | +3.6% | 81.81s | - | 0.97x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 96.87s | 99.87s | +3.1% | 88.10s | 87.71s | 2.88s | 2.78s | 3.29s | 3.39s | +3.2% | 99.87s | - | 0.97x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28690251358)

