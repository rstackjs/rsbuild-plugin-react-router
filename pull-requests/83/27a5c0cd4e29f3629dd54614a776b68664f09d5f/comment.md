<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `27a5c0c` against base `9e95ea0`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.37s | 27.82s | -5.3% | 19.51s | 18.85s | -3.4% | 4.11s | 3.58s | -12.8% | 3.29s | 3.18s | -3.1% | 1.06x |
| Large app | 1 | 13.84s | 13.24s | -4.3% | 8.41s | 8.39s | -0.2% | 2.08s | 1.71s | -17.5% | 1.80s | 1.84s | +2.4% | 1.05x |
| Standard fixtures | 6 | 15.53s | 14.58s | -6.1% | 11.11s | 10.47s | -5.8% | 2.03s | 1.87s | -8.0% | 1.49s | 1.34s | -9.8% | 1.07x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.59s | 8.90s | +3.6% | 8.91s | 9.16s | 0.97x | 1539 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.34s | 3.54s | -18.4% | 3.59s | 3.83s | 1.23x | 667 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.66s | 4.85s | -14.3% | 4.83s | 4.91s | 1.17x | 824 MB |
| `synthetic-256-sourcemaps` | 10 | 2.19s | 1.94s | -11.6% | 1.94s | 2.08s | 1.13x | 447 MB |
| `synthetic-256-ssr-esm` | 10 | 2.07s | 1.81s | -12.7% | 1.83s | 1.99s | 1.15x | 435 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.49s | 2.17s | -13.0% | 2.18s | 2.33s | 1.15x | 463 MB |
| `synthetic-48-ssr-esm` | 10 | 1.38s | 1.23s | -11.3% | 1.25s | 1.47s | 1.13x | 314 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.84s | 13.24s | -4.3% | 8.41s | 8.39s | 2.08s | 1.71s | 1.80s | 1.84s | +2.4% | 13.25s | 13.47s | 1.05x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.53s | 4.25s | -6.1% | 3.22s | 3.08s | 0.56s | 0.54s | 0.50s | 0.43s | -14.8% | 4.24s | 4.31s | 1.07x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.55s | 4.37s | -3.9% | 3.23s | 3.14s | 0.59s | 0.54s | 0.48s | 0.45s | -4.7% | 4.49s | 5.42s | 1.04x | - |
| `synthetic-256-sourcemaps` | 10 | 2.01s | 1.85s | -8.0% | 1.49s | 1.39s | 0.26s | 0.21s | 0.15s | 0.15s | +0.0% | 2.02s | 3.21s | 1.09x | - |
| `synthetic-256-ssr-esm` | 10 | 1.75s | 1.67s | -4.6% | 1.25s | 1.16s | 0.25s | 0.23s | 0.15s | 0.13s | -16.3% | 1.65s | 1.70s | 1.05x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.77s | 1.60s | -9.3% | 1.26s | 1.12s | 0.24s | 0.23s | 0.15s | 0.13s | -16.2% | 1.59s | 1.63s | 1.10x | - |
| `synthetic-48-ssr-esm` | 10 | 0.92s | 0.83s | -9.5% | 0.66s | 0.58s | 0.13s | 0.12s | 0.05s | 0.05s | +2.0% | 0.83s | 0.86s | 1.11x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1717.2ms | 1681.9ms | -2.1% | 1681.9ms | 18.7ms | 10 |
| node | `route:module` | 1785 | 891.4ms | 863.2ms | -3.2% | 863.2ms | 8.0ms | 10 |
| web | `route:client-entry` | 1785 | 382.8ms | 337.2ms | -11.9% | 337.2ms | 5.1ms | 10 |
| node | `manifest:transform` | 5 | 99.2ms | 114.0ms | +14.9% | 114.0ms | 32.2ms | 5 |
| web | `manifest:stage` | 10 | 14.9ms | 13.9ms | -6.7% | 13.9ms | 1.9ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2011.5ms | 2102.6ms | +4.5% | 2102.6ms | 17.3ms | 10 |
| node | `route:module` | 5130 | 957.1ms | 945.9ms | -1.2% | 945.9ms | 13.0ms | 10 |
| node | `module:client-only-stub` | 5 | 675.5ms | 202.0ms | -70.1% | 202.0ms | 144.9ms | 5 |
| web | `route:client-entry` | 5130 | 618.8ms | 539.9ms | -12.8% | 539.9ms | 8.0ms | 10 |
| node | `manifest:transform` | 5 | 219.6ms | 193.5ms | -11.9% | 193.5ms | 46.7ms | 5 |
| web | `manifest:stage` | 10 | 52.5ms | 46.8ms | -10.9% | 46.8ms | 8.1ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2029.7ms | 2029.7ms | 0.0% | 2029.7ms | 13.0ms | 10 |
| node | `route:module` | 5130 | 930.6ms | 953.0ms | +2.4% | 953.0ms | 6.3ms | 10 |
| web | `route:client-entry` | 5130 | 621.0ms | 543.4ms | -12.5% | 543.4ms | 7.2ms | 10 |
| node | `manifest:transform` | 5 | 219.9ms | 182.2ms | -17.1% | 182.2ms | 39.4ms | 5 |
| node | `module:client-only-stub` | 5 | 156.2ms | 104.6ms | -33.0% | 104.6ms | 56.7ms | 5 |
| web | `manifest:stage` | 10 | 52.9ms | 51.7ms | -2.3% | 51.7ms | 7.5ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1408.5ms | 1418.3ms | +0.7% | 1418.3ms | 20.8ms | 21 |
| node | `route:module` | 2580 | 593.5ms | 651.4ms | +9.8% | 651.4ms | 5.1ms | 20 |
| web | `route:client-entry` | 2581 | 412.2ms | 354.6ms | -14.0% | 354.6ms | 5.4ms | 21 |
| node | `manifest:transform` | 10 | 142.4ms | 151.1ms | +6.1% | 151.1ms | 20.0ms | 10 |
| node | `module:client-only-stub` | 10 | 121.1ms | 137.9ms | +13.9% | 137.9ms | 100.5ms | 10 |
| web | `manifest:stage` | 21 | 21.5ms | 20.2ms | -6.0% | 20.2ms | 1.3ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2584 | 1344.2ms | 1374.7ms | +2.3% | 1374.7ms | 17.8ms | 24 |
| node | `route:module` | 2580 | 539.8ms | 560.9ms | +3.9% | 560.9ms | 8.1ms | 20 |
| web | `route:client-entry` | 2584 | 382.0ms | 348.0ms | -8.9% | 348.0ms | 5.6ms | 24 |
| node | `manifest:transform` | 10 | 164.8ms | 136.6ms | -17.1% | 136.6ms | 19.0ms | 10 |
| node | `module:client-only-stub` | 10 | 131.3ms | 177.1ms | +34.9% | 177.1ms | 77.2ms | 10 |
| web | `manifest:stage` | 24 | 21.2ms | 23.9ms | +12.7% | 23.9ms | 1.4ms | 24 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1360.7ms | 1371.4ms | +0.8% | 1371.4ms | 12.8ms | 22 |
| node | `route:module` | 2580 | 550.6ms | 567.8ms | +3.1% | 567.8ms | 7.8ms | 20 |
| web | `route:client-entry` | 2582 | 383.0ms | 364.3ms | -4.9% | 364.3ms | 4.6ms | 22 |
| node | `module:client-only-stub` | 10 | 213.0ms | 281.3ms | +32.1% | 281.3ms | 83.7ms | 10 |
| node | `manifest:transform` | 10 | 165.7ms | 130.2ms | -21.4% | 130.2ms | 16.5ms | 10 |
| web | `manifest:stage` | 22 | 22.5ms | 23.0ms | +2.2% | 23.0ms | 1.9ms | 22 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 504.2ms | 420.9ms | -16.5% | 420.9ms | 9.6ms | 20 |
| node | `route:module` | 500 | 172.6ms | 155.5ms | -9.9% | 155.5ms | 3.6ms | 20 |
| web | `route:client-entry` | 500 | 104.0ms | 108.1ms | +3.9% | 108.1ms | 2.9ms | 20 |
| node | `module:client-only-stub` | 10 | 91.2ms | 87.9ms | -3.6% | 87.9ms | 11.4ms | 10 |
| node | `manifest:transform` | 10 | 58.2ms | 41.3ms | -29.0% | 41.3ms | 5.4ms | 10 |
| web | `manifest:stage` | 20 | 5.1ms | 5.6ms | +9.8% | 5.6ms | 0.5ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 117.02s | 103.53s | -11.5% | 103.53s | - | 1.13x | - |
| complex app | 2 | 79.10s | 72.69s | -8.1% | 72.69s | - | 1.09x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 96.40s | 87.89s | -8.8% | 87.82s | 79.33s | 2.83s | 2.39s | 3.23s | 4.15s | +28.6% | 87.89s | - | 1.10x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28912753988)

