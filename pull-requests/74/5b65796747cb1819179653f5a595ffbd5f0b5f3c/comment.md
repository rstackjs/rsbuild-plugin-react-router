<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `5b65796` against base `9018ef6`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 31.73s | 43.86s | +38.2% | 21.13s | 23.81s | +12.7% | 4.36s | 3.83s | -12.2% | 3.62s | 3.26s | -10.0% | 0.72x |
| Large app | 1 | 14.88s | 19.75s | +32.7% | 9.01s | 10.61s | +17.8% | 2.21s | 1.95s | -11.7% | 2.00s | 1.80s | -10.3% | 0.75x |
| Standard fixtures | 6 | 16.85s | 24.12s | +43.1% | 12.12s | 13.20s | +8.9% | 2.16s | 1.88s | -12.8% | 1.62s | 1.46s | -9.7% | 0.70x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 9.17s | 10.53s | +14.9% | 10.51s | 10.59s | 0.87x | 1590 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.27s | 4.40s | +2.9% | 4.43s | 4.64s | 0.97x | 667 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.85s | 6.34s | +8.4% | 6.38s | 6.61s | 0.92x | 845 MB |
| `synthetic-256-sourcemaps` | 10 | 2.33s | 2.26s | -2.8% | 2.28s | 2.47s | 1.03x | 452 MB |
| `synthetic-256-ssr-esm` | 10 | 2.13s | 2.13s | +0.2% | 2.14s | 2.29s | 1.00x | 433 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.54s | 2.65s | +4.5% | 2.67s | 2.83s | 0.96x | 480 MB |
| `synthetic-48-ssr-esm` | 10 | 1.41s | 1.37s | -2.6% | 1.40s | 1.67s | 1.03x | 324 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.88s | 19.75s | +32.7% | 9.01s | 10.61s | 2.21s | 1.95s | 2.00s | 1.80s | -10.3% | 19.74s | 20.00s | 0.75x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.91s | 7.59s | +54.7% | 3.51s | 3.94s | 0.59s | 0.54s | 0.56s | 0.53s | -4.8% | 7.54s | 7.61s | 0.65x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 5.00s | 7.59s | +51.6% | 3.58s | 3.95s | 0.64s | 0.53s | 0.53s | 0.50s | -5.3% | 7.57s | 7.61s | 0.66x | - |
| `synthetic-256-sourcemaps` | 10 | 2.17s | 3.07s | +41.8% | 1.60s | 1.70s | 0.27s | 0.23s | 0.15s | 0.13s | -16.9% | 3.04s | 3.12s | 0.71x | - |
| `synthetic-256-ssr-esm` | 10 | 1.89s | 2.42s | +28.4% | 1.36s | 1.45s | 0.26s | 0.23s | 0.15s | 0.13s | -17.4% | 2.39s | 2.44s | 0.78x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.89s | 2.39s | +26.2% | 1.36s | 1.48s | 0.26s | 0.22s | 0.15s | 0.13s | -16.0% | 2.38s | 2.46s | 0.79x | - |
| `synthetic-48-ssr-esm` | 10 | 0.99s | 1.05s | +6.5% | 0.70s | 0.68s | 0.14s | 0.13s | 0.08s | 0.05s | -32.8% | 1.05s | 1.07s | 0.94x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1852.9ms | 1597.0ms | -13.8% | 1597.0ms | 13.5ms | 10 |
| node | `route:module` | 1785 | 925.0ms | 777.7ms | -15.9% | 777.7ms | 11.1ms | 10 |
| web | `route:client-entry` | 1785 | 407.5ms | 439.4ms | +7.8% | 439.4ms | 10.0ms | 10 |
| node | `manifest:transform` | 5 | 98.4ms | 107.1ms | +8.8% | 107.1ms | 24.5ms | 5 |
| web | `manifest:stage` | 15 | 15.3ms | 20.0ms | +30.7% | 20.0ms | 1.9ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 139.8ms | - | 139.8ms | 15.3ms | 10 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2201.9ms | 1797.5ms | -18.4% | 1797.5ms | 6.8ms | 10 |
| node | `route:module` | 5130 | 962.8ms | 946.3ms | -1.7% | 946.3ms | 5.8ms | 10 |
| web | `route:client-entry` | 5130 | 650.3ms | 608.0ms | -6.5% | 608.0ms | 7.6ms | 10 |
| node | `manifest:transform` | 5 | 228.1ms | 209.9ms | -8.0% | 209.9ms | 49.1ms | 5 |
| node | `module:client-only-stub` | 5 | 74.3ms | 233.0ms | +213.6% | 233.0ms | 73.4ms | 5 |
| web | `manifest:stage` | 15 | 70.4ms | 58.0ms | -17.6% | 58.0ms | 6.6ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.2ms | - | 2.2ms | 0.4ms | 10 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2130.9ms | 1809.2ms | -15.1% | 1809.2ms | 7.7ms | 10 |
| node | `route:module` | 5130 | 962.2ms | 921.7ms | -4.2% | 921.7ms | 10.9ms | 10 |
| web | `route:client-entry` | 5130 | 641.5ms | 652.5ms | +1.7% | 652.5ms | 7.5ms | 10 |
| node | `manifest:transform` | 5 | 223.2ms | 187.7ms | -15.9% | 187.7ms | 41.9ms | 5 |
| node | `module:client-only-stub` | 5 | 64.6ms | 261.9ms | +305.4% | 261.9ms | 71.9ms | 5 |
| web | `manifest:stage` | 15 | 53.3ms | 57.5ms | +7.9% | 57.5ms | 6.5ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.3ms | - | 2.3ms | 0.4ms | 10 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1482.8ms | 1328.9ms | -10.4% | 1328.9ms | 17.3ms | 21 |
| node | `route:module` | 2580 | 609.1ms | 628.3ms | +3.2% | 628.3ms | 6.7ms | 20 |
| web | `route:client-entry` | 2581 | 426.9ms | 408.7ms | -4.3% | 408.7ms | 5.4ms | 21 |
| node | `manifest:transform` | 10 | 165.1ms | 156.2ms | -5.4% | 156.2ms | 21.1ms | 10 |
| node | `module:client-only-stub` | 10 | 65.4ms | 25.6ms | -60.9% | 25.6ms | 4.0ms | 10 |
| web | `manifest:stage` | 33 | 26.9ms | 29.9ms | +11.2% | 29.9ms | 3.4ms | 33 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 23 | - | 6.2ms | - | 6.2ms | 0.5ms | 23 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1413.0ms | 1253.1ms | -11.3% | 1253.1ms | 13.4ms | 22 |
| node | `route:module` | 2580 | 589.9ms | 605.8ms | +2.7% | 605.8ms | 8.4ms | 20 |
| web | `route:client-entry` | 2582 | 416.4ms | 382.3ms | -8.2% | 382.3ms | 5.8ms | 22 |
| node | `manifest:transform` | 10 | 164.9ms | 171.1ms | +3.8% | 171.1ms | 23.8ms | 10 |
| node | `module:client-only-stub` | 10 | 131.8ms | 21.0ms | -84.1% | 21.0ms | 2.5ms | 10 |
| web | `manifest:stage` | 32 | 23.7ms | 27.9ms | +17.7% | 27.9ms | 1.3ms | 32 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 22 | - | 4.5ms | - | 4.5ms | 0.4ms | 22 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2584 | 1443.8ms | 1231.0ms | -14.7% | 1231.0ms | 11.0ms | 24 |
| node | `route:module` | 2580 | 608.8ms | 585.1ms | -3.9% | 585.1ms | 5.0ms | 20 |
| node | `module:client-only-stub` | 10 | 426.3ms | 21.9ms | -94.9% | 21.9ms | 3.2ms | 10 |
| web | `route:client-entry` | 2584 | 409.7ms | 421.0ms | +2.8% | 421.0ms | 8.2ms | 24 |
| node | `manifest:transform` | 10 | 182.4ms | 178.0ms | -2.4% | 178.0ms | 25.0ms | 10 |
| web | `manifest:stage` | 34 | 22.5ms | 28.9ms | +28.4% | 28.9ms | 1.4ms | 34 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 24 | - | 4.8ms | - | 4.8ms | 0.4ms | 24 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 520.5ms | 371.8ms | -28.6% | 371.8ms | 8.9ms | 20 |
| node | `route:module` | 500 | 176.4ms | 138.5ms | -21.5% | 138.5ms | 0.8ms | 20 |
| web | `route:client-entry` | 500 | 114.0ms | 89.9ms | -21.1% | 89.9ms | 1.8ms | 20 |
| node | `module:client-only-stub` | 10 | 102.9ms | 81.3ms | -21.0% | 81.3ms | 13.2ms | 10 |
| node | `manifest:transform` | 10 | 54.6ms | 52.0ms | -4.8% | 52.0ms | 6.2ms | 10 |
| web | `manifest:stage` | 30 | 5.9ms | 7.5ms | +27.1% | 7.5ms | 0.4ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 4.7ms | - | 4.7ms | 0.4ms | 20 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 121.57s | 121.63s | +0.0% | 121.63s | - | 1.00x | - |
| complex app | 2 | 85.52s | 88.62s | +3.6% | 88.62s | - | 0.96x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 105.15s | 105.14s | -0.0% | 95.75s | 92.57s | 3.02s | 3.02s | 3.69s | 3.31s | -10.2% | 105.14s | - | 1.00x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28996660218)

