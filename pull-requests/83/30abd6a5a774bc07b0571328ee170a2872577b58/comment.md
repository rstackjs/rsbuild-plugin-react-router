<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `30abd6a` against base `9e95ea0`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.37s | 18.39s | -37.4% | 19.51s | 12.49s | -36.0% | 4.11s | 2.39s | -41.8% | 3.29s | 2.28s | -30.8% | 1.60x |
| Large app | 1 | 13.84s | 9.00s | -35.0% | 8.41s | 5.76s | -31.5% | 2.08s | 1.15s | -44.8% | 1.80s | 1.36s | -24.1% | 1.54x |
| Standard fixtures | 6 | 15.53s | 9.39s | -39.5% | 11.11s | 6.73s | -39.4% | 2.03s | 1.24s | -38.7% | 1.49s | 0.91s | -38.8% | 1.65x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.59s | 5.89s | -31.5% | 5.97s | 6.48s | 1.46x | 1537 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.34s | 2.32s | -46.6% | 2.36s | 2.48s | 1.87x | 665 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.66s | 3.10s | -45.2% | 3.16s | 3.34s | 1.82x | 843 MB |
| `synthetic-256-sourcemaps` | 10 | 2.19s | 1.26s | -42.5% | 1.27s | 1.39s | 1.74x | 473 MB |
| `synthetic-256-ssr-esm` | 10 | 2.07s | 1.16s | -44.3% | 1.17s | 1.31s | 1.79x | 428 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.49s | 1.38s | -44.5% | 1.40s | 1.55s | 1.80x | 471 MB |
| `synthetic-48-ssr-esm` | 10 | 1.38s | 0.77s | -44.1% | 0.79s | 0.95s | 1.79x | 312 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.84s | 9.00s | -35.0% | 8.41s | 5.76s | 2.08s | 1.15s | 1.80s | 1.36s | -24.1% | 9.32s | 9.93s | 1.54x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.53s | 2.76s | -39.2% | 3.22s | 2.00s | 0.56s | 0.36s | 0.50s | 0.28s | -45.0% | 2.80s | 2.99s | 1.64x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.55s | 2.81s | -38.2% | 3.23s | 2.01s | 0.59s | 0.36s | 0.48s | 0.28s | -42.0% | 2.90s | 3.14s | 1.62x | - |
| `synthetic-256-sourcemaps` | 10 | 2.01s | 1.21s | -40.2% | 1.49s | 0.90s | 0.26s | 0.14s | 0.15s | 0.10s | -33.4% | 1.24s | 1.42s | 1.67x | - |
| `synthetic-256-ssr-esm` | 10 | 1.75s | 1.03s | -41.1% | 1.25s | 0.73s | 0.25s | 0.15s | 0.15s | 0.08s | -48.9% | 1.04s | 1.11s | 1.70x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.77s | 1.05s | -40.8% | 1.26s | 0.73s | 0.24s | 0.15s | 0.15s | 0.13s | -16.3% | 1.07s | 1.20s | 1.69x | - |
| `synthetic-48-ssr-esm` | 10 | 0.92s | 0.54s | -40.9% | 0.66s | 0.36s | 0.13s | 0.08s | 0.05s | 0.05s | -0.7% | 0.57s | 0.84s | 1.69x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1717.2ms | 1111.9ms | -35.2% | 1111.9ms | 14.1ms | 10 |
| node | `route:module` | 1785 | 891.4ms | 570.1ms | -36.0% | 570.1ms | 14.3ms | 10 |
| web | `route:client-entry` | 1785 | 382.8ms | 229.9ms | -39.9% | 229.9ms | 4.7ms | 10 |
| node | `manifest:transform` | 5 | 99.2ms | 70.3ms | -29.1% | 70.3ms | 19.9ms | 5 |
| web | `manifest:stage` | 10 | 14.9ms | 8.7ms | -41.6% | 8.7ms | 1.2ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.4ms | -20.0% | 0.4ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2011.5ms | 1221.5ms | -39.3% | 1221.5ms | 10.4ms | 10 |
| node | `route:module` | 5130 | 957.1ms | 528.2ms | -44.8% | 528.2ms | 6.2ms | 10 |
| node | `module:client-only-stub` | 5 | 675.5ms | 78.9ms | -88.3% | 78.9ms | 25.5ms | 5 |
| web | `route:client-entry` | 5130 | 618.8ms | 325.6ms | -47.4% | 325.6ms | 4.9ms | 10 |
| node | `manifest:transform` | 5 | 219.6ms | 113.3ms | -48.4% | 113.3ms | 24.7ms | 5 |
| web | `manifest:stage` | 10 | 52.5ms | 34.1ms | -35.0% | 34.1ms | 5.1ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5131 | 2029.7ms | 1242.1ms | -38.8% | 1242.1ms | 14.0ms | 11 |
| node | `route:module` | 5130 | 930.6ms | 528.0ms | -43.3% | 528.0ms | 4.0ms | 10 |
| web | `route:client-entry` | 5131 | 621.0ms | 357.4ms | -42.4% | 357.4ms | 6.3ms | 11 |
| node | `manifest:transform` | 5 | 219.9ms | 132.5ms | -39.7% | 132.5ms | 32.4ms | 5 |
| node | `module:client-only-stub` | 5 | 156.2ms | 69.5ms | -55.5% | 69.5ms | 27.4ms | 5 |
| web | `manifest:stage` | 11 | 52.9ms | 31.5ms | -40.5% | 31.5ms | 4.1ms | 11 |
| web | `manifest:transform` | 5 | 0.5ms | 0.3ms | -40.0% | 0.3ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1408.5ms | 865.9ms | -38.5% | 865.9ms | 6.0ms | 20 |
| node | `route:module` | 2580 | 593.5ms | 373.6ms | -37.1% | 373.6ms | 4.6ms | 20 |
| web | `route:client-entry` | 2580 | 412.2ms | 222.7ms | -46.0% | 222.7ms | 3.7ms | 20 |
| node | `manifest:transform` | 10 | 142.4ms | 92.2ms | -35.3% | 92.2ms | 11.6ms | 10 |
| node | `module:client-only-stub` | 10 | 121.1ms | 73.6ms | -39.2% | 73.6ms | 24.7ms | 10 |
| web | `manifest:stage` | 20 | 21.5ms | 12.3ms | -42.8% | 12.3ms | 0.9ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 0.0ms | -100.0% | 0.0ms | 0.0ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1344.2ms | 860.9ms | -36.0% | 860.9ms | 9.9ms | 20 |
| node | `route:module` | 2580 | 539.8ms | 326.4ms | -39.5% | 326.4ms | 7.5ms | 20 |
| web | `route:client-entry` | 2580 | 382.0ms | 231.6ms | -39.4% | 231.6ms | 3.2ms | 20 |
| node | `manifest:transform` | 10 | 164.8ms | 100.9ms | -38.8% | 100.9ms | 12.4ms | 10 |
| node | `module:client-only-stub` | 10 | 131.3ms | 30.6ms | -76.7% | 30.6ms | 8.5ms | 10 |
| web | `manifest:stage` | 20 | 21.2ms | 13.5ms | -36.3% | 13.5ms | 1.2ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 0.2ms | -80.0% | 0.2ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1360.7ms | 865.2ms | -36.4% | 865.2ms | 8.2ms | 20 |
| node | `route:module` | 2580 | 550.6ms | 317.2ms | -42.4% | 317.2ms | 6.7ms | 20 |
| web | `route:client-entry` | 2580 | 383.0ms | 216.4ms | -43.5% | 216.4ms | 3.4ms | 20 |
| node | `module:client-only-stub` | 10 | 213.0ms | 70.3ms | -67.0% | 70.3ms | 34.8ms | 10 |
| node | `manifest:transform` | 10 | 165.7ms | 104.6ms | -36.9% | 104.6ms | 14.2ms | 10 |
| web | `manifest:stage` | 20 | 22.5ms | 12.7ms | -43.6% | 12.7ms | 0.9ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 0.3ms | -70.0% | 0.3ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 504.2ms | 248.3ms | -50.8% | 248.3ms | 5.8ms | 20 |
| node | `route:module` | 500 | 172.6ms | 92.1ms | -46.6% | 92.1ms | 2.0ms | 20 |
| web | `route:client-entry` | 500 | 104.0ms | 70.8ms | -31.9% | 70.8ms | 2.0ms | 20 |
| node | `module:client-only-stub` | 10 | 91.2ms | 59.1ms | -35.2% | 59.1ms | 8.4ms | 10 |
| node | `manifest:transform` | 10 | 58.2ms | 28.7ms | -50.7% | 28.7ms | 3.4ms | 10 |
| web | `manifest:stage` | 20 | 5.1ms | 3.0ms | -41.2% | 3.0ms | 0.2ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 0.0ms | -100.0% | 0.0ms | 0.0ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 117.02s | 74.47s | -36.4% | 74.47s | - | 1.57x | - |
| complex app | 2 | 79.10s | 50.54s | -36.1% | 50.54s | - | 1.57x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 96.40s | 65.98s | -31.6% | 87.82s | 59.65s | 2.83s | 1.54s | 3.23s | 3.29s | +2.1% | 65.98s | - | 1.46x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28913814610)

