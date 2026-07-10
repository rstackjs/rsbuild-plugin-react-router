<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `efe137d` against base `96ed301`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 28.21s | 30.92s | +9.6% | 18.83s | 18.95s | +0.7% | 3.79s | 3.96s | +4.3% | 3.19s | 2.86s | -10.2% | 0.91x |
| Large app | 1 | 13.27s | 15.29s | +15.2% | 8.13s | 8.13s | -0.0% | 1.92s | 1.98s | +3.4% | 1.72s | 1.73s | +0.1% | 0.87x |
| Standard fixtures | 6 | 14.95s | 15.63s | +4.6% | 10.70s | 10.82s | +1.2% | 1.88s | 1.97s | +5.1% | 1.47s | 1.14s | -22.4% | 0.96x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.57s | 8.48s | -1.0% | 8.54s | 8.81s | 1.01x | 1528 MB |
| `synthetic-1024-ssr-esm` | 5 | 3.94s | 4.26s | +8.2% | 4.19s | 4.36s | 0.92x | 641 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.33s | 5.59s | +4.9% | 5.54s | 5.63s | 0.95x | 810 MB |
| `synthetic-256-sourcemaps` | 10 | 2.12s | 2.14s | +1.1% | 2.15s | 2.30s | 0.99x | 452 MB |
| `synthetic-256-ssr-esm` | 10 | 1.99s | 2.03s | +1.7% | 2.03s | 2.19s | 0.98x | 422 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.40s | 2.40s | +0.3% | 2.43s | 2.65s | 1.00x | 458 MB |
| `synthetic-48-ssr-esm` | 10 | 1.32s | 1.31s | -0.5% | 1.34s | 1.53s | 1.01x | 315 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.27s | 15.29s | +15.2% | 8.13s | 8.13s | 1.92s | 1.98s | 1.72s | 1.73s | +0.1% | 15.82s | 17.59s | 0.87x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.36s | 4.60s | +5.5% | 3.10s | 3.16s | 0.53s | 0.56s | 0.50s | 0.35s | -30.0% | 4.65s | 4.94s | 0.95x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.43s | 4.61s | +4.2% | 3.15s | 3.19s | 0.54s | 0.58s | 0.48s | 0.35s | -26.5% | 4.68s | 4.85s | 0.96x | - |
| `synthetic-256-sourcemaps` | 10 | 1.91s | 2.01s | +5.1% | 1.42s | 1.44s | 0.24s | 0.24s | 0.15s | 0.13s | -16.4% | 2.03s | 2.20s | 0.95x | - |
| `synthetic-256-ssr-esm` | 10 | 1.70s | 1.76s | +3.5% | 1.20s | 1.21s | 0.22s | 0.24s | 0.15s | 0.13s | -15.7% | 1.77s | 1.87s | 0.97x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.67s | 1.76s | +5.8% | 1.20s | 1.21s | 0.22s | 0.24s | 0.13s | 0.13s | -0.1% | 1.77s | 1.83s | 0.95x | - |
| `synthetic-48-ssr-esm` | 10 | 0.88s | 0.89s | +1.1% | 0.63s | 0.61s | 0.12s | 0.12s | 0.05s | 0.05s | -0.9% | 0.89s | 0.94s | 0.99x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1786 | 1700.9ms | 1840.5ms | +8.2% | 1840.5ms | 15.5ms | 11 |
| node | `route:module` | 1785 | 851.6ms | 918.0ms | +7.8% | 918.0ms | 13.7ms | 10 |
| web | `route:client-entry` | 1786 | 389.2ms | 412.7ms | +6.0% | 412.7ms | 4.8ms | 11 |
| node | `manifest:transform` | 5 | 129.2ms | 117.5ms | -9.1% | 117.5ms | 34.0ms | 5 |
| web | `manifest:stage` | 16 | 14.7ms | 22.2ms | +51.0% | 22.2ms | 2.6ms | 16 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2076.1ms | 2070.0ms | -0.3% | 2070.0ms | 16.8ms | 10 |
| node | `route:module` | 5130 | 974.9ms | 915.0ms | -6.1% | 915.0ms | 8.9ms | 10 |
| web | `route:client-entry` | 5130 | 648.8ms | 675.7ms | +4.1% | 675.7ms | 7.0ms | 10 |
| node | `manifest:transform` | 5 | 203.7ms | 217.0ms | +6.5% | 217.0ms | 45.0ms | 5 |
| node | `module:client-only-stub` | 5 | 160.3ms | 441.9ms | +175.7% | 441.9ms | 241.9ms | 5 |
| web | `manifest:stage` | 15 | 62.1ms | 74.9ms | +20.6% | 74.9ms | 7.8ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2075.5ms | 2090.6ms | +0.7% | 2090.6ms | 18.3ms | 10 |
| node | `route:module` | 5130 | 926.2ms | 933.1ms | +0.7% | 933.1ms | 13.3ms | 10 |
| web | `route:client-entry` | 5130 | 608.7ms | 668.6ms | +9.8% | 668.6ms | 5.9ms | 10 |
| node | `manifest:transform` | 5 | 215.1ms | 222.7ms | +3.5% | 222.7ms | 63.0ms | 5 |
| node | `module:client-only-stub` | 5 | 97.9ms | 231.4ms | +136.4% | 231.4ms | 145.1ms | 5 |
| web | `manifest:stage` | 16 | 62.4ms | 71.7ms | +14.9% | 71.7ms | 7.7ms | 16 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2583 | 1411.0ms | 1448.8ms | +2.7% | 1448.8ms | 20.3ms | 23 |
| node | `route:module` | 2580 | 608.5ms | 599.7ms | -1.4% | 599.7ms | 8.2ms | 20 |
| web | `route:client-entry` | 2583 | 397.5ms | 410.9ms | +3.4% | 410.9ms | 4.7ms | 23 |
| node | `module:client-only-stub` | 10 | 248.7ms | 297.1ms | +19.5% | 297.1ms | 173.6ms | 10 |
| node | `manifest:transform` | 10 | 154.7ms | 159.8ms | +3.3% | 159.8ms | 22.1ms | 10 |
| web | `manifest:stage` | 35 | 22.8ms | 33.1ms | +45.2% | 33.1ms | 2.9ms | 35 |
| web | `manifest:transform` | 10 | 0.9ms | 1.0ms | +11.1% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1368.0ms | 1419.6ms | +3.8% | 1419.6ms | 17.3ms | 22 |
| node | `route:module` | 2580 | 542.6ms | 546.2ms | +0.7% | 546.2ms | 5.0ms | 20 |
| web | `route:client-entry` | 2582 | 394.5ms | 419.2ms | +6.3% | 419.2ms | 6.1ms | 22 |
| node | `module:client-only-stub` | 10 | 200.9ms | 252.8ms | +25.8% | 252.8ms | 65.0ms | 10 |
| node | `manifest:transform` | 10 | 162.4ms | 161.4ms | -0.6% | 161.4ms | 20.7ms | 10 |
| web | `manifest:stage` | 32 | 21.1ms | 29.4ms | +39.3% | 29.4ms | 1.4ms | 32 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1328.4ms | 1402.8ms | +5.6% | 1402.8ms | 11.7ms | 22 |
| node | `route:module` | 2580 | 541.3ms | 549.4ms | +1.5% | 549.4ms | 5.2ms | 20 |
| web | `route:client-entry` | 2582 | 394.6ms | 415.2ms | +5.2% | 415.2ms | 4.9ms | 22 |
| node | `module:client-only-stub` | 10 | 159.7ms | 150.8ms | -5.6% | 150.8ms | 69.5ms | 10 |
| node | `manifest:transform` | 10 | 142.8ms | 153.1ms | +7.2% | 153.1ms | 20.7ms | 10 |
| web | `manifest:stage` | 32 | 20.9ms | 30.1ms | +44.0% | 30.1ms | 1.4ms | 32 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 504.0ms | 435.2ms | -13.7% | 435.2ms | 10.1ms | 20 |
| node | `route:module` | 500 | 169.6ms | 157.0ms | -7.4% | 157.0ms | 5.0ms | 20 |
| web | `route:client-entry` | 500 | 108.2ms | 126.3ms | +16.7% | 126.3ms | 3.6ms | 20 |
| node | `module:client-only-stub` | 10 | 75.9ms | 100.3ms | +32.1% | 100.3ms | 22.2ms | 10 |
| node | `manifest:transform` | 10 | 53.3ms | 47.8ms | -10.3% | 47.8ms | 6.3ms | 10 |
| web | `manifest:stage` | 30 | 5.5ms | 7.3ms | +32.7% | 7.3ms | 0.4ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.1ms | +10.0% | 1.1ms | 0.2ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 113.31s | 112.21s | -1.0% | 112.21s | - | 1.01x | - |
| complex app | 2 | 79.95s | 76.41s | -4.4% | 76.41s | - | 1.05x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 94.99s | 95.88s | +0.9% | 86.49s | 87.23s | 2.69s | 2.87s | 3.31s | 3.26s | -1.4% | 95.88s | - | 0.99x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29116928458)

