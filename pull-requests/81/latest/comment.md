<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `38c7685` against base `7417e42`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.55s | 28.49s | -3.6% | 19.54s | 18.98s | -2.8% | 4.01s | 3.98s | -0.9% | 3.37s | 3.14s | -6.7% | 1.04x |
| Large app | 1 | 14.03s | 13.36s | -4.8% | 8.41s | 8.13s | -3.3% | 2.01s | 1.97s | -2.0% | 1.82s | 1.73s | -5.1% | 1.05x |
| Standard fixtures | 6 | 15.51s | 15.13s | -2.5% | 11.13s | 10.85s | -2.5% | 2.00s | 2.00s | +0.2% | 1.55s | 1.41s | -8.5% | 1.03x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.71s | 8.58s | -1.5% | 8.62s | 8.81s | 1.01x | 1524 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.16s | 4.06s | -2.4% | 4.11s | 4.27s | 1.02x | 642 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.55s | 5.48s | -1.4% | 5.52s | 5.80s | 1.01x | 807 MB |
| `synthetic-256-sourcemaps` | 10 | 2.15s | 2.12s | -1.5% | 2.13s | 2.31s | 1.02x | 451 MB |
| `synthetic-256-ssr-esm` | 10 | 1.99s | 1.97s | -0.8% | 1.98s | 2.16s | 1.01x | 405 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.40s | 2.44s | +1.4% | 2.43s | 2.57s | 0.99x | 440 MB |
| `synthetic-48-ssr-esm` | 10 | 1.33s | 1.32s | -0.8% | 1.34s | 1.53s | 1.01x | 300 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.03s | 13.36s | -4.8% | 8.41s | 8.13s | 2.01s | 1.97s | 1.82s | 1.73s | -5.1% | 13.43s | 13.57s | 1.05x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.51s | 4.44s | -1.5% | 3.21s | 3.15s | 0.59s | 0.58s | 0.51s | 0.48s | -5.5% | 4.43s | 4.49s | 1.02x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.59s | 4.51s | -1.7% | 3.27s | 3.22s | 0.56s | 0.57s | 0.53s | 0.48s | -9.8% | 4.52s | 4.58s | 1.02x | - |
| `synthetic-256-sourcemaps` | 10 | 2.01s | 1.92s | -4.4% | 1.49s | 1.43s | 0.25s | 0.24s | 0.15s | 0.15s | -0.0% | 1.92s | 2.00s | 1.05x | - |
| `synthetic-256-ssr-esm` | 10 | 1.76s | 1.70s | -3.7% | 1.25s | 1.21s | 0.24s | 0.24s | 0.15s | 0.13s | -17.3% | 1.69s | 1.76s | 1.04x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.75s | 1.69s | -3.3% | 1.26s | 1.22s | 0.23s | 0.24s | 0.15s | 0.13s | -16.9% | 1.69s | 1.79s | 1.03x | - |
| `synthetic-48-ssr-esm` | 10 | 0.89s | 0.87s | -2.8% | 0.64s | 0.61s | 0.13s | 0.13s | 0.05s | 0.05s | +0.1% | 0.87s | 0.93s | 1.03x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1751.6ms | 1698.0ms | -3.1% | 1698.0ms | 16.7ms | 10 |
| node | `route:module` | 1785 | 882.5ms | 872.6ms | -1.1% | 872.6ms | 8.0ms | 10 |
| web | `route:client-entry` | 1785 | 369.1ms | 369.3ms | +0.1% | 369.3ms | 5.6ms | 10 |
| node | `manifest:transform` | 5 | 129.4ms | 130.5ms | +0.9% | 130.5ms | 28.9ms | 5 |
| web | `manifest:stage` | 10 | 14.3ms | 14.1ms | -1.4% | 14.1ms | 1.9ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2112.3ms | 1974.8ms | -6.5% | 1974.8ms | 9.5ms | 10 |
| node | `route:module` | 5130 | 925.4ms | 900.7ms | -2.7% | 900.7ms | 5.4ms | 10 |
| web | `route:client-entry` | 5130 | 624.0ms | 643.9ms | +3.2% | 643.9ms | 11.0ms | 10 |
| node | `manifest:transform` | 5 | 224.6ms | 213.9ms | -4.8% | 213.9ms | 44.8ms | 5 |
| node | `module:client-only-stub` | 5 | 118.6ms | 125.2ms | +5.6% | 125.2ms | 49.2ms | 5 |
| web | `manifest:stage` | 10 | 57.7ms | 46.2ms | -19.9% | 46.2ms | 6.6ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2087.5ms | 1987.5ms | -4.8% | 1987.5ms | 19.1ms | 10 |
| node | `route:module` | 5130 | 919.3ms | 933.2ms | +1.5% | 933.2ms | 6.7ms | 10 |
| web | `route:client-entry` | 5130 | 613.9ms | 644.0ms | +4.9% | 644.0ms | 7.4ms | 10 |
| node | `manifest:transform` | 5 | 206.9ms | 209.3ms | +1.2% | 209.3ms | 48.0ms | 5 |
| node | `module:client-only-stub` | 5 | 82.9ms | 68.6ms | -17.2% | 68.6ms | 26.4ms | 5 |
| web | `manifest:stage` | 10 | 57.7ms | 63.8ms | +10.6% | 63.8ms | 8.4ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1419.1ms | 1414.0ms | -0.4% | 1414.0ms | 17.4ms | 22 |
| node | `route:module` | 2580 | 577.9ms | 592.1ms | +2.5% | 592.1ms | 4.2ms | 20 |
| web | `route:client-entry` | 2582 | 391.0ms | 388.7ms | -0.6% | 388.7ms | 5.0ms | 22 |
| node | `module:client-only-stub` | 10 | 219.0ms | 350.4ms | +60.0% | 350.4ms | 148.5ms | 10 |
| node | `manifest:transform` | 10 | 155.0ms | 161.0ms | +3.9% | 161.0ms | 23.4ms | 10 |
| web | `manifest:stage` | 22 | 20.7ms | 21.2ms | +2.4% | 21.2ms | 1.3ms | 22 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1320.6ms | 1394.6ms | +5.6% | 1394.6ms | 19.2ms | 21 |
| node | `route:module` | 2580 | 561.2ms | 524.3ms | -6.6% | 524.3ms | 4.9ms | 20 |
| web | `route:client-entry` | 2581 | 367.0ms | 391.6ms | +6.7% | 391.6ms | 5.5ms | 21 |
| node | `manifest:transform` | 10 | 154.1ms | 147.8ms | -4.1% | 147.8ms | 19.5ms | 10 |
| node | `module:client-only-stub` | 10 | 115.8ms | 74.9ms | -35.3% | 74.9ms | 23.5ms | 10 |
| web | `manifest:stage` | 21 | 22.8ms | 21.0ms | -7.9% | 21.0ms | 1.4ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1362.5ms | 1374.3ms | +0.9% | 1374.3ms | 19.4ms | 22 |
| node | `route:module` | 2580 | 561.2ms | 537.0ms | -4.3% | 537.0ms | 4.8ms | 20 |
| web | `route:client-entry` | 2582 | 385.6ms | 387.8ms | +0.6% | 387.8ms | 5.1ms | 22 |
| node | `module:client-only-stub` | 10 | 250.5ms | 168.9ms | -32.6% | 168.9ms | 73.0ms | 10 |
| node | `manifest:transform` | 10 | 179.9ms | 165.7ms | -7.9% | 165.7ms | 21.9ms | 10 |
| web | `manifest:stage` | 22 | 23.5ms | 21.8ms | -7.2% | 21.8ms | 1.4ms | 22 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 493.8ms | 404.8ms | -18.0% | 404.8ms | 9.1ms | 20 |
| node | `route:module` | 500 | 167.6ms | 150.1ms | -10.4% | 150.1ms | 0.8ms | 20 |
| web | `route:client-entry` | 500 | 102.5ms | 112.3ms | +9.6% | 112.3ms | 3.4ms | 20 |
| node | `module:client-only-stub` | 10 | 93.4ms | 91.1ms | -2.5% | 91.1ms | 14.1ms | 10 |
| node | `manifest:transform` | 10 | 58.5ms | 53.4ms | -8.7% | 53.4ms | 6.8ms | 10 |
| web | `manifest:stage` | 20 | 5.9ms | 5.8ms | -1.7% | 5.8ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 112.31s | 112.21s | -0.1% | 112.21s | - | 1.00x | - |
| complex app | 2 | 78.65s | 79.86s | +1.5% | 79.86s | - | 0.98x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 97.41s | 96.30s | -1.1% | 88.58s | 87.60s | 2.87s | 2.87s | 3.40s | 3.29s | -3.0% | 96.30s | - | 1.01x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28830951295)

