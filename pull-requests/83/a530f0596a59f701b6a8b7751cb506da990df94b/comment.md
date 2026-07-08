<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `a530f05` against base `9e95ea0`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.37s | 32.71s | +11.4% | 19.51s | 22.89s | +17.3% | 4.11s | 3.96s | -3.6% | 3.29s | 3.32s | +0.9% | 0.90x |
| Large app | 1 | 13.84s | 14.25s | +3.0% | 8.41s | 8.86s | +5.3% | 2.08s | 2.02s | -2.7% | 1.80s | 1.80s | +0.2% | 0.97x |
| Standard fixtures | 6 | 15.53s | 18.46s | +18.9% | 11.11s | 14.04s | +26.4% | 2.03s | 1.94s | -4.4% | 1.49s | 1.52s | +1.8% | 0.84x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.59s | 9.33s | +8.6% | 9.31s | 9.44s | 0.92x | 1578 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.34s | 5.11s | +17.7% | 5.14s | 5.36s | 0.85x | 794 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.66s | 6.23s | +9.9% | 6.26s | 6.51s | 0.91x | 942 MB |
| `synthetic-256-sourcemaps` | 10 | 2.19s | 2.43s | +11.1% | 2.44s | 2.60s | 0.90x | 486 MB |
| `synthetic-256-ssr-esm` | 10 | 2.07s | 2.32s | +12.0% | 2.32s | 2.43s | 0.89x | 467 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.49s | 2.68s | +7.5% | 2.69s | 2.87s | 0.93x | 492 MB |
| `synthetic-48-ssr-esm` | 10 | 1.38s | 1.39s | +0.4% | 1.41s | 1.62s | 1.00x | 337 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.84s | 14.25s | +3.0% | 8.41s | 8.86s | 2.08s | 2.02s | 1.80s | 1.80s | +0.2% | 14.28s | 14.44s | 0.97x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.53s | 5.72s | +26.3% | 3.22s | 4.31s | 0.56s | 0.56s | 0.50s | 0.53s | +5.1% | 5.78s | 6.02s | 0.79x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.55s | 5.54s | +21.7% | 3.23s | 4.23s | 0.59s | 0.56s | 0.48s | 0.53s | +10.8% | 5.54s | 5.59s | 0.82x | - |
| `synthetic-256-sourcemaps` | 10 | 2.01s | 2.24s | +11.2% | 1.49s | 1.74s | 0.26s | 0.23s | 0.15s | 0.15s | -0.2% | 2.24s | 2.30s | 0.90x | - |
| `synthetic-256-ssr-esm` | 10 | 1.75s | 2.02s | +15.4% | 1.25s | 1.53s | 0.25s | 0.23s | 0.15s | 0.13s | -16.2% | 2.01s | 2.08s | 0.87x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.77s | 2.00s | +13.0% | 1.26s | 1.54s | 0.24s | 0.23s | 0.15s | 0.13s | -16.6% | 1.99s | 2.06s | 0.89x | - |
| `synthetic-48-ssr-esm` | 10 | 0.92s | 0.95s | +3.2% | 0.66s | 0.69s | 0.13s | 0.13s | 0.05s | 0.05s | +0.6% | 0.95s | 0.97s | 0.97x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1717.2ms | 1787.3ms | +4.1% | 1787.3ms | 13.4ms | 10 |
| node | `route:module` | 1785 | 891.4ms | 948.0ms | +6.3% | 948.0ms | 14.7ms | 10 |
| web | `route:client-entry` | 1785 | 382.8ms | 1630.6ms | +326.0% | 1630.6ms | 8.5ms | 10 |
| node | `manifest:transform` | 5 | 99.2ms | 127.1ms | +28.1% | 127.1ms | 32.4ms | 5 |
| web | `manifest:stage` | 10 | 14.9ms | 14.6ms | -2.0% | 14.6ms | 1.9ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5131 | 2011.5ms | 1999.4ms | -0.6% | 1999.4ms | 21.1ms | 11 |
| node | `route:module` | 5130 | 957.1ms | 985.3ms | +2.9% | 985.3ms | 6.9ms | 10 |
| node | `module:client-only-stub` | 5 | 675.5ms | 63.2ms | -90.6% | 63.2ms | 14.2ms | 5 |
| web | `route:client-entry` | 5131 | 618.8ms | 3247.5ms | +424.8% | 3247.5ms | 8.3ms | 11 |
| node | `manifest:transform` | 5 | 219.6ms | 214.8ms | -2.2% | 214.8ms | 45.8ms | 5 |
| web | `manifest:stage` | 11 | 52.5ms | 62.5ms | +19.0% | 62.5ms | 7.2ms | 11 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2029.7ms | 1942.5ms | -4.3% | 1942.5ms | 9.9ms | 10 |
| node | `route:module` | 5130 | 930.6ms | 967.1ms | +3.9% | 967.1ms | 11.4ms | 10 |
| web | `route:client-entry` | 5130 | 621.0ms | 3273.1ms | +427.1% | 3273.1ms | 7.8ms | 10 |
| node | `manifest:transform` | 5 | 219.9ms | 215.1ms | -2.2% | 215.1ms | 46.6ms | 5 |
| node | `module:client-only-stub` | 5 | 156.2ms | 212.2ms | +35.9% | 212.2ms | 85.6ms | 5 |
| web | `manifest:stage` | 10 | 52.9ms | 63.4ms | +19.8% | 63.4ms | 7.1ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1408.5ms | 1358.2ms | -3.6% | 1358.2ms | 25.1ms | 20 |
| node | `route:module` | 2580 | 593.5ms | 608.3ms | +2.5% | 608.3ms | 4.2ms | 20 |
| web | `route:client-entry` | 2580 | 412.2ms | 1976.7ms | +379.5% | 1976.7ms | 7.7ms | 20 |
| node | `manifest:transform` | 10 | 142.4ms | 169.0ms | +18.7% | 169.0ms | 26.2ms | 10 |
| node | `module:client-only-stub` | 10 | 121.1ms | 315.4ms | +160.4% | 315.4ms | 123.7ms | 10 |
| web | `manifest:stage` | 20 | 21.5ms | 22.7ms | +5.6% | 22.7ms | 4.2ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1344.2ms | 1368.0ms | +1.8% | 1368.0ms | 19.2ms | 22 |
| node | `route:module` | 2580 | 539.8ms | 579.1ms | +7.3% | 579.1ms | 4.9ms | 20 |
| web | `route:client-entry` | 2582 | 382.0ms | 1964.5ms | +414.3% | 1964.5ms | 6.5ms | 22 |
| node | `manifest:transform` | 10 | 164.8ms | 154.2ms | -6.4% | 154.2ms | 22.9ms | 10 |
| node | `module:client-only-stub` | 10 | 131.3ms | 157.2ms | +19.7% | 157.2ms | 44.4ms | 10 |
| web | `manifest:stage` | 22 | 21.2ms | 21.5ms | +1.4% | 21.5ms | 1.4ms | 22 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1360.7ms | 1410.2ms | +3.6% | 1410.2ms | 20.3ms | 20 |
| node | `route:module` | 2580 | 550.6ms | 588.3ms | +6.8% | 588.3ms | 5.8ms | 20 |
| web | `route:client-entry` | 2580 | 383.0ms | 1926.0ms | +402.9% | 1926.0ms | 7.2ms | 20 |
| node | `module:client-only-stub` | 10 | 213.0ms | 178.1ms | -16.4% | 178.1ms | 59.1ms | 10 |
| node | `manifest:transform` | 10 | 165.7ms | 172.9ms | +4.3% | 172.9ms | 22.2ms | 10 |
| web | `manifest:stage` | 20 | 22.5ms | 20.0ms | -11.1% | 20.0ms | 1.3ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 501 | 504.2ms | 478.6ms | -5.1% | 478.6ms | 13.2ms | 21 |
| node | `route:module` | 500 | 172.6ms | 137.4ms | -20.4% | 137.4ms | 0.7ms | 20 |
| web | `route:client-entry` | 501 | 104.0ms | 472.4ms | +354.2% | 472.4ms | 5.2ms | 21 |
| node | `module:client-only-stub` | 10 | 91.2ms | 74.1ms | -18.8% | 74.1ms | 10.5ms | 10 |
| node | `manifest:transform` | 10 | 58.2ms | 54.4ms | -6.5% | 54.4ms | 9.6ms | 10 |
| web | `manifest:stage` | 21 | 5.1ms | 6.0ms | +17.6% | 6.0ms | 0.4ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 117.02s | 122.37s | +4.6% | 122.37s | - | 0.96x | - |
| complex app | 2 | 79.10s | 81.61s | +3.2% | 81.61s | - | 0.97x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 96.40s | 99.58s | +3.3% | 87.82s | 90.68s | 2.83s | 2.87s | 3.23s | 3.47s | +7.7% | 99.58s | - | 0.97x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28908846436)

