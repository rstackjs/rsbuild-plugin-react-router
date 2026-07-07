<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `479565b` against base `a512cc2`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 27.96s | 27.77s | -0.7% | 18.70s | 18.54s | -0.8% | 3.79s | 3.79s | +0.1% | 3.16s | 3.13s | -1.1% | 1.01x |
| Large app | 1 | 13.14s | 13.07s | -0.6% | 8.06s | 7.99s | -0.8% | 1.89s | 1.87s | -0.9% | 1.70s | 1.72s | +1.1% | 1.01x |
| Standard fixtures | 6 | 14.82s | 14.71s | -0.8% | 10.64s | 10.55s | -0.8% | 1.90s | 1.92s | +1.1% | 1.46s | 1.41s | -3.7% | 1.01x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.46s | 8.42s | -0.4% | 8.44s | 8.58s | 1.00x | 1537 MB |
| `synthetic-1024-ssr-esm` | 5 | 3.87s | 3.88s | +0.3% | 3.91s | 4.11s | 1.00x | 626 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.24s | 5.23s | -0.2% | 5.23s | 5.53s | 1.00x | 810 MB |
| `synthetic-256-sourcemaps` | 10 | 2.07s | 2.05s | -0.8% | 2.06s | 2.22s | 1.01x | 429 MB |
| `synthetic-256-ssr-esm` | 10 | 1.93s | 1.91s | -0.9% | 1.92s | 2.08s | 1.01x | 415 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.30s | 2.27s | -1.3% | 2.30s | 2.49s | 1.01x | 431 MB |
| `synthetic-48-ssr-esm` | 10 | 1.32s | 1.30s | -1.5% | 1.32s | 1.52s | 1.02x | 314 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.14s | 13.07s | -0.6% | 8.06s | 7.99s | 1.89s | 1.87s | 1.70s | 1.72s | +1.1% | 13.08s | 13.22s | 1.01x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.33s | 4.37s | +1.0% | 3.07s | 3.10s | 0.52s | 0.54s | 0.50s | 0.48s | -5.2% | 4.49s | 4.81s | 0.99x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.35s | 4.35s | -0.1% | 3.09s | 3.09s | 0.57s | 0.57s | 0.48s | 0.48s | -0.3% | 4.34s | 4.40s | 1.00x | - |
| `synthetic-256-sourcemaps` | 10 | 1.91s | 1.86s | -3.0% | 1.42s | 1.40s | 0.24s | 0.22s | 0.15s | 0.15s | -0.9% | 1.87s | 1.93s | 1.03x | - |
| `synthetic-256-ssr-esm` | 10 | 1.68s | 1.63s | -3.5% | 1.21s | 1.16s | 0.22s | 0.24s | 0.15s | 0.13s | -16.2% | 1.64s | 1.73s | 1.04x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.67s | 1.65s | -1.1% | 1.20s | 1.19s | 0.23s | 0.24s | 0.13s | 0.13s | -0.2% | 1.66s | 1.74s | 1.01x | - |
| `synthetic-48-ssr-esm` | 10 | 0.88s | 0.86s | -2.6% | 0.64s | 0.60s | 0.12s | 0.12s | 0.05s | 0.05s | -0.2% | 0.85s | 0.87s | 1.03x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1689.3ms | 1836.6ms | +8.7% | 1836.6ms | 23.5ms | 10 |
| node | `route:module` | 1785 | 838.1ms | 894.8ms | +6.8% | 894.8ms | 9.1ms | 10 |
| web | `route:client-entry` | 1785 | 382.5ms | 364.7ms | -4.7% | 364.7ms | 5.9ms | 10 |
| node | `manifest:transform` | 5 | 102.8ms | 146.8ms | +42.8% | 146.8ms | 61.0ms | 5 |
| web | `manifest:stage` | 10 | 14.5ms | 14.8ms | +2.1% | 14.8ms | 2.2ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2087.4ms | 2044.8ms | -2.0% | 2044.8ms | 21.8ms | 10 |
| node | `route:module` | 5130 | 905.6ms | 951.4ms | +5.1% | 951.4ms | 7.6ms | 10 |
| web | `route:client-entry` | 5130 | 596.4ms | 620.3ms | +4.0% | 620.3ms | 7.1ms | 10 |
| node | `manifest:transform` | 5 | 207.3ms | 209.7ms | +1.2% | 209.7ms | 45.3ms | 5 |
| node | `module:client-only-stub` | 5 | 100.3ms | 156.7ms | +56.2% | 156.7ms | 56.0ms | 5 |
| web | `manifest:stage` | 10 | 67.1ms | 61.8ms | -7.9% | 61.8ms | 8.7ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2082.1ms | 1918.4ms | -7.9% | 1918.4ms | 22.1ms | 10 |
| node | `route:module` | 5130 | 965.6ms | 936.1ms | -3.1% | 936.1ms | 5.8ms | 10 |
| web | `route:client-entry` | 5130 | 631.7ms | 628.2ms | -0.6% | 628.2ms | 7.7ms | 10 |
| node | `manifest:transform` | 5 | 207.7ms | 216.6ms | +4.3% | 216.6ms | 48.2ms | 5 |
| node | `module:client-only-stub` | 5 | 158.0ms | 100.0ms | -36.7% | 100.0ms | 30.8ms | 5 |
| web | `manifest:stage` | 10 | 50.5ms | 60.9ms | +20.6% | 60.9ms | 8.7ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1423.3ms | 1380.9ms | -3.0% | 1380.9ms | 16.0ms | 21 |
| node | `route:module` | 2580 | 590.7ms | 613.6ms | +3.9% | 613.6ms | 5.9ms | 20 |
| web | `route:client-entry` | 2581 | 409.0ms | 406.4ms | -0.6% | 406.4ms | 5.3ms | 21 |
| node | `manifest:transform` | 10 | 150.6ms | 154.4ms | +2.5% | 154.4ms | 18.8ms | 10 |
| node | `module:client-only-stub` | 10 | 92.9ms | 93.0ms | +0.1% | 93.0ms | 24.5ms | 10 |
| web | `manifest:stage` | 21 | 22.9ms | 21.6ms | -5.7% | 21.6ms | 1.4ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1299.9ms | 1415.5ms | +8.9% | 1415.5ms | 16.3ms | 21 |
| node | `route:module` | 2580 | 579.1ms | 555.3ms | -4.1% | 555.3ms | 9.3ms | 20 |
| web | `route:client-entry` | 2581 | 387.3ms | 395.2ms | +2.0% | 395.2ms | 5.6ms | 21 |
| node | `module:client-only-stub` | 10 | 198.4ms | 256.6ms | +29.3% | 256.6ms | 80.0ms | 10 |
| node | `manifest:transform` | 10 | 162.8ms | 147.0ms | -9.7% | 147.0ms | 17.8ms | 10 |
| web | `manifest:stage` | 21 | 22.0ms | 21.7ms | -1.4% | 21.7ms | 1.7ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1318.0ms | 1396.3ms | +5.9% | 1396.3ms | 10.2ms | 22 |
| node | `route:module` | 2580 | 575.3ms | 536.8ms | -6.7% | 536.8ms | 7.1ms | 20 |
| web | `route:client-entry` | 2582 | 376.3ms | 408.7ms | +8.6% | 408.7ms | 5.5ms | 22 |
| node | `manifest:transform` | 10 | 144.5ms | 159.3ms | +10.2% | 159.3ms | 22.1ms | 10 |
| node | `module:client-only-stub` | 10 | 63.1ms | 57.4ms | -9.0% | 57.4ms | 23.2ms | 10 |
| web | `manifest:stage` | 22 | 21.6ms | 22.1ms | +2.3% | 22.1ms | 1.4ms | 22 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 489.0ms | 409.4ms | -16.3% | 409.4ms | 8.7ms | 20 |
| node | `route:module` | 500 | 175.1ms | 152.3ms | -13.0% | 152.3ms | 0.7ms | 20 |
| web | `route:client-entry` | 500 | 103.7ms | 111.9ms | +7.9% | 111.9ms | 3.5ms | 20 |
| node | `module:client-only-stub` | 10 | 76.0ms | 91.5ms | +20.4% | 91.5ms | 13.6ms | 10 |
| node | `manifest:transform` | 10 | 50.4ms | 43.5ms | -13.7% | 43.5ms | 5.2ms | 10 |
| web | `manifest:stage` | 20 | 5.3ms | 5.6ms | +5.7% | 5.6ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 111.91s | 110.67s | -1.1% | 110.67s | - | 1.01x | - |
| complex app | 2 | 76.84s | 77.41s | +0.7% | 77.41s | - | 0.99x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 94.79s | 94.36s | -0.4% | 85.58s | 85.91s | 2.66s | 2.73s | 3.29s | 3.25s | -1.1% | 94.36s | - | 1.00x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28832360767)

