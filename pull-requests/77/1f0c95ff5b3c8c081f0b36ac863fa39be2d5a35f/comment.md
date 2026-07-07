<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `1f0c95f` against base `7417e42`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 27.83s | 27.47s | -1.3% | 18.49s | 18.32s | -0.9% | 3.77s | 3.86s | +2.6% | 3.22s | 3.03s | -5.9% | 1.01x |
| Large app | 1 | 13.02s | 13.05s | +0.2% | 7.90s | 7.99s | +1.2% | 1.86s | 1.87s | +0.6% | 1.75s | 1.72s | -1.7% | 1.00x |
| Standard fixtures | 6 | 14.81s | 14.43s | -2.6% | 10.59s | 10.33s | -2.5% | 1.91s | 1.99s | +4.4% | 1.47s | 1.31s | -10.9% | 1.03x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.54s | 8.29s | -2.9% | 8.33s | 8.43s | 1.03x | 1524 MB |
| `synthetic-1024-ssr-esm` | 5 | 3.92s | 3.81s | -2.8% | 3.86s | 4.09s | 1.03x | 637 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.19s | 5.09s | -1.9% | 5.08s | 5.23s | 1.02x | 807 MB |
| `synthetic-256-sourcemaps` | 10 | 2.04s | 1.99s | -2.6% | 2.00s | 2.16s | 1.03x | 447 MB |
| `synthetic-256-ssr-esm` | 10 | 1.91s | 1.92s | +0.1% | 1.92s | 2.09s | 1.00x | 396 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.29s | 2.24s | -1.9% | 2.25s | 2.41s | 1.02x | 442 MB |
| `synthetic-48-ssr-esm` | 10 | 1.30s | 1.30s | -0.2% | 1.32s | 1.50s | 1.00x | 315 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.02s | 13.05s | +0.2% | 7.90s | 7.99s | 1.86s | 1.87s | 1.75s | 1.72s | -1.7% | 13.01s | 13.16s | 1.00x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.36s | 4.24s | -2.8% | 3.10s | 3.00s | 0.54s | 0.57s | 0.48s | 0.43s | -10.4% | 4.23s | 4.29s | 1.03x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.38s | 4.26s | -2.7% | 3.10s | 3.06s | 0.53s | 0.57s | 0.51s | 0.43s | -15.8% | 4.25s | 4.27s | 1.03x | - |
| `synthetic-256-sourcemaps` | 10 | 1.87s | 1.87s | -0.1% | 1.39s | 1.39s | 0.25s | 0.25s | 0.13s | 0.15s | +16.4% | 1.87s | 1.91s | 1.00x | - |
| `synthetic-256-ssr-esm` | 10 | 1.68s | 1.61s | -4.0% | 1.20s | 1.14s | 0.24s | 0.24s | 0.15s | 0.13s | -16.9% | 1.60s | 1.67s | 1.04x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.65s | 1.61s | -2.3% | 1.18s | 1.16s | 0.23s | 0.24s | 0.15s | 0.13s | -17.1% | 1.61s | 1.68s | 1.02x | - |
| `synthetic-48-ssr-esm` | 10 | 0.87s | 0.83s | -4.5% | 0.63s | 0.59s | 0.12s | 0.12s | 0.05s | 0.05s | -1.0% | 0.83s | 0.90s | 1.05x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1733.7ms | 1728.6ms | -0.3% | 1728.6ms | 29.0ms | 10 |
| node | `route:module` | 1785 | 858.1ms | 884.0ms | +3.0% | 884.0ms | 11.7ms | 10 |
| web | `route:client-entry` | 1785 | 365.1ms | 354.7ms | -2.8% | 354.7ms | 5.4ms | 10 |
| node | `manifest:transform` | 5 | 108.1ms | 153.5ms | +42.0% | 153.5ms | 55.7ms | 5 |
| web | `manifest:stage` | 10 | 19.5ms | 18.9ms | -3.1% | 18.9ms | 6.1ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2067.8ms | 2030.7ms | -1.8% | 2030.7ms | 18.6ms | 10 |
| node | `route:module` | 5130 | 965.6ms | 949.6ms | -1.7% | 949.6ms | 6.0ms | 10 |
| web | `route:client-entry` | 5130 | 552.9ms | 570.9ms | +3.3% | 570.9ms | 7.3ms | 10 |
| node | `module:client-only-stub` | 5 | 254.6ms | 102.0ms | -59.9% | 102.0ms | 66.5ms | 5 |
| node | `manifest:transform` | 5 | 192.6ms | 198.6ms | +3.1% | 198.6ms | 52.8ms | 5 |
| web | `manifest:stage` | 10 | 58.2ms | 63.7ms | +9.5% | 63.7ms | 10.0ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2069.0ms | 2020.9ms | -2.3% | 2020.9ms | 18.8ms | 10 |
| node | `route:module` | 5130 | 977.8ms | 971.2ms | -0.7% | 971.2ms | 7.1ms | 10 |
| web | `route:client-entry` | 5130 | 567.7ms | 578.8ms | +2.0% | 578.8ms | 7.4ms | 10 |
| node | `manifest:transform` | 5 | 210.2ms | 195.1ms | -7.2% | 195.1ms | 41.0ms | 5 |
| node | `module:client-only-stub` | 5 | 121.2ms | 77.3ms | -36.2% | 77.3ms | 19.4ms | 5 |
| web | `manifest:stage` | 10 | 68.5ms | 62.4ms | -8.9% | 62.4ms | 9.3ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1364.4ms | 1403.8ms | +2.9% | 1403.8ms | 20.5ms | 21 |
| node | `route:module` | 2580 | 590.7ms | 605.8ms | +2.6% | 605.8ms | 4.6ms | 20 |
| web | `route:client-entry` | 2581 | 375.8ms | 380.1ms | +1.1% | 380.1ms | 5.3ms | 21 |
| node | `module:client-only-stub` | 10 | 212.2ms | 207.1ms | -2.4% | 207.1ms | 69.0ms | 10 |
| node | `manifest:transform` | 10 | 158.5ms | 151.1ms | -4.7% | 151.1ms | 17.7ms | 10 |
| web | `manifest:stage` | 21 | 21.9ms | 22.0ms | +0.5% | 22.0ms | 1.4ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2583 | 1260.8ms | 1290.6ms | +2.4% | 1290.6ms | 17.9ms | 23 |
| node | `route:module` | 2580 | 599.2ms | 528.4ms | -11.8% | 528.4ms | 4.8ms | 20 |
| web | `route:client-entry` | 2583 | 370.8ms | 351.2ms | -5.3% | 351.2ms | 5.0ms | 23 |
| node | `module:client-only-stub` | 10 | 162.8ms | 212.1ms | +30.3% | 212.1ms | 46.9ms | 10 |
| node | `manifest:transform` | 10 | 142.5ms | 156.0ms | +9.5% | 156.0ms | 22.2ms | 10 |
| web | `manifest:stage` | 23 | 23.2ms | 23.0ms | -0.9% | 23.0ms | 1.4ms | 23 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1276.4ms | 1374.2ms | +7.7% | 1374.2ms | 18.3ms | 21 |
| node | `route:module` | 2580 | 554.6ms | 542.0ms | -2.3% | 542.0ms | 5.2ms | 20 |
| web | `route:client-entry` | 2581 | 345.6ms | 371.0ms | +7.3% | 371.0ms | 4.9ms | 21 |
| node | `manifest:transform` | 10 | 153.9ms | 156.2ms | +1.5% | 156.2ms | 20.2ms | 10 |
| node | `module:client-only-stub` | 10 | 117.8ms | 237.9ms | +102.0% | 237.9ms | 81.8ms | 10 |
| web | `manifest:stage` | 21 | 22.3ms | 21.3ms | -4.5% | 21.3ms | 1.4ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 495.0ms | 409.5ms | -17.3% | 409.5ms | 9.2ms | 20 |
| node | `route:module` | 500 | 149.3ms | 148.4ms | -0.6% | 148.4ms | 0.9ms | 20 |
| web | `route:client-entry` | 500 | 98.0ms | 108.3ms | +10.5% | 108.3ms | 2.9ms | 20 |
| node | `module:client-only-stub` | 10 | 85.5ms | 80.7ms | -5.6% | 80.7ms | 15.5ms | 10 |
| node | `manifest:transform` | 10 | 54.6ms | 49.1ms | -10.1% | 49.1ms | 8.0ms | 10 |
| web | `manifest:stage` | 20 | 5.6ms | 5.5ms | -1.8% | 5.5ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 107.76s | 107.78s | +0.0% | 107.78s | - | 1.00x | - |
| complex app | 2 | 76.50s | 74.84s | -2.2% | 74.84s | - | 1.02x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 94.04s | 93.78s | -0.3% | 85.81s | 85.61s | 2.66s | 2.68s | 3.35s | 3.23s | -3.7% | 93.78s | - | 1.00x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28830886108)

