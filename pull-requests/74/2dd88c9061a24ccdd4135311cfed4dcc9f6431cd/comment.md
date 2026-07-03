<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `2dd88c9` against base `c93ec98`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.47s | 28.98s | -1.7% | 19.72s | 19.71s | -0.1% | 3.97s | 3.93s | -1.0% | 3.27s | 2.89s | -11.5% | 1.02x |
| Large app | 1 | 13.83s | 13.79s | -0.2% | 8.44s | 8.40s | -0.5% | 2.01s | 2.02s | +0.3% | 1.75s | 1.75s | +0.2% | 1.00x |
| Standard fixtures | 6 | 15.65s | 15.19s | -2.9% | 11.28s | 11.31s | +0.3% | 1.96s | 1.91s | -2.3% | 1.52s | 1.14s | -25.0% | 1.03x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.71s | 8.63s | -0.9% | 8.65s | 8.88s | 1.01x | 1526 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.18s | 4.13s | -1.1% | 4.16s | 4.30s | 1.01x | 641 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.57s | 5.55s | -0.3% | 5.56s | 5.82s | 1.00x | 832 MB |
| `synthetic-256-sourcemaps` | 10 | 2.17s | 2.18s | +0.2% | 2.19s | 2.31s | 1.00x | 451 MB |
| `synthetic-256-ssr-esm` | 10 | 2.02s | 2.03s | +0.4% | 2.03s | 2.19s | 1.00x | 413 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.44s | 2.46s | +1.1% | 2.46s | 2.61s | 0.99x | 457 MB |
| `synthetic-48-ssr-esm` | 10 | 1.35s | 1.36s | +0.3% | 1.39s | 1.59s | 1.00x | 325 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.83s | 13.79s | -0.2% | 8.44s | 8.40s | 2.01s | 2.02s | 1.75s | 1.75s | +0.2% | 13.98s | 14.81s | 1.00x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.63s | 4.45s | -3.8% | 3.30s | 3.33s | 0.56s | 0.54s | 0.50s | 0.38s | -24.9% | 4.47s | 4.59s | 1.04x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.60s | 4.42s | -3.8% | 3.29s | 3.26s | 0.54s | 0.55s | 0.51s | 0.38s | -25.4% | 4.42s | 4.54s | 1.04x | - |
| `synthetic-256-sourcemaps` | 10 | 2.00s | 1.97s | -1.7% | 1.50s | 1.51s | 0.25s | 0.23s | 0.15s | 0.13s | -16.3% | 1.97s | 2.00s | 1.02x | - |
| `synthetic-256-ssr-esm` | 10 | 1.76s | 1.72s | -1.9% | 1.27s | 1.28s | 0.24s | 0.23s | 0.15s | 0.10s | -32.5% | 1.73s | 1.80s | 1.02x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.75s | 1.74s | -0.8% | 1.26s | 1.30s | 0.23s | 0.23s | 0.15s | 0.10s | -33.2% | 1.73s | 1.76s | 1.01x | - |
| `synthetic-48-ssr-esm` | 10 | 0.91s | 0.89s | -2.7% | 0.66s | 0.63s | 0.13s | 0.13s | 0.05s | 0.05s | -0.3% | 0.89s | 0.94s | 1.03x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1713.2ms | 1591.3ms | -7.1% | 1591.3ms | 13.5ms | 10 |
| node | `route:module` | 1785 | 910.1ms | 778.3ms | -14.5% | 778.3ms | 14.9ms | 10 |
| web | `route:client-entry` | 1785 | 380.3ms | 465.9ms | +22.5% | 465.9ms | 8.5ms | 10 |
| node | `manifest:transform` | 5 | 141.8ms | 137.9ms | -2.8% | 137.9ms | 54.2ms | 5 |
| web | `manifest:stage` | 10 | 14.4ms | 14.7ms | +2.1% | 14.7ms | 1.9ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2035.1ms | 1707.2ms | -16.1% | 1707.2ms | 10.7ms | 10 |
| node | `route:module` | 5130 | 921.3ms | 833.3ms | -9.6% | 833.3ms | 11.4ms | 10 |
| web | `route:client-entry` | 5130 | 627.2ms | 549.4ms | -12.4% | 549.4ms | 8.8ms | 10 |
| node | `manifest:transform` | 5 | 208.2ms | 236.3ms | +13.5% | 236.3ms | 69.5ms | 5 |
| node | `module:client-only-stub` | 5 | 103.1ms | 210.1ms | +103.8% | 210.1ms | 152.9ms | 5 |
| web | `manifest:stage` | 10 | 59.4ms | 46.3ms | -22.1% | 46.3ms | 6.7ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2056.4ms | 1752.1ms | -14.8% | 1752.1ms | 15.5ms | 10 |
| node | `route:module` | 5130 | 919.2ms | 849.0ms | -7.6% | 849.0ms | 13.6ms | 10 |
| web | `route:client-entry` | 5130 | 603.6ms | 568.5ms | -5.8% | 568.5ms | 14.6ms | 10 |
| node | `module:client-only-stub` | 5 | 469.5ms | 107.3ms | -77.1% | 107.3ms | 35.0ms | 5 |
| node | `manifest:transform` | 5 | 204.7ms | 222.7ms | +8.8% | 222.7ms | 49.8ms | 5 |
| web | `manifest:stage` | 10 | 60.7ms | 46.1ms | -24.1% | 46.1ms | 6.6ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1410.9ms | 1281.6ms | -9.2% | 1281.6ms | 16.8ms | 20 |
| node | `route:module` | 2580 | 598.2ms | 578.3ms | -3.3% | 578.3ms | 6.3ms | 20 |
| web | `route:client-entry` | 2580 | 397.2ms | 357.1ms | -10.1% | 357.1ms | 7.4ms | 20 |
| node | `module:client-only-stub` | 10 | 244.6ms | 217.5ms | -11.1% | 217.5ms | 176.6ms | 10 |
| node | `manifest:transform` | 10 | 145.5ms | 154.6ms | +6.3% | 154.6ms | 21.3ms | 10 |
| web | `manifest:stage` | 20 | 20.1ms | 20.7ms | +3.0% | 20.7ms | 1.5ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1358.0ms | 1263.5ms | -7.0% | 1263.5ms | 16.9ms | 21 |
| node | `route:module` | 2580 | 553.6ms | 511.4ms | -7.6% | 511.4ms | 5.3ms | 20 |
| web | `route:client-entry` | 2581 | 383.5ms | 352.3ms | -8.1% | 352.3ms | 7.6ms | 21 |
| node | `module:client-only-stub` | 10 | 195.5ms | 129.7ms | -33.7% | 129.7ms | 53.0ms | 10 |
| node | `manifest:transform` | 10 | 151.0ms | 169.8ms | +12.5% | 169.8ms | 21.3ms | 10 |
| web | `manifest:stage` | 21 | 20.2ms | 21.0ms | +4.0% | 21.0ms | 1.4ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1325.3ms | 1215.6ms | -8.3% | 1215.6ms | 19.4ms | 20 |
| node | `route:module` | 2580 | 542.4ms | 503.2ms | -7.2% | 503.2ms | 4.1ms | 20 |
| web | `route:client-entry` | 2580 | 380.0ms | 349.0ms | -8.2% | 349.0ms | 6.8ms | 20 |
| node | `manifest:transform` | 10 | 179.8ms | 190.2ms | +5.8% | 190.2ms | 29.5ms | 10 |
| node | `module:client-only-stub` | 10 | 131.9ms | 174.5ms | +32.3% | 174.5ms | 51.4ms | 10 |
| web | `manifest:stage` | 20 | 20.6ms | 20.4ms | -1.0% | 20.4ms | 1.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 501 | 487.5ms | 429.0ms | -12.0% | 429.0ms | 11.8ms | 21 |
| node | `route:module` | 500 | 163.8ms | 130.0ms | -20.6% | 130.0ms | 3.5ms | 20 |
| web | `route:client-entry` | 501 | 107.7ms | 83.3ms | -22.7% | 83.3ms | 2.0ms | 21 |
| node | `module:client-only-stub` | 10 | 76.8ms | 74.5ms | -3.0% | 74.5ms | 16.8ms | 10 |
| node | `manifest:transform` | 10 | 50.2ms | 52.0ms | +3.6% | 52.0ms | 8.5ms | 10 |
| web | `manifest:stage` | 21 | 5.5ms | 6.1ms | +10.9% | 6.1ms | 0.4ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 113.46s | 113.93s | +0.4% | 113.93s | - | 1.00x | - |
| complex app | 2 | 78.98s | 81.17s | +2.8% | 81.17s | - | 0.97x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 96.87s | 96.81s | -0.1% | 88.10s | 88.07s | 2.88s | 2.89s | 3.29s | 3.27s | -0.6% | 96.81s | - | 1.00x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28682067514)

