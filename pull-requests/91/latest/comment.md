<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `20ae869` against base `602a929`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 27.69s | 27.49s | -0.7% | 18.48s | 18.28s | -1.0% | 3.78s | 3.78s | +0.1% | 3.10s | 3.04s | -2.0% | 1.01x |
| Large app | 1 | 12.96s | 12.84s | -1.0% | 7.93s | 7.83s | -1.2% | 1.86s | 1.84s | -1.1% | 1.67s | 1.68s | +0.6% | 1.01x |
| Standard fixtures | 6 | 14.72s | 14.65s | -0.5% | 10.55s | 10.45s | -0.9% | 1.91s | 1.94s | +1.3% | 1.44s | 1.36s | -5.1% | 1.01x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.34s | 8.29s | -0.6% | 8.35s | 8.68s | 1.01x | 1521 MB |
| `synthetic-1024-ssr-esm` | 5 | 3.89s | 3.94s | +1.3% | 3.95s | 4.22s | 0.99x | 655 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.21s | 5.24s | +0.7% | 5.29s | 5.62s | 0.99x | 834 MB |
| `synthetic-256-sourcemaps` | 10 | 2.09s | 2.09s | -0.2% | 2.10s | 2.27s | 1.00x | 470 MB |
| `synthetic-256-ssr-esm` | 10 | 1.96s | 1.95s | -0.5% | 1.96s | 2.16s | 1.00x | 424 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.35s | 2.31s | -1.7% | 2.33s | 2.54s | 1.02x | 466 MB |
| `synthetic-48-ssr-esm` | 10 | 1.31s | 1.30s | -0.5% | 1.31s | 1.50s | 1.01x | 308 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 12.96s | 12.84s | -1.0% | 7.93s | 7.83s | 1.86s | 1.84s | 1.67s | 1.68s | +0.6% | 12.86s | 13.00s | 1.01x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.31s | 4.31s | -0.0% | 3.07s | 3.07s | 0.55s | 0.56s | 0.48s | 0.46s | -4.7% | 4.28s | 4.37s | 1.00x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.31s | 4.35s | +1.1% | 3.06s | 3.07s | 0.55s | 0.56s | 0.48s | 0.45s | -5.2% | 4.38s | 4.64s | 0.99x | - |
| `synthetic-256-sourcemaps` | 10 | 1.90s | 1.86s | -1.6% | 1.40s | 1.37s | 0.24s | 0.23s | 0.15s | 0.15s | +0.1% | 1.86s | 1.98s | 1.02x | - |
| `synthetic-256-ssr-esm` | 10 | 1.65s | 1.63s | -1.1% | 1.19s | 1.17s | 0.22s | 0.24s | 0.15s | 0.13s | -16.3% | 1.64s | 1.70s | 1.01x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.69s | 1.63s | -3.2% | 1.21s | 1.16s | 0.23s | 0.23s | 0.13s | 0.13s | -0.9% | 1.63s | 1.69s | 1.03x | - |
| `synthetic-48-ssr-esm` | 10 | 0.87s | 0.85s | -1.7% | 0.62s | 0.60s | 0.12s | 0.12s | 0.05s | 0.05s | +0.0% | 0.85s | 0.87s | 1.02x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1703.4ms | 1761.0ms | +3.4% | 1761.0ms | 23.1ms | 10 |
| node | `route:module` | 1785 | 859.8ms | 899.9ms | +4.7% | 899.9ms | 16.9ms | 10 |
| web | `route:client-entry` | 1785 | 386.9ms | 352.4ms | -8.9% | 352.4ms | 5.7ms | 10 |
| node | `manifest:transform` | 5 | 90.2ms | 120.7ms | +33.8% | 120.7ms | 36.2ms | 5 |
| web | `manifest:stage` | 10 | 14.5ms | 14.8ms | +2.1% | 14.8ms | 2.1ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2013.8ms | 2030.7ms | +0.8% | 2030.7ms | 22.5ms | 10 |
| node | `route:module` | 5130 | 913.4ms | 922.4ms | +1.0% | 922.4ms | 6.1ms | 10 |
| web | `route:client-entry` | 5130 | 659.1ms | 618.1ms | -6.2% | 618.1ms | 6.3ms | 10 |
| node | `manifest:transform` | 5 | 207.6ms | 196.8ms | -5.2% | 196.8ms | 42.8ms | 5 |
| node | `module:client-only-stub` | 5 | 96.2ms | 280.1ms | +191.2% | 280.1ms | 99.1ms | 5 |
| web | `manifest:stage` | 10 | 55.3ms | 48.9ms | -11.6% | 48.9ms | 7.3ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2031.5ms | 2020.1ms | -0.6% | 2020.1ms | 13.7ms | 10 |
| node | `route:module` | 5130 | 941.7ms | 933.1ms | -0.9% | 933.1ms | 7.8ms | 10 |
| web | `route:client-entry` | 5130 | 636.5ms | 624.4ms | -1.9% | 624.4ms | 7.0ms | 10 |
| node | `module:client-only-stub` | 5 | 216.8ms | 75.9ms | -65.0% | 75.9ms | 26.9ms | 5 |
| node | `manifest:transform` | 5 | 207.1ms | 198.2ms | -4.3% | 198.2ms | 44.1ms | 5 |
| web | `manifest:stage` | 10 | 55.1ms | 50.7ms | -8.0% | 50.7ms | 8.6ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1406.3ms | 1380.1ms | -1.9% | 1380.1ms | 13.7ms | 22 |
| node | `route:module` | 2580 | 571.8ms | 620.0ms | +8.4% | 620.0ms | 4.5ms | 20 |
| web | `route:client-entry` | 2582 | 392.6ms | 394.2ms | +0.4% | 394.2ms | 5.1ms | 22 |
| node | `manifest:transform` | 10 | 146.9ms | 158.2ms | +7.7% | 158.2ms | 21.3ms | 10 |
| node | `module:client-only-stub` | 10 | 82.0ms | 79.5ms | -3.0% | 79.5ms | 30.2ms | 10 |
| web | `manifest:stage` | 22 | 21.2ms | 21.9ms | +3.3% | 21.9ms | 1.4ms | 22 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1310.7ms | 1393.5ms | +6.3% | 1393.5ms | 17.6ms | 20 |
| node | `route:module` | 2580 | 558.0ms | 535.9ms | -4.0% | 535.9ms | 4.9ms | 20 |
| web | `route:client-entry` | 2580 | 390.2ms | 391.0ms | +0.2% | 391.0ms | 5.6ms | 20 |
| node | `module:client-only-stub` | 10 | 185.5ms | 125.2ms | -32.5% | 125.2ms | 31.0ms | 10 |
| node | `manifest:transform` | 10 | 151.1ms | 156.9ms | +3.8% | 156.9ms | 22.4ms | 10 |
| web | `manifest:stage` | 20 | 21.9ms | 20.0ms | -8.7% | 20.0ms | 1.3ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1282.6ms | 1371.0ms | +6.9% | 1371.0ms | 11.1ms | 22 |
| node | `route:module` | 2580 | 542.0ms | 523.1ms | -3.5% | 523.1ms | 5.6ms | 20 |
| web | `route:client-entry` | 2582 | 387.0ms | 411.5ms | +6.3% | 411.5ms | 6.3ms | 22 |
| node | `manifest:transform` | 10 | 156.0ms | 162.2ms | +4.0% | 162.2ms | 21.7ms | 10 |
| node | `module:client-only-stub` | 10 | 146.9ms | 44.9ms | -69.4% | 44.9ms | 9.2ms | 10 |
| web | `manifest:stage` | 22 | 21.2ms | 21.8ms | +2.8% | 21.8ms | 1.4ms | 22 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 469.8ms | 404.7ms | -13.9% | 404.7ms | 10.4ms | 20 |
| node | `route:module` | 500 | 161.6ms | 152.3ms | -5.8% | 152.3ms | 0.7ms | 20 |
| web | `route:client-entry` | 500 | 107.1ms | 114.1ms | +6.5% | 114.1ms | 3.4ms | 20 |
| node | `module:client-only-stub` | 10 | 72.9ms | 70.6ms | -3.2% | 70.6ms | 11.4ms | 10 |
| node | `manifest:transform` | 10 | 49.8ms | 49.9ms | +0.2% | 49.9ms | 6.0ms | 10 |
| web | `manifest:stage` | 20 | 5.4ms | 5.6ms | +3.7% | 5.6ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 110.09s | 109.38s | -0.6% | 109.38s | - | 1.01x | - |
| complex app | 2 | 76.32s | 76.62s | +0.4% | 76.62s | - | 1.00x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 91.59s | 91.55s | -0.0% | 83.38s | 83.27s | 2.62s | 2.62s | 3.26s | 3.27s | +0.4% | 91.55s | - | 1.00x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29055700001)

