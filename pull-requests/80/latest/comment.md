<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `c7a26ec` against base `c93ec98`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.19s | 28.67s | -1.8% | 19.38s | 19.03s | -1.8% | 4.01s | 3.99s | -0.5% | 3.22s | 3.11s | -3.4% | 1.02x |
| Large app | 1 | 13.77s | 13.52s | -1.8% | 8.31s | 8.21s | -1.2% | 2.03s | 1.96s | -3.4% | 1.75s | 1.70s | -3.2% | 1.02x |
| Standard fixtures | 6 | 15.43s | 15.15s | -1.8% | 11.07s | 10.82s | -2.2% | 1.97s | 2.03s | +2.6% | 1.47s | 1.41s | -3.7% | 1.02x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.62s | 8.68s | +0.7% | 8.72s | 9.04s | 0.99x | 1519 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.09s | 4.11s | +0.4% | 4.17s | 4.44s | 1.00x | 621 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.52s | 5.65s | +2.5% | 5.67s | 5.81s | 0.98x | 809 MB |
| `synthetic-256-sourcemaps` | 10 | 2.12s | 2.15s | +1.5% | 2.17s | 2.31s | 0.99x | 426 MB |
| `synthetic-256-ssr-esm` | 10 | 1.98s | 2.02s | +1.7% | 2.01s | 2.16s | 0.98x | 415 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.39s | 2.42s | +1.5% | 2.44s | 2.60s | 0.99x | 440 MB |
| `synthetic-48-ssr-esm` | 10 | 1.36s | 1.34s | -1.7% | 1.35s | 1.55s | 1.02x | 314 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.77s | 13.52s | -1.8% | 8.31s | 8.21s | 2.03s | 1.96s | 1.75s | 1.70s | -3.2% | 13.49s | 13.64s | 1.02x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.54s | 4.48s | -1.3% | 3.23s | 3.18s | 0.57s | 0.58s | 0.48s | 0.48s | -0.5% | 4.48s | 4.61s | 1.01x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.58s | 4.47s | -2.5% | 3.27s | 3.16s | 0.57s | 0.59s | 0.48s | 0.48s | +0.1% | 4.47s | 4.54s | 1.03x | - |
| `synthetic-256-sourcemaps` | 10 | 1.98s | 1.94s | -2.1% | 1.46s | 1.45s | 0.25s | 0.23s | 0.15s | 0.15s | -0.2% | 1.94s | 2.00s | 1.02x | - |
| `synthetic-256-ssr-esm` | 10 | 1.73s | 1.72s | -0.5% | 1.24s | 1.22s | 0.23s | 0.25s | 0.15s | 0.13s | -17.2% | 1.71s | 1.82s | 1.00x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.70s | 1.68s | -1.0% | 1.22s | 1.21s | 0.23s | 0.25s | 0.15s | 0.13s | -16.5% | 1.68s | 1.75s | 1.01x | - |
| `synthetic-48-ssr-esm` | 10 | 0.90s | 0.86s | -4.5% | 0.65s | 0.61s | 0.12s | 0.13s | 0.05s | 0.05s | -0.5% | 0.87s | 0.93s | 1.05x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1719.1ms | 1747.3ms | +1.6% | 1747.3ms | 12.6ms | 10 |
| node | `route:module` | 1785 | 826.2ms | 875.3ms | +5.9% | 875.3ms | 15.0ms | 10 |
| web | `route:client-entry` | 1785 | 389.1ms | 344.2ms | -11.5% | 344.2ms | 5.1ms | 10 |
| node | `manifest:transform` | 5 | 107.8ms | 147.3ms | +36.6% | 147.3ms | 37.9ms | 5 |
| web | `manifest:stage` | 10 | 14.0ms | 14.2ms | +1.4% | 14.2ms | 1.8ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2073.6ms | 2047.7ms | -1.2% | 2047.7ms | 17.9ms | 10 |
| node | `route:module` | 5130 | 933.8ms | 925.9ms | -0.8% | 925.9ms | 12.0ms | 10 |
| web | `route:client-entry` | 5130 | 605.5ms | 645.8ms | +6.7% | 645.8ms | 7.4ms | 10 |
| node | `manifest:transform` | 5 | 210.1ms | 203.0ms | -3.4% | 203.0ms | 44.1ms | 5 |
| node | `module:client-only-stub` | 5 | 138.0ms | 380.9ms | +176.0% | 380.9ms | 202.2ms | 5 |
| web | `manifest:stage` | 10 | 55.1ms | 49.2ms | -10.7% | 49.2ms | 8.1ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2065.4ms | 1976.3ms | -4.3% | 1976.3ms | 15.8ms | 10 |
| node | `route:module` | 5130 | 921.7ms | 910.4ms | -1.2% | 910.4ms | 11.4ms | 10 |
| web | `route:client-entry` | 5130 | 609.5ms | 605.5ms | -0.7% | 605.5ms | 6.2ms | 10 |
| node | `manifest:transform` | 5 | 204.9ms | 209.8ms | +2.4% | 209.8ms | 46.2ms | 5 |
| web | `manifest:stage` | 10 | 59.7ms | 60.6ms | +1.5% | 60.6ms | 8.2ms | 10 |
| node | `module:client-only-stub` | 5 | 51.9ms | 138.5ms | +166.9% | 138.5ms | 79.1ms | 5 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1400.2ms | 1389.6ms | -0.8% | 1389.6ms | 25.2ms | 21 |
| node | `route:module` | 2580 | 586.5ms | 610.3ms | +4.1% | 610.3ms | 3.9ms | 20 |
| web | `route:client-entry` | 2581 | 389.2ms | 402.1ms | +3.3% | 402.1ms | 5.3ms | 21 |
| node | `module:client-only-stub` | 10 | 332.1ms | 91.3ms | -72.5% | 91.3ms | 25.0ms | 10 |
| node | `manifest:transform` | 10 | 172.9ms | 145.4ms | -15.9% | 145.4ms | 21.2ms | 10 |
| web | `manifest:stage` | 21 | 21.6ms | 21.1ms | -2.3% | 21.1ms | 1.4ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1343.5ms | 1363.5ms | +1.5% | 1363.5ms | 15.3ms | 21 |
| node | `route:module` | 2580 | 541.2ms | 550.6ms | +1.7% | 550.6ms | 5.1ms | 20 |
| web | `route:client-entry` | 2581 | 365.9ms | 382.6ms | +4.6% | 382.6ms | 5.2ms | 21 |
| node | `manifest:transform` | 10 | 194.2ms | 167.2ms | -13.9% | 167.2ms | 21.0ms | 10 |
| node | `module:client-only-stub` | 10 | 182.9ms | 193.9ms | +6.0% | 193.9ms | 61.0ms | 10 |
| web | `manifest:stage` | 21 | 22.8ms | 21.4ms | -6.1% | 21.4ms | 1.4ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1299.8ms | 1384.6ms | +6.5% | 1384.6ms | 14.1ms | 20 |
| node | `route:module` | 2580 | 549.5ms | 544.6ms | -0.9% | 544.6ms | 4.5ms | 20 |
| web | `route:client-entry` | 2580 | 368.6ms | 384.7ms | +4.4% | 384.7ms | 5.6ms | 20 |
| node | `manifest:transform` | 10 | 159.4ms | 161.1ms | +1.1% | 161.1ms | 21.5ms | 10 |
| node | `module:client-only-stub` | 10 | 122.0ms | 306.9ms | +151.6% | 306.9ms | 117.8ms | 10 |
| web | `manifest:stage` | 20 | 21.7ms | 20.5ms | -5.5% | 20.5ms | 1.5ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 491.1ms | 407.4ms | -17.0% | 407.4ms | 9.1ms | 20 |
| node | `route:module` | 500 | 165.5ms | 156.1ms | -5.7% | 156.1ms | 0.7ms | 20 |
| web | `route:client-entry` | 500 | 101.9ms | 106.7ms | +4.7% | 106.7ms | 3.4ms | 20 |
| node | `module:client-only-stub` | 10 | 84.6ms | 78.6ms | -7.1% | 78.6ms | 10.8ms | 10 |
| node | `manifest:transform` | 10 | 51.4ms | 44.8ms | -12.8% | 44.8ms | 6.4ms | 10 |
| web | `manifest:stage` | 20 | 5.3ms | 5.5ms | +3.8% | 5.5ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 112.65s | 114.56s | +1.7% | 114.56s | - | 0.98x | - |
| complex app | 2 | 79.00s | 77.74s | -1.6% | 77.74s | - | 1.02x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 98.40s | 95.25s | -3.2% | 89.51s | 86.53s | 2.89s | 2.89s | 3.41s | 3.28s | -4.1% | 95.25s | - | 1.03x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28828687216)

