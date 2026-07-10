<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `acdd900` against base `96ed301`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 30.06s | 31.67s | +5.4% | 20.07s | 21.77s | +8.4% | 4.06s | 4.19s | +3.3% | 3.36s | 3.03s | -9.9% | 0.95x |
| Large app | 1 | 14.15s | 14.34s | +1.3% | 8.65s | 8.88s | +2.7% | 2.07s | 2.09s | +1.3% | 1.84s | 1.64s | -11.0% | 0.99x |
| Standard fixtures | 6 | 15.91s | 17.33s | +9.0% | 11.43s | 12.88s | +12.8% | 1.99s | 2.10s | +5.4% | 1.52s | 1.39s | -8.4% | 0.92x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.90s | 8.86s | -0.5% | 8.78s | 8.88s | 1.01x | 1427 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.29s | 4.46s | +4.1% | 4.49s | 4.68s | 0.96x | 542 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.68s | 5.73s | +1.0% | 5.79s | 6.23s | 0.99x | 672 MB |
| `synthetic-256-sourcemaps` | 10 | 2.26s | 2.21s | -1.9% | 2.22s | 2.38s | 1.02x | 388 MB |
| `synthetic-256-ssr-esm` | 10 | 2.12s | 2.10s | -1.0% | 2.10s | 2.25s | 1.01x | 386 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.52s | 2.61s | +3.7% | 2.59s | 2.70s | 0.96x | 397 MB |
| `synthetic-48-ssr-esm` | 10 | 1.39s | 1.38s | -1.4% | 1.40s | 1.64s | 1.01x | 317 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.15s | 14.34s | +1.3% | 8.65s | 8.88s | 2.07s | 2.09s | 1.84s | 1.64s | -11.0% | 14.33s | 14.58s | 0.99x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.69s | 5.12s | +9.0% | 3.37s | 3.80s | 0.57s | 0.59s | 0.50s | 0.48s | -4.4% | 5.17s | 5.32s | 0.92x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.69s | 5.14s | +9.7% | 3.32s | 3.80s | 0.57s | 0.59s | 0.51s | 0.48s | -5.7% | 5.29s | 5.62s | 0.91x | - |
| `synthetic-256-sourcemaps` | 10 | 2.04s | 2.13s | +4.1% | 1.50s | 1.61s | 0.25s | 0.26s | 0.15s | 0.13s | -16.3% | 2.15s | 2.22s | 0.96x | - |
| `synthetic-256-ssr-esm` | 10 | 1.79s | 2.02s | +13.3% | 1.28s | 1.51s | 0.24s | 0.26s | 0.15s | 0.13s | -17.1% | 2.02s | 2.07s | 0.88x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.79s | 2.04s | +14.0% | 1.30s | 1.53s | 0.24s | 0.26s | 0.15s | 0.13s | -17.2% | 2.03s | 2.10s | 0.88x | - |
| `synthetic-48-ssr-esm` | 10 | 0.91s | 0.89s | -2.4% | 0.66s | 0.64s | 0.12s | 0.13s | 0.05s | 0.05s | -0.0% | 0.90s | 0.99s | 1.02x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1752.1ms | 5310.1ms | +203.1% | 5310.1ms | 29.0ms | 36 |
| node | `route:module` | 1785 | 937.0ms | 1781.4ms | +90.1% | 1781.4ms | 12.6ms | 50 |
| web | `route:client-entry` | 1785 | 395.2ms | 378.0ms | -4.4% | 378.0ms | 6.2ms | 10 |
| node | `manifest:transform` | 5 | 142.0ms | 108.0ms | -23.9% | 108.0ms | 26.1ms | 5 |
| web | `manifest:stage` | 10 | 17.7ms | 14.6ms | -17.5% | 14.6ms | 2.0ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2056.6ms | 3743.2ms | +82.0% | 3743.2ms | 23.2ms | 35 |
| node | `route:module` | 5130 | 965.7ms | 1736.5ms | +79.8% | 1736.5ms | 5.4ms | 41 |
| web | `route:client-entry` | 5130 | 626.4ms | 671.9ms | +7.3% | 671.9ms | 7.0ms | 10 |
| node | `module:client-only-stub` | 5 | 423.6ms | 30.4ms | -92.8% | 30.4ms | 7.4ms | 5 |
| node | `manifest:transform` | 5 | 221.4ms | 206.7ms | -6.6% | 206.7ms | 44.8ms | 5 |
| web | `manifest:stage` | 10 | 54.0ms | 56.9ms | +5.4% | 56.9ms | 8.9ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5132 | 2091.2ms | 3797.1ms | +81.6% | 3797.1ms | 19.0ms | 40 |
| node | `route:module` | 5130 | 968.8ms | 1724.9ms | +78.0% | 1724.9ms | 4.0ms | 47 |
| web | `route:client-entry` | 5130 | 647.2ms | 651.2ms | +0.6% | 651.2ms | 7.9ms | 10 |
| node | `module:client-only-stub` | 5 | 441.2ms | 28.8ms | -93.5% | 28.8ms | 7.0ms | 5 |
| node | `manifest:transform` | 5 | 205.6ms | 207.2ms | +0.8% | 207.2ms | 45.7ms | 5 |
| web | `manifest:stage` | 10 | 58.2ms | 59.3ms | +1.9% | 59.3ms | 7.0ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2584 | 1422.4ms | 3079.1ms | +116.5% | 3079.1ms | 21.3ms | 44 |
| node | `route:module` | 2580 | 589.9ms | 1258.2ms | +113.3% | 1258.2ms | 6.3ms | 64 |
| web | `route:client-entry` | 2582 | 401.4ms | 427.6ms | +6.5% | 427.6ms | 5.6ms | 22 |
| node | `module:client-only-stub` | 10 | 186.1ms | 72.2ms | -61.2% | 72.2ms | 15.0ms | 10 |
| node | `manifest:transform` | 10 | 147.5ms | 166.1ms | +12.6% | 166.1ms | 21.8ms | 10 |
| web | `manifest:stage` | 22 | 21.0ms | 21.7ms | +3.3% | 21.7ms | 1.3ms | 22 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1352.9ms | 3084.6ms | +128.0% | 3084.6ms | 22.3ms | 42 |
| node | `route:module` | 2580 | 571.2ms | 1112.4ms | +94.7% | 1112.4ms | 4.4ms | 69 |
| web | `route:client-entry` | 2582 | 396.4ms | 431.8ms | +8.9% | 431.8ms | 5.9ms | 22 |
| node | `module:client-only-stub` | 10 | 302.7ms | 75.4ms | -75.1% | 75.4ms | 14.4ms | 10 |
| node | `manifest:transform` | 10 | 146.7ms | 139.2ms | -5.1% | 139.2ms | 20.1ms | 10 |
| web | `manifest:stage` | 22 | 21.6ms | 26.7ms | +23.6% | 26.7ms | 4.3ms | 22 |
| web | `manifest:transform` | 10 | 1.1ms | 1.0ms | -9.1% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1372.1ms | 3081.9ms | +124.6% | 3081.9ms | 27.1ms | 42 |
| node | `route:module` | 2580 | 556.0ms | 1137.1ms | +104.5% | 1137.1ms | 8.7ms | 67 |
| web | `route:client-entry` | 2581 | 387.1ms | 419.6ms | +8.4% | 419.6ms | 5.5ms | 21 |
| node | `manifest:transform` | 10 | 179.0ms | 140.4ms | -21.6% | 140.4ms | 17.7ms | 10 |
| node | `module:client-only-stub` | 10 | 115.0ms | 82.6ms | -28.2% | 82.6ms | 20.2ms | 10 |
| web | `manifest:stage` | 21 | 22.1ms | 26.8ms | +21.3% | 26.8ms | 3.2ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 488.5ms | 376.3ms | -23.0% | 376.3ms | 9.3ms | 20 |
| node | `route:module` | 500 | 156.7ms | 165.0ms | +5.3% | 165.0ms | 2.5ms | 20 |
| web | `route:client-entry` | 500 | 107.9ms | 105.2ms | -2.5% | 105.2ms | 4.1ms | 20 |
| node | `module:client-only-stub` | 10 | 96.6ms | 93.5ms | -3.2% | 93.5ms | 16.9ms | 10 |
| node | `manifest:transform` | 10 | 60.5ms | 59.0ms | -2.5% | 59.0ms | 6.8ms | 10 |
| web | `manifest:stage` | 20 | 5.3ms | 5.5ms | +3.8% | 5.5ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 120.72s | 115.64s | -4.2% | 115.64s | - | 1.04x | - |
| complex app | 2 | 82.79s | 82.10s | -0.8% | 82.10s | - | 1.01x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 98.98s | 98.10s | -0.9% | 90.02s | 89.57s | 2.96s | 3.28s | 3.39s | 2.43s | -28.5% | 98.10s | - | 1.01x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29058028983)

