<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `a77b6c6` against base `602a929`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 23.93s | 23.43s | -2.1% | 15.85s | 15.84s | -0.1% | 2.98s | 3.05s | +2.2% | 3.13s | 2.80s | -10.6% | 1.02x |
| Large app | 1 | 11.33s | 11.45s | +1.1% | 6.99s | 7.25s | +3.7% | 1.47s | 1.48s | +0.7% | 1.69s | 1.61s | -4.5% | 0.99x |
| Standard fixtures | 6 | 12.60s | 11.97s | -5.0% | 8.86s | 8.59s | -3.1% | 1.51s | 1.56s | +3.7% | 1.44s | 1.19s | -17.6% | 1.05x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 7.53s | 7.68s | +2.1% | 7.73s | 7.92s | 0.98x | 1521 MB |
| `synthetic-1024-ssr-esm` | 5 | 2.84s | 2.92s | +2.9% | 2.94s | 3.06s | 0.97x | 667 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 3.85s | 3.82s | -0.9% | 3.82s | 4.01s | 1.01x | 831 MB |
| `synthetic-256-sourcemaps` | 10 | 1.58s | 1.58s | +0.2% | 1.57s | 1.65s | 1.00x | 469 MB |
| `synthetic-256-ssr-esm` | 10 | 1.45s | 1.47s | +1.3% | 1.48s | 1.59s | 0.99x | 412 MB |
| `synthetic-256-ssr-esm-split` | 10 | 1.71s | 1.71s | +0.1% | 1.71s | 1.84s | 1.00x | 467 MB |
| `synthetic-48-ssr-esm` | 10 | 0.97s | 0.95s | -2.4% | 0.96s | 1.11s | 1.02x | 318 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 11.33s | 11.45s | +1.1% | 6.99s | 7.25s | 1.47s | 1.48s | 1.69s | 1.61s | -4.5% | 11.69s | 12.50s | 0.99x | - |
| `synthetic-1024-ssr-esm` | 5 | 3.75s | 3.59s | -4.3% | 2.66s | 2.60s | 0.42s | 0.44s | 0.43s | 0.38s | -12.0% | 3.64s | 4.11s | 1.04x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 3.64s | 3.55s | -2.4% | 2.47s | 2.51s | 0.44s | 0.47s | 0.41s | 0.43s | +5.0% | 3.55s | 3.68s | 1.02x | - |
| `synthetic-256-sourcemaps` | 10 | 1.57s | 1.53s | -2.8% | 1.15s | 1.14s | 0.19s | 0.18s | 0.15s | 0.13s | -15.8% | 1.53s | 1.63s | 1.03x | - |
| `synthetic-256-ssr-esm` | 10 | 1.53s | 1.30s | -15.1% | 1.05s | 0.93s | 0.19s | 0.19s | 0.25s | 0.10s | -59.7% | 1.31s | 1.41s | 1.18x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.38s | 1.33s | -4.1% | 1.01s | 0.94s | 0.18s | 0.19s | 0.13s | 0.10s | -19.8% | 1.35s | 1.52s | 1.04x | - |
| `synthetic-48-ssr-esm` | 10 | 0.73s | 0.68s | -6.6% | 0.51s | 0.47s | 0.10s | 0.10s | 0.07s | 0.05s | -31.3% | 0.68s | 0.73s | 1.07x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1369.3ms | 1331.4ms | -2.8% | 1331.4ms | 12.0ms | 10 |
| node | `route:module` | 1785 | 698.5ms | 721.1ms | +3.2% | 721.1ms | 12.4ms | 10 |
| web | `route:client-entry` | 1785 | 277.9ms | 275.0ms | -1.0% | 275.0ms | 4.6ms | 10 |
| node | `manifest:transform` | 5 | 90.9ms | 83.5ms | -8.1% | 83.5ms | 24.9ms | 5 |
| web | `manifest:stage` | 10 | 12.0ms | 12.1ms | +0.8% | 12.1ms | 1.8ms | 10 |
| web | `manifest:transform` | 5 | 0.1ms | 0.5ms | +400.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 1715.7ms | 1688.4ms | -1.6% | 1688.4ms | 11.5ms | 10 |
| node | `route:module` | 5130 | 773.9ms | 784.9ms | +1.4% | 784.9ms | 8.2ms | 10 |
| web | `route:client-entry` | 5130 | 389.2ms | 422.5ms | +8.6% | 422.5ms | 5.7ms | 10 |
| node | `module:client-only-stub` | 5 | 156.5ms | 110.8ms | -29.2% | 110.8ms | 50.6ms | 5 |
| node | `manifest:transform` | 5 | 155.5ms | 159.5ms | +2.6% | 159.5ms | 33.9ms | 5 |
| web | `manifest:stage` | 10 | 55.1ms | 46.2ms | -16.2% | 46.2ms | 6.8ms | 10 |
| web | `manifest:transform` | 5 | 0.3ms | 0.5ms | +66.7% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 1677.9ms | 1701.8ms | +1.4% | 1701.8ms | 13.3ms | 10 |
| node | `route:module` | 5130 | 779.7ms | 771.0ms | -1.1% | 771.0ms | 7.8ms | 10 |
| web | `route:client-entry` | 5130 | 423.9ms | 444.6ms | +4.9% | 444.6ms | 6.0ms | 10 |
| node | `manifest:transform` | 5 | 158.6ms | 148.8ms | -6.2% | 148.8ms | 30.7ms | 5 |
| node | `module:client-only-stub` | 5 | 144.5ms | 49.4ms | -65.8% | 49.4ms | 13.2ms | 5 |
| web | `manifest:stage` | 10 | 44.1ms | 49.3ms | +11.8% | 49.3ms | 6.3ms | 10 |
| web | `manifest:transform` | 5 | 0.4ms | 0.5ms | +25.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1128.3ms | 1152.8ms | +2.2% | 1152.8ms | 18.2ms | 20 |
| node | `route:module` | 2580 | 536.2ms | 553.5ms | +3.2% | 553.5ms | 7.6ms | 20 |
| web | `route:client-entry` | 2580 | 267.9ms | 279.2ms | +4.2% | 279.2ms | 4.5ms | 20 |
| node | `manifest:transform` | 10 | 104.1ms | 113.6ms | +9.1% | 113.6ms | 15.8ms | 10 |
| node | `module:client-only-stub` | 10 | 88.1ms | 192.4ms | +118.4% | 192.4ms | 79.9ms | 10 |
| web | `manifest:stage` | 20 | 16.7ms | 16.4ms | -1.8% | 16.4ms | 1.2ms | 20 |
| web | `manifest:transform` | 10 | 0.7ms | 0.7ms | 0.0% | 0.7ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1060.9ms | 1149.4ms | +8.3% | 1149.4ms | 13.2ms | 21 |
| node | `route:module` | 2580 | 455.9ms | 449.7ms | -1.4% | 449.7ms | 8.1ms | 20 |
| web | `route:client-entry` | 2581 | 293.1ms | 287.2ms | -2.0% | 287.2ms | 4.4ms | 21 |
| node | `module:client-only-stub` | 10 | 158.1ms | 109.6ms | -30.7% | 109.6ms | 45.4ms | 10 |
| node | `manifest:transform` | 10 | 120.1ms | 112.5ms | -6.3% | 112.5ms | 16.1ms | 10 |
| web | `manifest:stage` | 21 | 17.0ms | 18.2ms | +7.1% | 18.2ms | 1.3ms | 21 |
| web | `manifest:transform` | 10 | 0.6ms | 0.8ms | +33.3% | 0.8ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1029.2ms | 1089.4ms | +5.8% | 1089.4ms | 14.6ms | 22 |
| node | `route:module` | 2580 | 438.6ms | 453.7ms | +3.4% | 453.7ms | 5.0ms | 20 |
| web | `route:client-entry` | 2582 | 284.1ms | 304.9ms | +7.3% | 304.9ms | 4.6ms | 22 |
| node | `manifest:transform` | 10 | 117.1ms | 130.0ms | +11.0% | 130.0ms | 16.3ms | 10 |
| node | `module:client-only-stub` | 10 | 75.1ms | 61.5ms | -18.1% | 61.5ms | 29.9ms | 10 |
| web | `manifest:stage` | 22 | 17.9ms | 19.1ms | +6.7% | 19.1ms | 1.3ms | 22 |
| web | `manifest:transform` | 10 | 0.8ms | 0.8ms | 0.0% | 0.8ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 501 | 385.9ms | 324.2ms | -16.0% | 324.2ms | 7.3ms | 21 |
| node | `route:module` | 500 | 122.4ms | 128.8ms | +5.2% | 128.8ms | 3.3ms | 20 |
| web | `route:client-entry` | 501 | 85.8ms | 89.6ms | +4.4% | 89.6ms | 2.6ms | 21 |
| node | `module:client-only-stub` | 10 | 83.8ms | 79.6ms | -5.0% | 79.6ms | 14.9ms | 10 |
| node | `manifest:transform` | 10 | 36.0ms | 35.2ms | -2.2% | 35.2ms | 5.4ms | 10 |
| web | `manifest:stage` | 21 | 4.3ms | 4.8ms | +11.6% | 4.8ms | 0.4ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 0.5ms | -50.0% | 0.5ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 87.28s | 84.36s | -3.3% | 84.36s | - | 1.03x | - |
| complex app | 2 | 61.06s | 63.21s | +3.5% | 63.21s | - | 0.97x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 70.17s | 75.82s | +8.1% | 63.01s | 68.16s | 1.96s | 2.10s | 3.58s | 3.84s | +7.0% | 75.82s | - | 0.93x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29053973688)

