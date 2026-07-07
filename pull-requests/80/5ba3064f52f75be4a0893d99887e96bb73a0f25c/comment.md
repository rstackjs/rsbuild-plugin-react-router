<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `5ba3064` against base `7417e42`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.88s | 29.70s | -0.6% | 19.77s | 19.75s | -0.1% | 4.09s | 4.19s | +2.5% | 3.36s | 3.25s | -3.4% | 1.01x |
| Large app | 1 | 14.17s | 14.01s | -1.1% | 8.59s | 8.48s | -1.3% | 2.05s | 2.06s | +0.4% | 1.84s | 1.83s | -0.7% | 1.01x |
| Standard fixtures | 6 | 15.71s | 15.69s | -0.1% | 11.18s | 11.27s | +0.8% | 2.04s | 2.13s | +4.7% | 1.52s | 1.42s | -6.7% | 1.00x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.90s | 8.85s | -0.5% | 8.88s | 9.11s | 1.01x | 1524 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.20s | 4.22s | +0.4% | 4.27s | 4.55s | 1.00x | 636 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.82s | 5.73s | -1.6% | 5.73s | 5.91s | 1.02x | 816 MB |
| `synthetic-256-sourcemaps` | 10 | 2.19s | 2.16s | -1.1% | 2.18s | 2.37s | 1.01x | 439 MB |
| `synthetic-256-ssr-esm` | 10 | 2.04s | 2.00s | -2.0% | 2.02s | 2.17s | 1.02x | 399 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.45s | 2.51s | +2.8% | 2.51s | 2.70s | 0.97x | 440 MB |
| `synthetic-48-ssr-esm` | 10 | 1.35s | 1.35s | -0.5% | 1.37s | 1.62s | 1.00x | 309 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.17s | 14.01s | -1.1% | 8.59s | 8.48s | 2.05s | 2.06s | 1.84s | 1.83s | -0.7% | 14.23s | 15.12s | 1.01x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.58s | 4.71s | +2.9% | 3.26s | 3.40s | 0.60s | 0.61s | 0.50s | 0.48s | -5.1% | 4.68s | 4.72s | 0.97x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.64s | 4.57s | -1.5% | 3.25s | 3.21s | 0.56s | 0.63s | 0.51s | 0.48s | -5.0% | 4.59s | 4.67s | 1.02x | - |
| `synthetic-256-sourcemaps` | 10 | 2.04s | 2.02s | -1.2% | 1.50s | 1.52s | 0.26s | 0.24s | 0.15s | 0.15s | +0.5% | 2.01s | 2.09s | 1.01x | - |
| `synthetic-256-ssr-esm` | 10 | 1.78s | 1.74s | -2.0% | 1.27s | 1.25s | 0.25s | 0.26s | 0.15s | 0.13s | -16.7% | 1.75s | 1.79s | 1.02x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.77s | 1.74s | -1.7% | 1.26s | 1.24s | 0.24s | 0.26s | 0.15s | 0.13s | -17.2% | 1.75s | 1.85s | 1.02x | - |
| `synthetic-48-ssr-esm` | 10 | 0.90s | 0.91s | +0.9% | 0.64s | 0.65s | 0.13s | 0.13s | 0.05s | 0.05s | +0.1% | 0.91s | 0.94s | 0.99x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1751.3ms | 1675.4ms | -4.3% | 1675.4ms | 12.8ms | 10 |
| node | `route:module` | 1785 | 904.0ms | 887.1ms | -1.9% | 887.1ms | 8.5ms | 10 |
| web | `route:client-entry` | 1785 | 389.5ms | 375.5ms | -3.6% | 375.5ms | 5.5ms | 10 |
| node | `manifest:transform` | 5 | 115.9ms | 175.3ms | +51.3% | 175.3ms | 56.3ms | 5 |
| web | `manifest:stage` | 10 | 14.9ms | 15.6ms | +4.7% | 15.6ms | 2.0ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2071.1ms | 2104.5ms | +1.6% | 2104.5ms | 18.2ms | 10 |
| node | `route:module` | 5130 | 918.1ms | 958.2ms | +4.4% | 958.2ms | 6.7ms | 10 |
| web | `route:client-entry` | 5130 | 600.3ms | 657.1ms | +9.5% | 657.1ms | 7.6ms | 10 |
| node | `manifest:transform` | 5 | 208.1ms | 214.3ms | +3.0% | 214.3ms | 46.6ms | 5 |
| node | `module:client-only-stub` | 5 | 91.3ms | 64.9ms | -28.9% | 64.9ms | 25.6ms | 5 |
| web | `manifest:stage` | 10 | 50.7ms | 58.9ms | +16.2% | 58.9ms | 8.3ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2057.6ms | 2008.7ms | -2.4% | 2008.7ms | 13.6ms | 10 |
| node | `route:module` | 5130 | 927.6ms | 943.9ms | +1.8% | 943.9ms | 6.4ms | 10 |
| web | `route:client-entry` | 5130 | 629.6ms | 622.2ms | -1.2% | 622.2ms | 8.4ms | 10 |
| node | `manifest:transform` | 5 | 216.9ms | 221.9ms | +2.3% | 221.9ms | 47.8ms | 5 |
| node | `module:client-only-stub` | 5 | 118.4ms | 120.5ms | +1.8% | 120.5ms | 63.4ms | 5 |
| web | `manifest:stage` | 10 | 63.2ms | 49.4ms | -21.8% | 49.4ms | 8.5ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1439.9ms | 1442.8ms | +0.2% | 1442.8ms | 19.7ms | 21 |
| node | `route:module` | 2580 | 591.6ms | 618.0ms | +4.5% | 618.0ms | 6.3ms | 20 |
| web | `route:client-entry` | 2581 | 388.6ms | 399.8ms | +2.9% | 399.8ms | 5.8ms | 21 |
| node | `manifest:transform` | 10 | 143.2ms | 150.4ms | +5.0% | 150.4ms | 20.2ms | 10 |
| node | `module:client-only-stub` | 10 | 132.2ms | 202.2ms | +53.0% | 202.2ms | 74.5ms | 10 |
| web | `manifest:stage` | 21 | 22.7ms | 21.9ms | -3.5% | 21.9ms | 1.4ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1317.4ms | 1419.5ms | +7.8% | 1419.5ms | 22.6ms | 20 |
| node | `route:module` | 2580 | 536.8ms | 555.8ms | +3.5% | 555.8ms | 9.6ms | 20 |
| web | `route:client-entry` | 2580 | 377.5ms | 393.8ms | +4.3% | 393.8ms | 5.5ms | 20 |
| node | `manifest:transform` | 10 | 181.8ms | 185.8ms | +2.2% | 185.8ms | 29.3ms | 10 |
| node | `module:client-only-stub` | 10 | 120.5ms | 338.6ms | +181.0% | 338.6ms | 190.2ms | 10 |
| web | `manifest:stage` | 20 | 21.8ms | 22.0ms | +0.9% | 22.0ms | 1.5ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1325.1ms | 1397.3ms | +5.4% | 1397.3ms | 17.2ms | 21 |
| node | `route:module` | 2580 | 564.0ms | 554.6ms | -1.7% | 554.6ms | 4.6ms | 20 |
| web | `route:client-entry` | 2581 | 383.6ms | 396.5ms | +3.4% | 396.5ms | 5.3ms | 21 |
| node | `module:client-only-stub` | 10 | 217.5ms | 137.8ms | -36.6% | 137.8ms | 51.9ms | 10 |
| node | `manifest:transform` | 10 | 158.1ms | 184.0ms | +16.4% | 184.0ms | 28.6ms | 10 |
| web | `manifest:stage` | 21 | 22.6ms | 22.5ms | -0.4% | 22.5ms | 1.5ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 497.7ms | 445.9ms | -10.4% | 445.9ms | 9.8ms | 20 |
| node | `route:module` | 500 | 166.1ms | 163.0ms | -1.9% | 163.0ms | 4.4ms | 20 |
| web | `route:client-entry` | 500 | 103.9ms | 111.8ms | +7.6% | 111.8ms | 3.5ms | 20 |
| node | `module:client-only-stub` | 10 | 79.6ms | 72.9ms | -8.4% | 72.9ms | 11.9ms | 10 |
| node | `manifest:transform` | 10 | 53.2ms | 59.7ms | +12.2% | 59.7ms | 8.4ms | 10 |
| web | `manifest:stage` | 20 | 5.4ms | 5.9ms | +9.3% | 5.9ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 123.61s | 122.45s | -0.9% | 122.45s | - | 1.01x | - |
| complex app | 2 | 85.91s | 85.14s | -0.9% | 85.14s | - | 1.01x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 102.38s | 100.97s | -1.4% | 92.22s | 92.04s | 2.98s | 2.94s | 3.68s | 3.43s | -6.8% | 100.97s | - | 1.01x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28831450837)

