<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `5b459a4` against base `9018ef6`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 27.22s | 36.89s | +35.5% | 18.57s | 19.94s | +7.4% | 3.48s | 3.38s | -3.1% | 3.23s | 11.25s | +248.3% | 0.74x |
| Large app | 1 | 12.99s | 13.63s | +4.9% | 8.29s | 7.69s | -7.2% | 1.70s | 1.61s | -5.0% | 1.79s | 2.97s | +65.5% | 0.95x |
| Standard fixtures | 6 | 14.22s | 23.26s | +63.6% | 10.28s | 12.25s | +19.2% | 1.78s | 1.76s | -1.3% | 1.44s | 8.28s | +476.7% | 0.61x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.76s | 8.73s | -0.4% | 8.71s | 8.89s | 1.00x | 1519 MB |
| `synthetic-1024-ssr-esm` | 5 | 3.55s | 3.50s | -1.3% | 3.54s | 3.79s | 1.01x | 668 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 4.71s | 4.69s | -0.3% | 4.71s | 4.96s | 1.00x | 826 MB |
| `synthetic-256-sourcemaps` | 10 | 1.95s | 1.92s | -1.6% | 1.93s | 2.12s | 1.02x | 462 MB |
| `synthetic-256-ssr-esm` | 10 | 1.81s | 1.80s | -0.4% | 1.81s | 1.99s | 1.00x | 419 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.16s | 2.13s | -1.6% | 2.14s | 2.30s | 1.02x | 456 MB |
| `synthetic-48-ssr-esm` | 10 | 1.21s | 1.23s | +0.9% | 1.24s | 1.41s | 0.99x | 314 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 12.99s | 13.63s | +4.9% | 8.29s | 7.69s | 1.70s | 1.61s | 1.79s | 2.97s | +65.5% | 13.70s | 13.88s | 0.95x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.18s | 7.43s | +77.6% | 3.01s | 3.65s | 0.49s | 0.49s | 0.48s | 3.02s | +532.8% | 7.44s | 7.55s | 0.56x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.16s | 7.52s | +80.6% | 2.98s | 3.70s | 0.53s | 0.52s | 0.45s | 3.01s | +565.1% | 8.07s | 10.34s | 0.55x | - |
| `synthetic-256-sourcemaps` | 10 | 1.84s | 3.04s | +65.2% | 1.36s | 1.72s | 0.23s | 0.22s | 0.15s | 0.96s | +534.9% | 3.12s | 3.90s | 0.61x | - |
| `synthetic-256-ssr-esm` | 10 | 1.61s | 2.17s | +35.0% | 1.17s | 1.29s | 0.21s | 0.21s | 0.15s | 0.58s | +284.4% | 2.17s | 2.21s | 0.74x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.60s | 2.18s | +35.9% | 1.15s | 1.29s | 0.21s | 0.21s | 0.13s | 0.58s | +354.9% | 2.27s | 2.64s | 0.74x | - |
| `synthetic-48-ssr-esm` | 10 | 0.82s | 0.92s | +12.1% | 0.60s | 0.60s | 0.11s | 0.12s | 0.08s | 0.13s | +68.3% | 0.92s | 1.00s | 0.89x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1667.4ms | 1686.6ms | +1.2% | 1686.6ms | 13.2ms | 10 |
| node | `route:module` | 1785 | 839.9ms | 903.5ms | +7.6% | 903.5ms | 6.5ms | 10 |
| web | `route:client-entry` | 1785 | 376.5ms | 362.2ms | -3.8% | 362.2ms | 4.9ms | 10 |
| node | `manifest:transform` | 5 | 102.7ms | 119.4ms | +16.3% | 119.4ms | 39.9ms | 5 |
| web | `manifest:stage` | 10 | 14.4ms | 14.4ms | 0.0% | 14.4ms | 1.9ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2079.6ms | 2135.6ms | +2.7% | 2135.6ms | 28.7ms | 10 |
| node | `route:module` | 5130 | 957.6ms | 1000.9ms | +4.5% | 1000.9ms | 7.5ms | 10 |
| web | `route:client-entry` | 5130 | 506.2ms | 631.5ms | +24.8% | 631.5ms | 6.7ms | 10 |
| node | `manifest:transform` | 5 | 200.5ms | 197.3ms | -1.6% | 197.3ms | 41.4ms | 5 |
| node | `module:client-only-stub` | 5 | 86.9ms | 110.3ms | +26.9% | 110.3ms | 39.2ms | 5 |
| web | `manifest:stage` | 10 | 56.8ms | 56.2ms | -1.1% | 56.2ms | 8.0ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5131 | 2073.1ms | 2131.9ms | +2.8% | 2131.9ms | 12.3ms | 11 |
| node | `route:module` | 5130 | 930.6ms | 1034.4ms | +11.2% | 1034.4ms | 6.1ms | 10 |
| web | `route:client-entry` | 5131 | 525.8ms | 581.1ms | +10.5% | 581.1ms | 9.8ms | 11 |
| node | `module:client-only-stub` | 5 | 429.6ms | 326.1ms | -24.1% | 326.1ms | 239.0ms | 5 |
| node | `manifest:transform` | 5 | 194.1ms | 195.8ms | +0.9% | 195.8ms | 48.3ms | 5 |
| web | `manifest:stage` | 11 | 56.6ms | 58.4ms | +3.2% | 58.4ms | 8.2ms | 11 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1388.0ms | 1450.5ms | +4.5% | 1450.5ms | 19.4ms | 21 |
| node | `route:module` | 2580 | 617.2ms | 711.2ms | +15.2% | 711.2ms | 4.0ms | 20 |
| web | `route:client-entry` | 2581 | 335.0ms | 385.8ms | +15.2% | 385.8ms | 4.8ms | 21 |
| node | `module:client-only-stub` | 10 | 228.5ms | 181.6ms | -20.5% | 181.6ms | 57.0ms | 10 |
| node | `manifest:transform` | 10 | 137.6ms | 143.8ms | +4.5% | 143.8ms | 19.0ms | 10 |
| web | `manifest:stage` | 21 | 20.8ms | 21.6ms | +3.8% | 21.6ms | 1.4ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1270.4ms | 1375.7ms | +8.3% | 1375.7ms | 14.5ms | 20 |
| node | `route:module` | 2580 | 537.2ms | 650.1ms | +21.0% | 650.1ms | 6.5ms | 20 |
| web | `route:client-entry` | 2580 | 353.8ms | 385.3ms | +8.9% | 385.3ms | 4.6ms | 20 |
| node | `module:client-only-stub` | 10 | 179.8ms | 212.9ms | +18.4% | 212.9ms | 82.7ms | 10 |
| node | `manifest:transform` | 10 | 141.6ms | 163.8ms | +15.7% | 163.8ms | 22.0ms | 10 |
| web | `manifest:stage` | 20 | 19.9ms | 20.0ms | +0.5% | 20.0ms | 1.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1295.3ms | 1356.4ms | +4.7% | 1356.4ms | 15.0ms | 22 |
| node | `route:module` | 2580 | 525.8ms | 649.3ms | +23.5% | 649.3ms | 6.9ms | 20 |
| web | `route:client-entry` | 2582 | 363.7ms | 388.8ms | +6.9% | 388.8ms | 4.5ms | 22 |
| node | `manifest:transform` | 10 | 143.6ms | 171.1ms | +19.2% | 171.1ms | 26.9ms | 10 |
| node | `module:client-only-stub` | 10 | 76.2ms | 221.5ms | +190.7% | 221.5ms | 85.0ms | 10 |
| web | `manifest:stage` | 22 | 20.8ms | 21.5ms | +3.4% | 21.5ms | 1.4ms | 22 |
| web | `manifest:transform` | 10 | 0.9ms | 1.0ms | +11.1% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 458.2ms | 384.2ms | -16.2% | 384.2ms | 8.3ms | 20 |
| node | `route:module` | 500 | 153.1ms | 152.8ms | -0.2% | 152.8ms | 3.8ms | 20 |
| web | `route:client-entry` | 500 | 109.8ms | 114.1ms | +3.9% | 114.1ms | 3.2ms | 20 |
| node | `module:client-only-stub` | 10 | 77.5ms | 111.0ms | +43.2% | 111.0ms | 15.1ms | 10 |
| node | `manifest:transform` | 10 | 45.1ms | 38.8ms | -14.0% | 38.8ms | 4.4ms | 10 |
| web | `manifest:stage` | 20 | 5.1ms | 5.3ms | +3.9% | 5.3ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 0.9ms | -10.0% | 0.9ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 102.11s | 100.77s | -1.3% | 100.77s | - | 1.01x | - |
| complex app | 2 | 71.43s | 70.60s | -1.2% | 70.60s | - | 1.01x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 84.96s | 86.41s | +1.7% | 76.90s | 75.87s | 2.32s | 2.53s | 3.76s | 5.80s | +54.4% | 86.41s | - | 0.98x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28969106180)

