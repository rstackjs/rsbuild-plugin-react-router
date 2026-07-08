<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `f776aad` against base `9018ef6`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 23.43s | 22.73s | -3.0% | 16.08s | 15.20s | -5.4% | 2.85s | 2.82s | -1.2% | 2.86s | 2.85s | -0.4% | 1.03x |
| Large app | 1 | 11.45s | 11.45s | +0.1% | 7.51s | 7.32s | -2.5% | 1.38s | 1.37s | -0.8% | 1.57s | 1.63s | +4.2% | 1.00x |
| Standard fixtures | 6 | 11.98s | 11.28s | -5.9% | 8.56s | 7.88s | -8.0% | 1.47s | 1.44s | -1.6% | 1.29s | 1.22s | -5.9% | 1.06x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 | Head client JS gzip | Client JS gzip delta | Head total gzip |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 7.80s | 7.67s | -1.6% | 7.66s | 7.86s | 1.02x | 1538 MB | 5.0 MB | +0.2% | 14.8 MB |
| `synthetic-1024-ssr-esm` | 5 | 2.82s | 2.92s | +3.4% | 2.98s | 3.25s | 0.97x | 670 MB | 626.1 kB | -4.1% | 1.4 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 3.81s | 3.93s | +3.1% | 3.93s | 4.04s | 0.97x | 828 MB | 927.8 kB | -2.5% | 1.7 MB |
| `synthetic-256-sourcemaps` | 10 | 1.54s | 1.58s | +2.8% | 1.60s | 1.76s | 0.97x | 452 MB | 228.7 kB | -2.9% | 1.4 MB |
| `synthetic-256-ssr-esm` | 10 | 1.44s | 1.49s | +3.6% | 1.53s | 1.84s | 0.97x | 429 MB | 228.7 kB | -2.9% | 918.8 kB |
| `synthetic-256-ssr-esm-split` | 10 | 1.76s | 1.78s | +1.2% | 1.77s | 1.92s | 0.99x | 467 MB | 305.6 kB | -1.9% | 998.3 kB |
| `synthetic-48-ssr-esm` | 10 | 0.96s | 1.00s | +5.0% | 1.01s | 1.17s | 0.95x | 313 MB | 121.9 kB | -1.1% | 763.9 kB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 11.45s | 11.45s | +0.1% | 7.51s | 7.32s | 1.38s | 1.37s | 1.57s | 1.63s | +4.2% | 11.40s | 11.66s | 1.00x | - |
| `synthetic-1024-ssr-esm` | 5 | 3.52s | 3.35s | -5.1% | 2.55s | 2.29s | 0.43s | 0.41s | 0.41s | 0.46s | +12.0% | 3.33s | 3.53s | 1.05x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 3.40s | 3.22s | -5.3% | 2.40s | 2.30s | 0.38s | 0.41s | 0.40s | 0.35s | -12.3% | 3.23s | 3.27s | 1.06x | - |
| `synthetic-256-sourcemaps` | 10 | 1.59s | 1.56s | -1.7% | 1.18s | 1.09s | 0.19s | 0.17s | 0.15s | 0.15s | +0.4% | 1.55s | 1.82s | 1.02x | - |
| `synthetic-256-ssr-esm` | 10 | 1.38s | 1.26s | -8.7% | 0.98s | 0.89s | 0.19s | 0.18s | 0.13s | 0.10s | -20.3% | 1.28s | 1.55s | 1.09x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.36s | 1.27s | -7.2% | 0.95s | 0.88s | 0.18s | 0.18s | 0.13s | 0.10s | -20.1% | 1.27s | 1.40s | 1.08x | - |
| `synthetic-48-ssr-esm` | 10 | 0.73s | 0.63s | -14.2% | 0.51s | 0.43s | 0.10s | 0.09s | 0.08s | 0.05s | -31.7% | 0.64s | 0.68s | 1.17x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1251.2ms | 1235.6ms | -1.2% | 1235.6ms | 9.6ms | 10 |
| node | `route:module` | 1785 | 661.1ms | 659.3ms | -0.3% | 659.3ms | 6.0ms | 10 |
| web | `route:client-entry` | 1785 | 267.7ms | 274.1ms | +2.4% | 274.1ms | 4.4ms | 10 |
| node | `manifest:transform` | 5 | 87.3ms | 74.5ms | -14.7% | 74.5ms | 23.6ms | 5 |
| web | `manifest:stage` | 10 | 11.5ms | 11.6ms | +0.9% | 11.6ms | 1.7ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.3ms | -40.0% | 0.3ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 1642.7ms | 1552.2ms | -5.5% | 1552.2ms | 8.8ms | 10 |
| node | `route:module` | 5130 | 750.0ms | 754.3ms | +0.6% | 754.3ms | 4.8ms | 10 |
| web | `route:client-entry` | 5130 | 398.4ms | 387.7ms | -2.7% | 387.7ms | 6.0ms | 10 |
| node | `manifest:transform` | 5 | 155.1ms | 146.5ms | -5.5% | 146.5ms | 30.9ms | 5 |
| node | `module:client-only-stub` | 5 | 53.8ms | 109.5ms | +103.5% | 109.5ms | 48.6ms | 5 |
| web | `manifest:stage` | 10 | 46.3ms | 35.9ms | -22.5% | 35.9ms | 6.2ms | 10 |
| web | `manifest:transform` | 5 | 0.2ms | 0.4ms | +100.0% | 0.4ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 1614.2ms | 1590.4ms | -1.5% | 1590.4ms | 11.0ms | 10 |
| node | `route:module` | 5130 | 729.7ms | 718.2ms | -1.6% | 718.2ms | 4.7ms | 10 |
| web | `route:client-entry` | 5130 | 375.7ms | 402.6ms | +7.2% | 402.6ms | 6.8ms | 10 |
| node | `manifest:transform` | 5 | 147.1ms | 139.3ms | -5.3% | 139.3ms | 29.2ms | 5 |
| node | `module:client-only-stub` | 5 | 94.5ms | 91.4ms | -3.3% | 91.4ms | 56.8ms | 5 |
| web | `manifest:stage` | 10 | 53.0ms | 43.9ms | -17.2% | 43.9ms | 6.1ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.4ms | -20.0% | 0.4ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1109.9ms | 1033.2ms | -6.9% | 1033.2ms | 12.3ms | 21 |
| node | `route:module` | 2580 | 511.0ms | 523.2ms | +2.4% | 523.2ms | 6.0ms | 20 |
| web | `route:client-entry` | 2581 | 272.6ms | 244.9ms | -10.2% | 244.9ms | 4.0ms | 21 |
| node | `module:client-only-stub` | 10 | 153.8ms | 85.5ms | -44.4% | 85.5ms | 32.5ms | 10 |
| node | `manifest:transform` | 10 | 106.6ms | 104.5ms | -2.0% | 104.5ms | 14.4ms | 10 |
| web | `manifest:stage` | 21 | 16.6ms | 15.8ms | -4.8% | 15.8ms | 1.1ms | 21 |
| web | `manifest:transform` | 10 | 0.6ms | 0.6ms | 0.0% | 0.6ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1100.3ms | 1030.4ms | -6.4% | 1030.4ms | 11.2ms | 21 |
| node | `route:module` | 2580 | 478.9ms | 421.2ms | -12.0% | 421.2ms | 4.4ms | 20 |
| web | `route:client-entry` | 2581 | 292.8ms | 259.7ms | -11.3% | 259.7ms | 4.0ms | 21 |
| node | `manifest:transform` | 10 | 102.2ms | 113.7ms | +11.3% | 113.7ms | 13.7ms | 10 |
| node | `module:client-only-stub` | 10 | 87.2ms | 48.3ms | -44.6% | 48.3ms | 29.9ms | 10 |
| web | `manifest:stage` | 21 | 17.9ms | 16.9ms | -5.6% | 16.9ms | 1.3ms | 21 |
| web | `manifest:transform` | 10 | 0.6ms | 0.3ms | -50.0% | 0.3ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1021.5ms | 1067.3ms | +4.5% | 1067.3ms | 10.1ms | 22 |
| node | `route:module` | 2580 | 434.1ms | 424.5ms | -2.2% | 424.5ms | 7.7ms | 20 |
| web | `route:client-entry` | 2582 | 270.8ms | 267.3ms | -1.3% | 267.3ms | 4.0ms | 22 |
| node | `manifest:transform` | 10 | 109.5ms | 113.1ms | +3.3% | 113.1ms | 17.8ms | 10 |
| node | `module:client-only-stub` | 10 | 61.9ms | 38.2ms | -38.3% | 38.2ms | 22.2ms | 10 |
| web | `manifest:stage` | 22 | 16.7ms | 17.5ms | +4.8% | 17.5ms | 1.1ms | 22 |
| web | `manifest:transform` | 10 | 0.7ms | 0.5ms | -28.6% | 0.5ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 393.7ms | 301.8ms | -23.3% | 301.8ms | 8.0ms | 20 |
| node | `route:module` | 500 | 121.5ms | 112.2ms | -7.7% | 112.2ms | 2.8ms | 20 |
| web | `route:client-entry` | 500 | 84.2ms | 86.1ms | +2.3% | 86.1ms | 2.3ms | 20 |
| node | `module:client-only-stub` | 10 | 76.7ms | 74.7ms | -2.6% | 74.7ms | 11.8ms | 10 |
| node | `manifest:transform` | 10 | 34.4ms | 27.4ms | -20.3% | 27.4ms | 3.5ms | 10 |
| web | `manifest:stage` | 20 | 4.1ms | 4.0ms | -2.4% | 4.0ms | 0.3ms | 20 |
| web | `manifest:transform` | 10 | 0.9ms | 0.6ms | -33.3% | 0.6ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 | Head client JS gzip | Client JS gzip delta | Head total gzip |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 87.93s | 85.33s | -3.0% | 85.33s | - | 1.03x | - | - | - | - |
| complex app | 2 | 61.32s | 61.55s | +0.4% | 61.55s | - | 1.00x | - | - | - | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 73.41s | 72.96s | -0.6% | 65.84s | 65.75s | 1.98s | 1.99s | 3.91s | 3.54s | -9.5% | 72.96s | - | 1.01x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28964476531)

