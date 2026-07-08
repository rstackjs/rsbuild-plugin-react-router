<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `dcbfdf0` against base `9018ef6`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 30.56s | 30.54s | -0.0% | 20.42s | 20.35s | -0.3% | 4.18s | 4.19s | +0.2% | 3.40s | 3.41s | +0.3% | 1.00x |
| Large app | 1 | 14.19s | 14.51s | +2.3% | 8.63s | 8.81s | +2.0% | 2.09s | 2.09s | -0.0% | 1.85s | 1.95s | +5.1% | 0.98x |
| Standard fixtures | 6 | 16.37s | 16.03s | -2.1% | 11.79s | 11.55s | -2.0% | 2.09s | 2.10s | +0.5% | 1.55s | 1.46s | -5.4% | 1.02x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 9.17s | 9.22s | +0.5% | 9.27s | 9.54s | 1.00x | 1524 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.27s | 4.28s | +0.2% | 4.35s | 4.68s | 1.00x | 649 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.77s | 5.87s | +1.7% | 5.87s | 6.00s | 0.98x | 830 MB |
| `synthetic-256-sourcemaps` | 10 | 2.31s | 2.29s | -0.7% | 2.31s | 2.48s | 1.01x | 439 MB |
| `synthetic-256-ssr-esm` | 10 | 2.09s | 2.14s | +2.6% | 2.15s | 2.27s | 0.98x | 427 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.56s | 2.57s | +0.3% | 2.59s | 2.76s | 1.00x | 466 MB |
| `synthetic-48-ssr-esm` | 10 | 1.39s | 1.37s | -0.8% | 1.40s | 1.59s | 1.01x | 307 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.19s | 14.51s | +2.3% | 8.63s | 8.81s | 2.09s | 2.09s | 1.85s | 1.95s | +5.1% | 14.57s | 15.08s | 0.98x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.77s | 4.70s | -1.6% | 3.41s | 3.35s | 0.58s | 0.60s | 0.51s | 0.50s | -0.9% | 4.71s | 4.81s | 1.02x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.82s | 4.75s | -1.5% | 3.46s | 3.41s | 0.61s | 0.60s | 0.50s | 0.50s | -0.6% | 4.71s | 4.79s | 1.02x | - |
| `synthetic-256-sourcemaps` | 10 | 2.08s | 2.03s | -2.3% | 1.55s | 1.53s | 0.26s | 0.25s | 0.15s | 0.15s | -0.4% | 2.04s | 2.13s | 1.02x | - |
| `synthetic-256-ssr-esm` | 10 | 1.85s | 1.82s | -1.9% | 1.33s | 1.29s | 0.25s | 0.25s | 0.15s | 0.13s | -16.8% | 1.80s | 1.88s | 1.02x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.87s | 1.83s | -2.0% | 1.32s | 1.33s | 0.25s | 0.27s | 0.15s | 0.13s | -16.1% | 1.84s | 1.93s | 1.02x | - |
| `synthetic-48-ssr-esm` | 10 | 0.97s | 0.90s | -7.2% | 0.70s | 0.64s | 0.14s | 0.13s | 0.08s | 0.05s | -32.8% | 0.90s | 0.98s | 1.08x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1726.9ms | 1830.2ms | +6.0% | 1830.2ms | 29.8ms | 10 |
| node | `route:module` | 1785 | 894.4ms | 893.4ms | -0.1% | 893.4ms | 13.2ms | 10 |
| web | `route:client-entry` | 1785 | 396.5ms | 380.8ms | -4.0% | 380.8ms | 6.6ms | 10 |
| node | `manifest:transform` | 5 | 110.5ms | 153.3ms | +38.7% | 153.3ms | 53.1ms | 5 |
| web | `manifest:stage` | 10 | 14.4ms | 14.8ms | +2.8% | 14.8ms | 2.0ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2161.4ms | 2068.4ms | -4.3% | 2068.4ms | 13.9ms | 10 |
| node | `route:module` | 5130 | 967.2ms | 968.0ms | +0.1% | 968.0ms | 6.7ms | 10 |
| web | `route:client-entry` | 5130 | 656.9ms | 664.9ms | +1.2% | 664.9ms | 7.1ms | 10 |
| node | `manifest:transform` | 5 | 226.5ms | 220.2ms | -2.8% | 220.2ms | 48.3ms | 5 |
| node | `module:client-only-stub` | 5 | 66.2ms | 159.6ms | +141.1% | 159.6ms | 62.4ms | 5 |
| web | `manifest:stage` | 10 | 58.0ms | 57.0ms | -1.7% | 57.0ms | 8.1ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2143.8ms | 2082.0ms | -2.9% | 2082.0ms | 18.9ms | 10 |
| node | `route:module` | 5130 | 993.9ms | 948.8ms | -4.5% | 948.8ms | 5.7ms | 10 |
| web | `route:client-entry` | 5130 | 654.1ms | 657.3ms | +0.5% | 657.3ms | 7.7ms | 10 |
| node | `module:client-only-stub` | 5 | 577.0ms | 130.6ms | -77.4% | 130.6ms | 43.5ms | 5 |
| node | `manifest:transform` | 5 | 221.3ms | 212.7ms | -3.9% | 212.7ms | 49.8ms | 5 |
| web | `manifest:stage` | 10 | 62.2ms | 48.8ms | -21.5% | 48.8ms | 8.1ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1467.4ms | 1428.7ms | -2.6% | 1428.7ms | 21.0ms | 22 |
| node | `route:module` | 2580 | 601.9ms | 635.4ms | +5.6% | 635.4ms | 4.5ms | 20 |
| web | `route:client-entry` | 2582 | 421.3ms | 403.0ms | -4.3% | 403.0ms | 5.5ms | 22 |
| node | `manifest:transform` | 10 | 172.8ms | 163.1ms | -5.6% | 163.1ms | 21.8ms | 10 |
| node | `module:client-only-stub` | 10 | 125.5ms | 159.1ms | +26.8% | 159.1ms | 76.2ms | 10 |
| web | `manifest:stage` | 22 | 24.4ms | 22.7ms | -7.0% | 22.7ms | 1.4ms | 22 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2583 | 1392.2ms | 1408.9ms | +1.2% | 1408.9ms | 20.3ms | 23 |
| node | `route:module` | 2580 | 557.0ms | 551.7ms | -1.0% | 551.7ms | 9.7ms | 20 |
| web | `route:client-entry` | 2583 | 395.6ms | 391.7ms | -1.0% | 391.7ms | 5.8ms | 23 |
| node | `manifest:transform` | 10 | 170.4ms | 159.0ms | -6.7% | 159.0ms | 23.7ms | 10 |
| node | `module:client-only-stub` | 10 | 102.8ms | 98.0ms | -4.7% | 98.0ms | 42.1ms | 10 |
| web | `manifest:stage` | 23 | 21.5ms | 23.8ms | +10.7% | 23.8ms | 1.4ms | 23 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1371.1ms | 1488.2ms | +8.5% | 1488.2ms | 19.6ms | 20 |
| node | `route:module` | 2580 | 607.0ms | 572.5ms | -5.7% | 572.5ms | 8.8ms | 20 |
| web | `route:client-entry` | 2580 | 393.3ms | 419.0ms | +6.5% | 419.0ms | 5.4ms | 20 |
| node | `module:client-only-stub` | 10 | 254.0ms | 85.1ms | -66.5% | 85.1ms | 37.1ms | 10 |
| node | `manifest:transform` | 10 | 149.4ms | 163.4ms | +9.4% | 163.4ms | 22.2ms | 10 |
| web | `manifest:stage` | 20 | 23.0ms | 21.8ms | -5.2% | 21.8ms | 1.5ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 508.6ms | 422.8ms | -16.9% | 422.8ms | 10.0ms | 20 |
| node | `route:module` | 500 | 183.5ms | 163.6ms | -10.8% | 163.6ms | 0.8ms | 20 |
| web | `route:client-entry` | 500 | 112.9ms | 116.6ms | +3.3% | 116.6ms | 3.6ms | 20 |
| node | `module:client-only-stub` | 10 | 104.4ms | 89.5ms | -14.3% | 89.5ms | 12.9ms | 10 |
| node | `manifest:transform` | 10 | 60.7ms | 53.1ms | -12.5% | 53.1ms | 7.8ms | 10 |
| web | `manifest:stage` | 20 | 6.0ms | 5.7ms | -5.0% | 5.7ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 123.61s | 117.54s | -4.9% | 117.54s | - | 1.05x | - |
| complex app | 2 | 97.34s | 86.68s | -10.9% | 86.68s | - | 1.12x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 103.43s | 102.16s | -1.2% | 94.28s | 93.09s | 2.96s | 2.96s | 3.50s | 3.49s | -0.3% | 102.16s | - | 1.01x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28975283152)

