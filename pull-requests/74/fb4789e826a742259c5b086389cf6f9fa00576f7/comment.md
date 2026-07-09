<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `fb4789e` against base `9018ef6`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 30.46s | 40.82s | +34.0% | 20.22s | 24.08s | +19.1% | 4.17s | 3.96s | -5.0% | 3.49s | 2.86s | -18.1% | 0.75x |
| Large app | 1 | 14.31s | 19.93s | +39.2% | 8.66s | 10.74s | +24.0% | 2.10s | 1.98s | -5.4% | 1.90s | 1.82s | -4.2% | 0.72x |
| Standard fixtures | 6 | 16.14s | 20.90s | +29.4% | 11.55s | 13.34s | +15.5% | 2.07s | 1.98s | -4.6% | 1.59s | 1.04s | -34.7% | 0.77x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.89s | 10.62s | +19.4% | 10.69s | 11.01s | 0.84x | 1600 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.21s | 4.50s | +6.9% | 4.52s | 4.70s | 0.94x | 659 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.68s | 6.49s | +14.3% | 6.54s | 6.79s | 0.88x | 852 MB |
| `synthetic-256-sourcemaps` | 10 | 2.24s | 2.33s | +4.1% | 2.35s | 2.52s | 0.96x | 465 MB |
| `synthetic-256-ssr-esm` | 10 | 2.09s | 2.18s | +4.3% | 2.19s | 2.42s | 0.96x | 423 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.48s | 2.71s | +9.4% | 2.72s | 2.93s | 0.91x | 482 MB |
| `synthetic-48-ssr-esm` | 10 | 1.36s | 1.43s | +5.4% | 1.46s | 1.73s | 0.95x | 316 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.31s | 19.93s | +39.2% | 8.66s | 10.74s | 2.10s | 1.98s | 1.90s | 1.82s | -4.2% | 19.99s | 20.37s | 0.72x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.76s | 6.31s | +32.5% | 3.36s | 3.96s | 0.60s | 0.57s | 0.50s | 0.33s | -34.9% | 6.34s | 6.43s | 0.75x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.81s | 6.36s | +32.2% | 3.40s | 4.01s | 0.59s | 0.56s | 0.56s | 0.33s | -41.0% | 6.39s | 6.48s | 0.76x | - |
| `synthetic-256-sourcemaps` | 10 | 2.08s | 2.72s | +30.7% | 1.55s | 1.73s | 0.27s | 0.24s | 0.15s | 0.13s | -16.7% | 2.70s | 2.80s | 0.77x | - |
| `synthetic-256-ssr-esm` | 10 | 1.76s | 2.25s | +27.8% | 1.27s | 1.49s | 0.24s | 0.24s | 0.15s | 0.10s | -32.8% | 2.24s | 2.27s | 0.78x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.80s | 2.22s | +23.3% | 1.30s | 1.47s | 0.25s | 0.24s | 0.15s | 0.10s | -32.3% | 2.23s | 2.25s | 0.81x | - |
| `synthetic-48-ssr-esm` | 10 | 0.92s | 1.03s | +11.8% | 0.67s | 0.69s | 0.13s | 0.13s | 0.08s | 0.05s | -32.0% | 1.04s | 1.08s | 0.89x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1810.3ms | 1579.0ms | -12.8% | 1579.0ms | 13.6ms | 10 |
| node | `route:module` | 1785 | 949.3ms | 775.9ms | -18.3% | 775.9ms | 13.5ms | 10 |
| web | `route:client-entry` | 1785 | 410.5ms | 457.9ms | +11.5% | 457.9ms | 10.3ms | 10 |
| node | `manifest:transform` | 5 | 118.3ms | 119.4ms | +0.9% | 119.4ms | 30.5ms | 5 |
| web | `manifest:stage` | 15 | 18.6ms | 20.4ms | +9.7% | 20.4ms | 2.0ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 137.9ms | - | 137.9ms | 14.3ms | 10 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2119.2ms | 1845.8ms | -12.9% | 1845.8ms | 17.4ms | 10 |
| node | `route:module` | 5130 | 971.4ms | 939.7ms | -3.3% | 939.7ms | 16.7ms | 10 |
| web | `route:client-entry` | 5130 | 620.8ms | 665.0ms | +7.1% | 665.0ms | 7.9ms | 10 |
| node | `manifest:transform` | 5 | 225.0ms | 213.5ms | -5.1% | 213.5ms | 51.4ms | 5 |
| node | `module:client-only-stub` | 5 | 60.3ms | 160.0ms | +165.3% | 160.0ms | 62.5ms | 5 |
| web | `manifest:stage` | 15 | 60.0ms | 58.8ms | -2.0% | 58.8ms | 6.7ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.1ms | - | 2.1ms | 0.4ms | 10 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2124.8ms | 1838.0ms | -13.5% | 1838.0ms | 9.1ms | 10 |
| node | `route:module` | 5130 | 973.0ms | 932.0ms | -4.2% | 932.0ms | 7.3ms | 10 |
| web | `route:client-entry` | 5130 | 638.2ms | 642.0ms | +0.6% | 642.0ms | 8.0ms | 10 |
| node | `manifest:transform` | 5 | 219.5ms | 204.1ms | -7.0% | 204.1ms | 45.0ms | 5 |
| node | `module:client-only-stub` | 5 | 124.7ms | 299.6ms | +140.3% | 299.6ms | 73.0ms | 5 |
| web | `manifest:stage` | 15 | 67.6ms | 59.8ms | -11.5% | 59.8ms | 6.6ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.3ms | - | 2.3ms | 0.4ms | 10 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1450.3ms | 1310.6ms | -9.6% | 1310.6ms | 15.2ms | 22 |
| node | `route:module` | 2580 | 609.4ms | 629.9ms | +3.4% | 629.9ms | 5.0ms | 20 |
| web | `route:client-entry` | 2582 | 410.2ms | 427.7ms | +4.3% | 427.7ms | 6.2ms | 22 |
| node | `module:client-only-stub` | 10 | 193.8ms | 22.1ms | -88.6% | 22.1ms | 2.7ms | 10 |
| node | `manifest:transform` | 10 | 171.7ms | 179.9ms | +4.8% | 179.9ms | 26.1ms | 10 |
| web | `manifest:stage` | 32 | 24.3ms | 28.3ms | +16.5% | 28.3ms | 1.4ms | 32 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 22 | - | 6.3ms | - | 6.3ms | 0.4ms | 22 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1351.2ms | 1281.0ms | -5.2% | 1281.0ms | 11.0ms | 21 |
| node | `route:module` | 2580 | 539.8ms | 627.2ms | +16.2% | 627.2ms | 9.0ms | 20 |
| web | `route:client-entry` | 2581 | 395.6ms | 385.0ms | -2.7% | 385.0ms | 5.6ms | 21 |
| node | `manifest:transform` | 10 | 166.0ms | 170.6ms | +2.8% | 170.6ms | 24.0ms | 10 |
| node | `module:client-only-stub` | 10 | 96.2ms | 22.5ms | -76.6% | 22.5ms | 2.7ms | 10 |
| web | `manifest:stage` | 31 | 20.2ms | 27.6ms | +36.6% | 27.6ms | 1.4ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 4.7ms | - | 4.7ms | 0.4ms | 21 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1414.3ms | 1279.5ms | -9.5% | 1279.5ms | 12.6ms | 22 |
| node | `route:module` | 2580 | 564.9ms | 613.5ms | +8.6% | 613.5ms | 9.0ms | 20 |
| web | `route:client-entry` | 2582 | 401.9ms | 397.5ms | -1.1% | 397.5ms | 5.7ms | 22 |
| node | `manifest:transform` | 10 | 162.1ms | 177.5ms | +9.5% | 177.5ms | 25.6ms | 10 |
| node | `module:client-only-stub` | 10 | 88.4ms | 28.5ms | -67.8% | 28.5ms | 6.2ms | 10 |
| web | `manifest:stage` | 32 | 21.4ms | 28.3ms | +32.2% | 28.3ms | 1.4ms | 32 |
| web | `manifest:transform` | 10 | 1.1ms | 1.0ms | -9.1% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 22 | - | 4.5ms | - | 4.5ms | 0.4ms | 22 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 501 | 502.3ms | 374.5ms | -25.4% | 374.5ms | 9.3ms | 21 |
| node | `route:module` | 500 | 165.2ms | 144.9ms | -12.3% | 144.9ms | 0.7ms | 20 |
| web | `route:client-entry` | 501 | 108.5ms | 94.2ms | -13.2% | 94.2ms | 2.1ms | 21 |
| node | `module:client-only-stub` | 10 | 83.4ms | 90.9ms | +9.0% | 90.9ms | 14.2ms | 10 |
| node | `manifest:transform` | 10 | 63.9ms | 47.5ms | -25.7% | 47.5ms | 6.4ms | 10 |
| web | `manifest:stage` | 31 | 5.3ms | 8.2ms | +54.7% | 8.2ms | 0.4ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 4.8ms | - | 4.8ms | 0.4ms | 21 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 123.07s | 124.88s | +1.5% | 124.88s | - | 0.99x | - |
| complex app | 2 | 80.49s | 94.28s | +17.1% | 94.28s | - | 0.85x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 98.57s | 109.39s | +11.0% | 89.60s | 96.38s | 3.04s | 3.08s | 3.37s | 3.51s | +4.1% | 109.39s | - | 0.90x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29027405444)

