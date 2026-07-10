<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `e717fed` against base `96ed301`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.21s | 28.54s | -2.3% | 19.63s | 19.09s | -2.8% | 4.02s | 3.95s | -1.8% | 3.18s | 3.13s | -1.6% | 1.02x |
| Large app | 1 | 13.54s | 13.37s | -1.3% | 8.28s | 8.17s | -1.4% | 1.99s | 1.95s | -1.7% | 1.69s | 1.72s | +1.5% | 1.01x |
| Standard fixtures | 6 | 15.67s | 15.17s | -3.2% | 11.35s | 10.92s | -3.8% | 2.03s | 1.99s | -1.8% | 1.49s | 1.41s | -5.1% | 1.03x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.55s | 8.66s | +1.3% | 8.65s | 8.79s | 0.99x | 1516 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.18s | 4.17s | -0.1% | 4.17s | 4.39s | 1.00x | 636 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.56s | 5.59s | +0.4% | 5.68s | 6.00s | 1.00x | 813 MB |
| `synthetic-256-sourcemaps` | 10 | 2.18s | 2.19s | +0.7% | 2.21s | 2.41s | 0.99x | 452 MB |
| `synthetic-256-ssr-esm` | 10 | 2.06s | 2.05s | -0.4% | 2.07s | 2.28s | 1.00x | 421 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.47s | 2.46s | -0.1% | 2.47s | 2.58s | 1.00x | 452 MB |
| `synthetic-48-ssr-esm` | 10 | 1.34s | 1.34s | -0.1% | 1.35s | 1.56s | 1.00x | 317 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.54s | 13.37s | -1.3% | 8.28s | 8.17s | 1.99s | 1.95s | 1.69s | 1.72s | +1.5% | 13.42s | 13.56s | 1.01x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.59s | 4.47s | -2.7% | 3.32s | 3.21s | 0.58s | 0.57s | 0.50s | 0.48s | -4.6% | 4.48s | 4.54s | 1.03x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.63s | 4.46s | -3.6% | 3.32s | 3.19s | 0.59s | 0.58s | 0.50s | 0.48s | -5.2% | 4.47s | 4.51s | 1.04x | - |
| `synthetic-256-sourcemaps` | 10 | 2.01s | 1.95s | -3.3% | 1.51s | 1.46s | 0.25s | 0.24s | 0.15s | 0.15s | -0.3% | 1.95s | 2.01s | 1.03x | - |
| `synthetic-256-ssr-esm` | 10 | 1.77s | 1.71s | -3.5% | 1.27s | 1.22s | 0.24s | 0.24s | 0.13s | 0.13s | -1.3% | 1.71s | 1.86s | 1.04x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.75s | 1.71s | -2.2% | 1.27s | 1.23s | 0.24s | 0.24s | 0.15s | 0.13s | -16.2% | 1.73s | 1.83s | 1.02x | - |
| `synthetic-48-ssr-esm` | 10 | 0.90s | 0.87s | -4.0% | 0.65s | 0.61s | 0.13s | 0.13s | 0.05s | 0.05s | -1.0% | 0.86s | 0.88s | 1.04x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1687.5ms | 1829.1ms | +8.4% | 1829.1ms | 15.2ms | 10 |
| node | `route:module` | 1785 | 915.9ms | 870.5ms | -5.0% | 870.5ms | 11.1ms | 10 |
| web | `route:client-entry` | 1785 | 421.1ms | 368.0ms | -12.6% | 368.0ms | 5.3ms | 10 |
| node | `manifest:transform` | 5 | 119.8ms | 142.0ms | +18.5% | 142.0ms | 53.6ms | 5 |
| web | `manifest:stage` | 10 | 14.2ms | 14.2ms | +0.0% | 14.2ms | 1.9ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2028.9ms | 1995.8ms | -1.6% | 1995.8ms | 15.5ms | 10 |
| node | `route:module` | 5130 | 917.0ms | 930.9ms | +1.5% | 930.9ms | 5.5ms | 10 |
| web | `route:client-entry` | 5130 | 638.6ms | 666.1ms | +4.3% | 666.1ms | 7.2ms | 10 |
| node | `manifest:transform` | 5 | 207.0ms | 206.6ms | -0.2% | 206.6ms | 47.2ms | 5 |
| node | `module:client-only-stub` | 5 | 128.8ms | 97.2ms | -24.5% | 97.2ms | 43.2ms | 5 |
| web | `manifest:stage` | 10 | 51.3ms | 52.4ms | +2.1% | 52.4ms | 7.8ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2090.6ms | 1986.3ms | -5.0% | 1986.3ms | 13.0ms | 10 |
| node | `route:module` | 5130 | 919.9ms | 918.6ms | -0.1% | 918.6ms | 7.1ms | 10 |
| web | `route:client-entry` | 5130 | 651.1ms | 634.4ms | -2.6% | 634.4ms | 6.2ms | 10 |
| node | `manifest:transform` | 5 | 214.2ms | 214.6ms | +0.2% | 214.6ms | 44.8ms | 5 |
| node | `module:client-only-stub` | 5 | 192.3ms | 46.7ms | -75.7% | 46.7ms | 12.8ms | 5 |
| web | `manifest:stage` | 10 | 46.4ms | 57.0ms | +22.8% | 57.0ms | 7.9ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1429.0ms | 1406.1ms | -1.6% | 1406.1ms | 20.8ms | 21 |
| node | `route:module` | 2580 | 588.1ms | 593.9ms | +1.0% | 593.9ms | 4.0ms | 20 |
| web | `route:client-entry` | 2581 | 405.8ms | 407.3ms | +0.4% | 407.3ms | 4.6ms | 21 |
| node | `module:client-only-stub` | 10 | 167.7ms | 71.0ms | -57.7% | 71.0ms | 18.0ms | 10 |
| node | `manifest:transform` | 10 | 163.2ms | 172.4ms | +5.6% | 172.4ms | 21.0ms | 10 |
| web | `manifest:stage` | 21 | 20.2ms | 20.8ms | +3.0% | 20.8ms | 1.3ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1384.6ms | 1403.1ms | +1.3% | 1403.1ms | 22.3ms | 21 |
| node | `route:module` | 2580 | 561.7ms | 537.3ms | -4.3% | 537.3ms | 4.9ms | 20 |
| web | `route:client-entry` | 2581 | 389.9ms | 386.5ms | -0.9% | 386.5ms | 4.8ms | 21 |
| node | `module:client-only-stub` | 10 | 163.4ms | 85.6ms | -47.6% | 85.6ms | 34.9ms | 10 |
| node | `manifest:transform` | 10 | 154.7ms | 164.8ms | +6.5% | 164.8ms | 20.2ms | 10 |
| web | `manifest:stage` | 21 | 22.5ms | 21.2ms | -5.8% | 21.2ms | 1.4ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2584 | 1336.9ms | 1407.6ms | +5.3% | 1407.6ms | 19.6ms | 24 |
| node | `route:module` | 2580 | 564.3ms | 568.1ms | +0.7% | 568.1ms | 8.5ms | 20 |
| web | `route:client-entry` | 2584 | 380.9ms | 386.9ms | +1.6% | 386.9ms | 4.9ms | 24 |
| node | `module:client-only-stub` | 10 | 265.3ms | 149.8ms | -43.5% | 149.8ms | 54.8ms | 10 |
| node | `manifest:transform` | 10 | 167.4ms | 157.2ms | -6.1% | 157.2ms | 20.8ms | 10 |
| web | `manifest:stage` | 24 | 20.7ms | 23.0ms | +11.1% | 23.0ms | 1.3ms | 24 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 503.7ms | 415.0ms | -17.6% | 415.0ms | 9.2ms | 20 |
| node | `route:module` | 500 | 183.0ms | 162.7ms | -11.1% | 162.7ms | 4.1ms | 20 |
| web | `route:client-entry` | 500 | 107.7ms | 116.6ms | +8.3% | 116.6ms | 3.5ms | 20 |
| node | `module:client-only-stub` | 10 | 93.9ms | 88.0ms | -6.3% | 88.0ms | 17.7ms | 10 |
| node | `manifest:transform` | 10 | 52.5ms | 53.4ms | +1.7% | 53.4ms | 6.7ms | 10 |
| web | `manifest:stage` | 20 | 5.4ms | 6.1ms | +13.0% | 6.1ms | 0.6ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 110.09s | 111.39s | +1.2% | 111.39s | - | 0.99x | - |
| complex app | 2 | 76.00s | 79.77s | +5.0% | 79.77s | - | 0.95x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 94.65s | 95.99s | +1.4% | 86.11s | 87.30s | 2.82s | 2.91s | 3.23s | 3.22s | -0.5% | 95.99s | - | 0.99x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29066466863)

