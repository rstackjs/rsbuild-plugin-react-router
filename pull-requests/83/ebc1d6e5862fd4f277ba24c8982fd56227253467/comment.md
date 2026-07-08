<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `ebc1d6e` against base `9e95ea0`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.37s | 28.99s | -1.3% | 19.51s | 19.39s | -0.6% | 4.11s | 3.98s | -3.0% | 3.29s | 3.16s | -3.8% | 1.01x |
| Large app | 1 | 13.84s | 13.66s | -1.3% | 8.41s | 8.34s | -0.8% | 2.08s | 1.98s | -4.9% | 1.80s | 1.75s | -2.8% | 1.01x |
| Standard fixtures | 6 | 15.53s | 15.33s | -1.3% | 11.11s | 11.05s | -0.5% | 2.03s | 2.01s | -1.1% | 1.49s | 1.41s | -4.9% | 1.01x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.59s | 8.63s | +0.5% | 8.68s | 8.94s | 1.00x | 1530 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.34s | 4.17s | -4.0% | 4.19s | 4.37s | 1.04x | 644 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.66s | 5.67s | +0.1% | 5.68s | 5.73s | 1.00x | 826 MB |
| `synthetic-256-sourcemaps` | 10 | 2.19s | 2.21s | +0.8% | 2.21s | 2.35s | 0.99x | 451 MB |
| `synthetic-256-ssr-esm` | 10 | 2.07s | 2.05s | -1.1% | 2.06s | 2.20s | 1.01x | 434 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.49s | 2.47s | -1.0% | 2.48s | 2.64s | 1.01x | 464 MB |
| `synthetic-48-ssr-esm` | 10 | 1.38s | 1.32s | -4.3% | 1.35s | 1.60s | 1.05x | 311 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.84s | 13.66s | -1.3% | 8.41s | 8.34s | 2.08s | 1.98s | 1.80s | 1.75s | -2.8% | 13.88s | 14.69s | 1.01x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.53s | 4.51s | -0.4% | 3.22s | 3.23s | 0.56s | 0.59s | 0.50s | 0.48s | -5.1% | 4.50s | 4.56s | 1.00x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.55s | 4.52s | -0.6% | 3.23s | 3.25s | 0.59s | 0.57s | 0.48s | 0.48s | +0.2% | 4.61s | 4.95s | 1.01x | - |
| `synthetic-256-sourcemaps` | 10 | 2.01s | 1.96s | -2.6% | 1.49s | 1.48s | 0.26s | 0.23s | 0.15s | 0.15s | +0.5% | 1.98s | 2.10s | 1.03x | - |
| `synthetic-256-ssr-esm` | 10 | 1.75s | 1.73s | -1.1% | 1.25s | 1.23s | 0.25s | 0.24s | 0.15s | 0.13s | -16.4% | 1.72s | 1.76s | 1.01x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.77s | 1.73s | -2.5% | 1.26s | 1.25s | 0.24s | 0.25s | 0.15s | 0.13s | -16.6% | 1.72s | 1.76s | 1.03x | - |
| `synthetic-48-ssr-esm` | 10 | 0.92s | 0.88s | -3.6% | 0.66s | 0.63s | 0.13s | 0.13s | 0.05s | 0.05s | +1.6% | 0.87s | 0.89s | 1.04x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1717.2ms | 1704.1ms | -0.8% | 1704.1ms | 22.8ms | 10 |
| node | `route:module` | 1785 | 891.4ms | 872.9ms | -2.1% | 872.9ms | 10.8ms | 10 |
| web | `route:client-entry` | 1785 | 382.8ms | 379.5ms | -0.9% | 379.5ms | 5.3ms | 10 |
| node | `manifest:transform` | 5 | 99.2ms | 116.7ms | +17.6% | 116.7ms | 32.1ms | 5 |
| web | `manifest:stage` | 10 | 14.9ms | 14.5ms | -2.7% | 14.5ms | 2.0ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2011.5ms | 2027.9ms | +0.8% | 2027.9ms | 16.1ms | 10 |
| node | `route:module` | 5130 | 957.1ms | 928.1ms | -3.0% | 928.1ms | 8.2ms | 10 |
| node | `module:client-only-stub` | 5 | 675.5ms | 211.0ms | -68.8% | 211.0ms | 66.2ms | 5 |
| web | `route:client-entry` | 5130 | 618.8ms | 646.4ms | +4.5% | 646.4ms | 6.4ms | 10 |
| node | `manifest:transform` | 5 | 219.6ms | 212.9ms | -3.1% | 212.9ms | 47.3ms | 5 |
| web | `manifest:stage` | 10 | 52.5ms | 50.3ms | -4.2% | 50.3ms | 6.9ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5131 | 2029.7ms | 2054.1ms | +1.2% | 2054.1ms | 20.2ms | 11 |
| node | `route:module` | 5130 | 930.6ms | 896.2ms | -3.7% | 896.2ms | 5.3ms | 10 |
| web | `route:client-entry` | 5131 | 621.0ms | 640.9ms | +3.2% | 640.9ms | 7.1ms | 11 |
| node | `manifest:transform` | 5 | 219.9ms | 201.2ms | -8.5% | 201.2ms | 44.4ms | 5 |
| node | `module:client-only-stub` | 5 | 156.2ms | 233.7ms | +49.6% | 233.7ms | 129.4ms | 5 |
| web | `manifest:stage` | 11 | 52.9ms | 60.7ms | +14.7% | 60.7ms | 8.1ms | 11 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1408.5ms | 1408.6ms | +0.0% | 1408.6ms | 21.5ms | 22 |
| node | `route:module` | 2580 | 593.5ms | 616.3ms | +3.8% | 616.3ms | 4.6ms | 20 |
| web | `route:client-entry` | 2582 | 412.2ms | 394.2ms | -4.4% | 394.2ms | 5.4ms | 22 |
| node | `manifest:transform` | 10 | 142.4ms | 146.8ms | +3.1% | 146.8ms | 19.2ms | 10 |
| node | `module:client-only-stub` | 10 | 121.1ms | 162.1ms | +33.9% | 162.1ms | 76.0ms | 10 |
| web | `manifest:stage` | 22 | 21.5ms | 21.8ms | +1.4% | 21.8ms | 1.4ms | 22 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2583 | 1344.2ms | 1427.6ms | +6.2% | 1427.6ms | 20.3ms | 23 |
| node | `route:module` | 2580 | 539.8ms | 520.9ms | -3.5% | 520.9ms | 6.7ms | 20 |
| web | `route:client-entry` | 2583 | 382.0ms | 379.8ms | -0.6% | 379.8ms | 4.7ms | 23 |
| node | `manifest:transform` | 10 | 164.8ms | 166.7ms | +1.2% | 166.7ms | 24.3ms | 10 |
| node | `module:client-only-stub` | 10 | 131.3ms | 104.7ms | -20.3% | 104.7ms | 41.4ms | 10 |
| web | `manifest:stage` | 23 | 21.2ms | 22.9ms | +8.0% | 22.9ms | 1.4ms | 23 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1360.7ms | 1401.7ms | +3.0% | 1401.7ms | 19.4ms | 20 |
| node | `route:module` | 2580 | 550.6ms | 544.5ms | -1.1% | 544.5ms | 6.0ms | 20 |
| web | `route:client-entry` | 2580 | 383.0ms | 389.8ms | +1.8% | 389.8ms | 5.2ms | 20 |
| node | `module:client-only-stub` | 10 | 213.0ms | 143.0ms | -32.9% | 143.0ms | 50.8ms | 10 |
| node | `manifest:transform` | 10 | 165.7ms | 152.7ms | -7.8% | 152.7ms | 22.6ms | 10 |
| web | `manifest:stage` | 20 | 22.5ms | 20.7ms | -8.0% | 20.7ms | 1.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 504.2ms | 441.0ms | -12.5% | 441.0ms | 9.9ms | 20 |
| node | `route:module` | 500 | 172.6ms | 157.0ms | -9.0% | 157.0ms | 4.0ms | 20 |
| web | `route:client-entry` | 500 | 104.0ms | 106.8ms | +2.7% | 106.8ms | 3.4ms | 20 |
| node | `module:client-only-stub` | 10 | 91.2ms | 137.6ms | +50.9% | 137.6ms | 28.0ms | 10 |
| node | `manifest:transform` | 10 | 58.2ms | 54.0ms | -7.2% | 54.0ms | 9.7ms | 10 |
| web | `manifest:stage` | 20 | 5.1ms | 5.5ms | +7.8% | 5.5ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 117.02s | 112.19s | -4.1% | 112.19s | - | 1.04x | - |
| complex app | 2 | 79.10s | 78.84s | -0.3% | 78.84s | - | 1.00x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 96.40s | 96.65s | +0.3% | 87.82s | 87.90s | 2.83s | 2.86s | 3.23s | 3.34s | +3.6% | 96.65s | - | 1.00x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28917102807)

