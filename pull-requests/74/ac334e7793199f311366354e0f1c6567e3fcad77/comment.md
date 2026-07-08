<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `ac334e7` against base `9e95ea0`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.65s | 33.87s | +14.3% | 19.79s | 24.23s | +22.4% | 4.00s | 3.92s | -2.0% | 3.29s | 3.29s | +0.0% | 0.88x |
| Large app | 1 | 13.75s | 16.30s | +18.5% | 8.39s | 10.85s | +29.4% | 2.01s | 2.02s | +0.2% | 1.75s | 1.83s | +4.6% | 0.84x |
| Standard fixtures | 6 | 15.89s | 17.58s | +10.6% | 11.41s | 13.37s | +17.2% | 1.99s | 1.91s | -4.2% | 1.54s | 1.46s | -5.1% | 0.90x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.94s | 10.54s | +18.0% | 10.63s | 10.90s | 0.85x | 1596 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.25s | 4.44s | +4.6% | 4.48s | 4.71s | 0.96x | 629 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.76s | 6.22s | +7.9% | 6.29s | 6.61s | 0.93x | 839 MB |
| `synthetic-256-sourcemaps` | 10 | 2.21s | 2.25s | +1.7% | 2.25s | 2.42s | 0.98x | 445 MB |
| `synthetic-256-ssr-esm` | 10 | 2.05s | 2.08s | +1.4% | 2.11s | 2.25s | 0.99x | 409 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.47s | 2.62s | +5.8% | 2.63s | 2.81s | 0.95x | 470 MB |
| `synthetic-48-ssr-esm` | 10 | 1.37s | 1.38s | +0.8% | 1.41s | 1.67s | 0.99x | 316 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.75s | 16.30s | +18.5% | 8.39s | 10.85s | 2.01s | 2.02s | 1.75s | 1.83s | +4.6% | 16.38s | 16.65s | 0.84x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.66s | 5.29s | +13.4% | 3.31s | 3.99s | 0.56s | 0.54s | 0.50s | 0.53s | +4.6% | 5.37s | 5.66s | 0.88x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.66s | 5.33s | +14.2% | 3.33s | 4.05s | 0.56s | 0.54s | 0.53s | 0.51s | -4.9% | 5.40s | 5.77s | 0.88x | - |
| `synthetic-256-sourcemaps` | 10 | 2.04s | 2.21s | +7.9% | 1.53s | 1.72s | 0.25s | 0.23s | 0.15s | 0.13s | -16.6% | 2.21s | 2.28s | 0.93x | - |
| `synthetic-256-ssr-esm` | 10 | 1.79s | 1.92s | +6.9% | 1.28s | 1.47s | 0.24s | 0.23s | 0.13s | 0.13s | -1.1% | 1.91s | 1.96s | 0.94x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.80s | 1.91s | +6.1% | 1.29s | 1.47s | 0.25s | 0.23s | 0.15s | 0.13s | -16.8% | 1.91s | 1.94s | 0.94x | - |
| `synthetic-48-ssr-esm` | 10 | 0.93s | 0.93s | -0.2% | 0.67s | 0.67s | 0.13s | 0.13s | 0.08s | 0.05s | -32.1% | 0.92s | 0.94s | 1.00x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1765.8ms | 1566.2ms | -11.3% | 1566.2ms | 13.6ms | 10 |
| node | `route:module` | 1785 | 915.6ms | 812.2ms | -11.3% | 812.2ms | 12.6ms | 10 |
| web | `route:client-entry` | 1785 | 390.6ms | 460.1ms | +17.8% | 460.1ms | 9.1ms | 10 |
| node | `manifest:transform` | 5 | 115.7ms | 111.4ms | -3.7% | 111.4ms | 26.3ms | 5 |
| web | `manifest:stage` | 10 | 15.3ms | 14.5ms | -5.2% | 14.5ms | 1.9ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 141.6ms | - | 141.6ms | 14.8ms | 10 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2016.2ms | 1857.4ms | -7.9% | 1857.4ms | 6.8ms | 10 |
| node | `route:module` | 5130 | 918.1ms | 921.7ms | +0.4% | 921.7ms | 10.1ms | 10 |
| web | `route:client-entry` | 5130 | 617.0ms | 605.2ms | -1.9% | 605.2ms | 6.3ms | 10 |
| node | `manifest:transform` | 5 | 214.4ms | 219.4ms | +2.3% | 219.4ms | 48.5ms | 5 |
| node | `module:client-only-stub` | 5 | 80.9ms | 153.0ms | +89.1% | 153.0ms | 68.6ms | 5 |
| web | `manifest:stage` | 10 | 60.6ms | 46.8ms | -22.8% | 46.8ms | 8.2ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.0ms | - | 2.0ms | 0.3ms | 10 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2060.2ms | 1858.0ms | -9.8% | 1858.0ms | 12.3ms | 10 |
| node | `route:module` | 5130 | 949.5ms | 951.9ms | +0.3% | 951.9ms | 11.1ms | 10 |
| web | `route:client-entry` | 5130 | 616.0ms | 626.8ms | +1.8% | 626.8ms | 6.9ms | 10 |
| node | `manifest:transform` | 5 | 222.5ms | 211.8ms | -4.8% | 211.8ms | 50.2ms | 5 |
| node | `module:client-only-stub` | 5 | 132.7ms | 159.4ms | +20.1% | 159.4ms | 75.4ms | 5 |
| web | `manifest:stage` | 10 | 60.7ms | 50.4ms | -17.0% | 50.4ms | 9.2ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.0ms | - | 2.0ms | 0.3ms | 10 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2583 | 1434.6ms | 1366.5ms | -4.7% | 1366.5ms | 13.1ms | 23 |
| node | `route:module` | 2580 | 601.2ms | 640.4ms | +6.5% | 640.4ms | 4.6ms | 20 |
| web | `route:client-entry` | 2583 | 399.5ms | 396.6ms | -0.7% | 396.6ms | 5.3ms | 23 |
| node | `module:client-only-stub` | 10 | 215.2ms | 27.2ms | -87.4% | 27.2ms | 4.6ms | 10 |
| node | `manifest:transform` | 10 | 184.7ms | 156.3ms | -15.4% | 156.3ms | 22.5ms | 10 |
| web | `manifest:stage` | 23 | 21.2ms | 25.3ms | +19.3% | 25.3ms | 3.2ms | 23 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 23 | - | 5.3ms | - | 5.3ms | 0.4ms | 23 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1359.2ms | 1237.5ms | -9.0% | 1237.5ms | 15.8ms | 21 |
| node | `route:module` | 2580 | 547.3ms | 611.6ms | +11.7% | 611.6ms | 5.2ms | 20 |
| web | `route:client-entry` | 2581 | 389.4ms | 381.2ms | -2.1% | 381.2ms | 5.5ms | 21 |
| node | `module:client-only-stub` | 10 | 204.7ms | 22.6ms | -89.0% | 22.6ms | 3.0ms | 10 |
| node | `manifest:transform` | 10 | 173.2ms | 160.1ms | -7.6% | 160.1ms | 21.6ms | 10 |
| web | `manifest:stage` | 21 | 21.4ms | 20.4ms | -4.7% | 20.4ms | 1.4ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 4.1ms | - | 4.1ms | 0.3ms | 21 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1369.7ms | 1249.9ms | -8.7% | 1249.9ms | 15.5ms | 21 |
| node | `route:module` | 2580 | 554.6ms | 610.3ms | +10.0% | 610.3ms | 8.2ms | 20 |
| web | `route:client-entry` | 2581 | 386.7ms | 375.9ms | -2.8% | 375.9ms | 5.3ms | 21 |
| node | `module:client-only-stub` | 10 | 167.7ms | 27.3ms | -83.7% | 27.3ms | 8.0ms | 10 |
| node | `manifest:transform` | 10 | 167.2ms | 166.6ms | -0.4% | 166.6ms | 23.8ms | 10 |
| web | `manifest:stage` | 21 | 20.7ms | 19.7ms | -4.8% | 19.7ms | 1.3ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 4.1ms | - | 4.1ms | 0.3ms | 21 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 494.8ms | 376.2ms | -24.0% | 376.2ms | 9.5ms | 20 |
| node | `route:module` | 500 | 164.9ms | 144.2ms | -12.6% | 144.2ms | 0.8ms | 20 |
| web | `route:client-entry` | 500 | 105.8ms | 89.1ms | -15.8% | 89.1ms | 1.9ms | 20 |
| node | `module:client-only-stub` | 10 | 78.7ms | 74.7ms | -5.1% | 74.7ms | 11.7ms | 10 |
| node | `manifest:transform` | 10 | 65.5ms | 46.6ms | -28.9% | 46.6ms | 6.2ms | 10 |
| web | `manifest:stage` | 20 | 5.6ms | 5.8ms | +3.6% | 5.8ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 4.2ms | - | 4.2ms | 0.4ms | 20 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 117.05s | 121.37s | +3.7% | 121.37s | - | 0.96x | - |
| complex app | 2 | 84.95s | 91.46s | +7.7% | 91.46s | - | 0.93x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 101.19s | 104.03s | +2.8% | 92.23s | 94.88s | 2.92s | 3.06s | 3.48s | 3.47s | -0.1% | 104.03s | - | 0.97x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28909240780)

