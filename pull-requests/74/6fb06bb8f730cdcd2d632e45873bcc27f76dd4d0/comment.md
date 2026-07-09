<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `6fb06bb` against base `9018ef6`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 30.46s | 33.20s | +9.0% | 20.22s | 17.99s | -11.0% | 4.17s | 2.91s | -30.3% | 3.49s | 2.44s | -30.2% | 0.92x |
| Large app | 1 | 14.31s | 16.94s | +18.3% | 8.66s | 8.24s | -4.9% | 2.10s | 1.43s | -32.0% | 1.90s | 1.57s | -17.3% | 0.85x |
| Standard fixtures | 6 | 16.14s | 16.26s | +0.7% | 11.55s | 9.75s | -15.6% | 2.07s | 1.48s | -28.5% | 1.59s | 0.86s | -45.6% | 0.99x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.89s | 8.37s | -5.9% | 8.51s | 8.94s | 1.06x | 1611 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.21s | 3.18s | -24.5% | 3.21s | 3.41s | 1.32x | 658 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.68s | 4.70s | -17.3% | 4.72s | 4.84s | 1.21x | 856 MB |
| `synthetic-256-sourcemaps` | 10 | 2.24s | 1.71s | -23.7% | 1.72s | 1.83s | 1.31x | 464 MB |
| `synthetic-256-ssr-esm` | 10 | 2.09s | 1.61s | -22.8% | 1.64s | 1.76s | 1.30x | 441 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.48s | 1.98s | -19.9% | 2.00s | 2.17s | 1.25x | 482 MB |
| `synthetic-48-ssr-esm` | 10 | 1.36s | 1.05s | -22.6% | 1.07s | 1.27s | 1.29x | 322 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.31s | 16.94s | +18.3% | 8.66s | 8.24s | 2.10s | 1.43s | 1.90s | 1.57s | -17.3% | 16.84s | 17.49s | 0.85x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.76s | 5.18s | +8.8% | 3.36s | 2.98s | 0.60s | 0.43s | 0.50s | 0.28s | -44.6% | 5.24s | 5.73s | 0.92x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.81s | 4.84s | +0.7% | 3.40s | 2.87s | 0.59s | 0.43s | 0.56s | 0.26s | -54.1% | 4.86s | 5.38s | 0.99x | - |
| `synthetic-256-sourcemaps` | 10 | 2.08s | 2.03s | -2.7% | 1.55s | 1.29s | 0.27s | 0.18s | 0.15s | 0.10s | -33.1% | 2.08s | 2.30s | 1.03x | - |
| `synthetic-256-ssr-esm` | 10 | 1.76s | 1.74s | -1.3% | 1.27s | 1.07s | 0.24s | 0.18s | 0.15s | 0.08s | -50.2% | 1.71s | 1.93s | 1.01x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.80s | 1.64s | -9.0% | 1.30s | 1.04s | 0.25s | 0.17s | 0.15s | 0.10s | -33.2% | 1.67s | 1.89s | 1.10x | - |
| `synthetic-48-ssr-esm` | 10 | 0.92s | 0.83s | -10.4% | 0.67s | 0.50s | 0.13s | 0.10s | 0.08s | 0.05s | -31.5% | 0.85s | 1.05s | 1.12x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1810.3ms | 1211.2ms | -33.1% | 1211.2ms | 18.6ms | 10 |
| node | `route:module` | 1785 | 949.3ms | 605.7ms | -36.2% | 605.7ms | 9.9ms | 10 |
| web | `route:client-entry` | 1785 | 410.5ms | 359.8ms | -12.4% | 359.8ms | 8.3ms | 10 |
| node | `manifest:transform` | 5 | 118.3ms | 78.8ms | -33.4% | 78.8ms | 18.6ms | 5 |
| web | `manifest:stage` | 15 | 18.6ms | 15.3ms | -17.7% | 15.3ms | 1.6ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.4ms | -20.0% | 0.4ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 103.0ms | - | 103.0ms | 11.1ms | 10 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2119.2ms | 1434.2ms | -32.3% | 1434.2ms | 6.7ms | 10 |
| node | `route:module` | 5130 | 971.4ms | 708.0ms | -27.1% | 708.0ms | 14.5ms | 10 |
| web | `route:client-entry` | 5130 | 620.8ms | 481.5ms | -22.4% | 481.5ms | 16.5ms | 10 |
| node | `manifest:transform` | 5 | 225.0ms | 176.0ms | -21.8% | 176.0ms | 53.8ms | 5 |
| node | `module:client-only-stub` | 5 | 60.3ms | 87.5ms | +45.1% | 87.5ms | 28.7ms | 5 |
| web | `manifest:stage` | 15 | 60.0ms | 49.1ms | -18.2% | 49.1ms | 7.0ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.0ms | - | 2.0ms | 0.3ms | 10 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2124.8ms | 1410.5ms | -33.6% | 1410.5ms | 7.9ms | 10 |
| node | `route:module` | 5130 | 973.0ms | 770.5ms | -20.8% | 770.5ms | 15.7ms | 10 |
| web | `route:client-entry` | 5130 | 638.2ms | 457.0ms | -28.4% | 457.0ms | 7.0ms | 10 |
| node | `manifest:transform` | 5 | 219.5ms | 150.9ms | -31.3% | 150.9ms | 33.3ms | 5 |
| node | `module:client-only-stub` | 5 | 124.7ms | 132.0ms | +5.9% | 132.0ms | 40.5ms | 5 |
| web | `manifest:stage` | 15 | 67.6ms | 50.4ms | -25.4% | 50.4ms | 8.8ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.0ms | - | 2.0ms | 0.3ms | 10 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1450.3ms | 1005.6ms | -30.7% | 1005.6ms | 7.7ms | 20 |
| node | `route:module` | 2580 | 609.4ms | 509.8ms | -16.3% | 509.8ms | 6.2ms | 20 |
| web | `route:client-entry` | 2580 | 410.2ms | 288.3ms | -29.7% | 288.3ms | 4.9ms | 20 |
| node | `module:client-only-stub` | 10 | 193.8ms | 24.6ms | -87.3% | 24.6ms | 5.1ms | 10 |
| node | `manifest:transform` | 10 | 171.7ms | 122.5ms | -28.7% | 122.5ms | 15.0ms | 10 |
| web | `manifest:stage` | 30 | 24.3ms | 20.2ms | -16.9% | 20.2ms | 1.1ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 0.9ms | -10.0% | 0.9ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 4.0ms | - | 4.0ms | 0.3ms | 20 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1351.2ms | 962.3ms | -28.8% | 962.3ms | 10.0ms | 21 |
| node | `route:module` | 2580 | 539.8ms | 462.3ms | -14.4% | 462.3ms | 7.7ms | 20 |
| web | `route:client-entry` | 2581 | 395.6ms | 320.3ms | -19.0% | 320.3ms | 5.0ms | 21 |
| node | `manifest:transform` | 10 | 166.0ms | 136.6ms | -17.7% | 136.6ms | 16.6ms | 10 |
| node | `module:client-only-stub` | 10 | 96.2ms | 19.0ms | -80.2% | 19.0ms | 2.5ms | 10 |
| web | `manifest:stage` | 31 | 20.2ms | 25.0ms | +23.8% | 25.0ms | 2.6ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 3.7ms | - | 3.7ms | 0.3ms | 21 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1414.3ms | 936.1ms | -33.8% | 936.1ms | 10.2ms | 20 |
| node | `route:module` | 2580 | 564.9ms | 473.0ms | -16.3% | 473.0ms | 7.5ms | 20 |
| web | `route:client-entry` | 2580 | 401.9ms | 277.4ms | -31.0% | 277.4ms | 4.6ms | 20 |
| node | `manifest:transform` | 10 | 162.1ms | 125.7ms | -22.5% | 125.7ms | 18.4ms | 10 |
| node | `module:client-only-stub` | 10 | 88.4ms | 18.8ms | -78.7% | 18.8ms | 2.4ms | 10 |
| web | `manifest:stage` | 31 | 21.4ms | 22.7ms | +6.1% | 22.7ms | 2.6ms | 31 |
| web | `manifest:transform` | 10 | 1.1ms | 0.6ms | -45.5% | 0.6ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 3.6ms | - | 3.6ms | 0.3ms | 21 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 502.3ms | 276.0ms | -45.1% | 276.0ms | 6.0ms | 20 |
| node | `route:module` | 500 | 165.2ms | 100.8ms | -39.0% | 100.8ms | 0.5ms | 20 |
| web | `route:client-entry` | 500 | 108.5ms | 66.4ms | -38.8% | 66.4ms | 1.8ms | 20 |
| node | `module:client-only-stub` | 10 | 83.4ms | 66.9ms | -19.8% | 66.9ms | 10.2ms | 10 |
| node | `manifest:transform` | 10 | 63.9ms | 35.0ms | -45.2% | 35.0ms | 4.4ms | 10 |
| web | `manifest:stage` | 31 | 5.3ms | 6.1ms | +15.1% | 6.1ms | 0.6ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 0.4ms | -60.0% | 0.4ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 4.0ms | - | 4.0ms | 0.3ms | 21 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 123.07s | 96.54s | -21.6% | 96.54s | - | 1.27x | - |
| complex app | 2 | 80.49s | 70.65s | -12.2% | 70.65s | - | 1.14x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 98.57s | 86.75s | -12.0% | 89.60s | 75.39s | 3.04s | 2.13s | 3.37s | 3.81s | +13.2% | 86.75s | - | 1.14x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29029704522)

