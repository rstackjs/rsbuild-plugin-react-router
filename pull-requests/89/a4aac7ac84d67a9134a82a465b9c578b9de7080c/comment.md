<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `a4aac7a` against base `602a929`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 28.40s | 28.13s | -1.0% | 18.93s | 18.67s | -1.4% | 3.85s | 3.90s | +1.2% | 3.24s | 3.17s | -2.2% | 1.01x |
| Large app | 1 | 13.30s | 13.34s | +0.3% | 8.11s | 8.10s | -0.1% | 1.92s | 1.94s | +0.6% | 1.72s | 1.75s | +1.8% | 1.00x |
| Standard fixtures | 6 | 15.10s | 14.78s | -2.1% | 10.82s | 10.57s | -2.3% | 1.93s | 1.96s | +1.7% | 1.52s | 1.41s | -6.8% | 1.02x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.46s | 8.46s | +0.0% | 8.50s | 8.74s | 1.00x | 1549 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.02s | 3.90s | -3.0% | 3.97s | 4.22s | 1.03x | 656 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.37s | 5.22s | -2.8% | 5.25s | 5.40s | 1.03x | 818 MB |
| `synthetic-256-sourcemaps` | 10 | 2.11s | 2.11s | -0.2% | 2.12s | 2.31s | 1.00x | 465 MB |
| `synthetic-256-ssr-esm` | 10 | 2.00s | 1.97s | -1.2% | 1.98s | 2.14s | 1.01x | 417 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.37s | 2.35s | -0.7% | 2.38s | 2.73s | 1.01x | 455 MB |
| `synthetic-48-ssr-esm` | 10 | 1.32s | 1.30s | -2.0% | 1.32s | 1.51s | 1.02x | 309 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.30s | 13.34s | +0.3% | 8.11s | 8.10s | 1.92s | 1.94s | 1.72s | 1.75s | +1.8% | 13.35s | 13.56s | 1.00x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.39s | 4.36s | -0.9% | 3.11s | 3.08s | 0.54s | 0.59s | 0.50s | 0.48s | -5.3% | 4.37s | 4.42s | 1.01x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.49s | 4.35s | -3.1% | 3.21s | 3.10s | 0.57s | 0.53s | 0.50s | 0.48s | -5.2% | 4.34s | 4.41s | 1.03x | - |
| `synthetic-256-sourcemaps` | 10 | 1.94s | 1.88s | -2.7% | 1.43s | 1.41s | 0.24s | 0.23s | 0.15s | 0.15s | -0.2% | 1.89s | 1.98s | 1.03x | - |
| `synthetic-256-ssr-esm` | 10 | 1.71s | 1.67s | -2.2% | 1.23s | 1.19s | 0.23s | 0.24s | 0.15s | 0.13s | -16.8% | 1.68s | 1.73s | 1.02x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.68s | 1.67s | -0.7% | 1.20s | 1.19s | 0.22s | 0.24s | 0.15s | 0.13s | -15.6% | 1.67s | 1.72s | 1.01x | - |
| `synthetic-48-ssr-esm` | 10 | 0.90s | 0.86s | -4.1% | 0.64s | 0.60s | 0.12s | 0.12s | 0.05s | 0.05s | -0.8% | 0.86s | 0.88s | 1.04x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1736.7ms | 1830.7ms | +5.4% | 1830.7ms | 16.0ms | 10 |
| node | `route:module` | 1785 | 899.0ms | 876.6ms | -2.5% | 876.6ms | 10.9ms | 10 |
| web | `route:client-entry` | 1785 | 369.4ms | 371.6ms | +0.6% | 371.6ms | 6.2ms | 10 |
| node | `manifest:transform` | 5 | 95.2ms | 111.9ms | +17.5% | 111.9ms | 28.0ms | 5 |
| web | `manifest:stage` | 10 | 18.2ms | 14.9ms | -18.1% | 14.9ms | 2.0ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2005.6ms | 2019.1ms | +0.7% | 2019.1ms | 27.6ms | 10 |
| node | `route:module` | 5130 | 947.6ms | 921.1ms | -2.8% | 921.1ms | 6.9ms | 10 |
| web | `route:client-entry` | 5130 | 600.7ms | 616.1ms | +2.6% | 616.1ms | 7.7ms | 10 |
| node | `manifest:transform` | 5 | 198.8ms | 193.0ms | -2.9% | 193.0ms | 41.6ms | 5 |
| node | `module:client-only-stub` | 5 | 117.6ms | 126.2ms | +7.3% | 126.2ms | 85.3ms | 5 |
| web | `manifest:stage` | 10 | 59.8ms | 53.2ms | -11.0% | 53.2ms | 8.5ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2079.3ms | 2057.3ms | -1.1% | 2057.3ms | 16.6ms | 10 |
| node | `route:module` | 5130 | 925.5ms | 957.4ms | +3.4% | 957.4ms | 7.0ms | 10 |
| web | `route:client-entry` | 5130 | 646.8ms | 604.0ms | -6.6% | 604.0ms | 7.9ms | 10 |
| node | `manifest:transform` | 5 | 207.5ms | 199.9ms | -3.7% | 199.9ms | 42.3ms | 5 |
| node | `module:client-only-stub` | 5 | 117.7ms | 241.6ms | +105.3% | 241.6ms | 116.5ms | 5 |
| web | `manifest:stage` | 10 | 63.4ms | 52.0ms | -18.0% | 52.0ms | 8.7ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1382.7ms | 1387.3ms | +0.3% | 1387.3ms | 14.0ms | 20 |
| node | `route:module` | 2580 | 583.4ms | 614.3ms | +5.3% | 614.3ms | 3.9ms | 20 |
| web | `route:client-entry` | 2580 | 398.1ms | 413.4ms | +3.8% | 413.4ms | 5.5ms | 20 |
| node | `module:client-only-stub` | 10 | 194.8ms | 167.1ms | -14.2% | 167.1ms | 54.2ms | 10 |
| node | `manifest:transform` | 10 | 157.9ms | 161.8ms | +2.5% | 161.8ms | 18.0ms | 10 |
| web | `manifest:stage` | 20 | 22.4ms | 21.1ms | -5.8% | 21.1ms | 1.5ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1308.1ms | 1415.9ms | +8.2% | 1415.9ms | 16.8ms | 21 |
| node | `route:module` | 2580 | 546.6ms | 550.3ms | +0.7% | 550.3ms | 5.0ms | 20 |
| web | `route:client-entry` | 2581 | 400.3ms | 400.1ms | -0.0% | 400.1ms | 5.7ms | 21 |
| node | `manifest:transform` | 10 | 154.5ms | 157.9ms | +2.2% | 157.9ms | 22.2ms | 10 |
| node | `module:client-only-stub` | 10 | 48.9ms | 250.1ms | +411.5% | 250.1ms | 92.6ms | 10 |
| web | `manifest:stage` | 21 | 24.0ms | 21.7ms | -9.6% | 21.7ms | 1.5ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1299.4ms | 1416.4ms | +9.0% | 1416.4ms | 22.5ms | 22 |
| node | `route:module` | 2580 | 574.1ms | 555.0ms | -3.3% | 555.0ms | 4.8ms | 20 |
| web | `route:client-entry` | 2582 | 386.1ms | 404.1ms | +4.7% | 404.1ms | 6.4ms | 22 |
| node | `module:client-only-stub` | 10 | 216.4ms | 104.3ms | -51.8% | 104.3ms | 76.9ms | 10 |
| node | `manifest:transform` | 10 | 155.6ms | 164.9ms | +6.0% | 164.9ms | 21.1ms | 10 |
| web | `manifest:stage` | 22 | 21.9ms | 22.4ms | +2.3% | 22.4ms | 1.5ms | 22 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 493.1ms | 403.0ms | -18.3% | 403.0ms | 8.5ms | 20 |
| node | `route:module` | 500 | 161.0ms | 152.4ms | -5.3% | 152.4ms | 0.7ms | 20 |
| web | `route:client-entry` | 500 | 108.1ms | 112.7ms | +4.3% | 112.7ms | 3.7ms | 20 |
| node | `module:client-only-stub` | 10 | 83.4ms | 85.6ms | +2.6% | 85.6ms | 14.3ms | 10 |
| node | `manifest:transform` | 10 | 49.0ms | 54.0ms | +10.2% | 54.0ms | 9.2ms | 10 |
| web | `manifest:stage` | 20 | 5.1ms | 5.7ms | +11.8% | 5.7ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 112.28s | 111.73s | -0.5% | 111.73s | - | 1.00x | - |
| complex app | 2 | 78.43s | 78.34s | -0.1% | 78.34s | - | 1.00x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 94.12s | 95.00s | +0.9% | 85.81s | 86.64s | 2.65s | 2.65s | 3.26s | 3.36s | +3.1% | 95.00s | - | 0.99x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29053802949)

