<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `a3e4f19` against base `9018ef6`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 31.73s | 45.80s | +44.3% | 21.13s | 24.80s | +17.4% | 4.36s | 3.97s | -9.1% | 3.62s | 3.41s | -5.9% | 0.69x |
| Large app | 1 | 14.88s | 20.69s | +39.0% | 9.01s | 11.09s | +23.0% | 2.21s | 2.00s | -9.2% | 2.00s | 1.92s | -4.2% | 0.72x |
| Standard fixtures | 6 | 16.85s | 25.11s | +49.0% | 12.12s | 13.71s | +13.2% | 2.16s | 1.96s | -9.0% | 1.62s | 1.49s | -8.1% | 0.67x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 9.17s | 11.28s | +23.0% | 11.33s | 11.58s | 0.81x | 1602 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.27s | 4.54s | +6.3% | 4.59s | 4.82s | 0.94x | 656 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.85s | 6.85s | +17.1% | 6.84s | 6.87s | 0.85x | 869 MB |
| `synthetic-256-sourcemaps` | 10 | 2.33s | 2.43s | +4.2% | 2.42s | 2.55s | 0.96x | 469 MB |
| `synthetic-256-ssr-esm` | 10 | 2.13s | 2.24s | +5.3% | 2.23s | 2.37s | 0.95x | 433 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.54s | 2.77s | +9.2% | 2.80s | 3.02s | 0.92x | 482 MB |
| `synthetic-48-ssr-esm` | 10 | 1.41s | 1.43s | +1.5% | 1.45s | 1.71s | 0.98x | 322 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.88s | 20.69s | +39.0% | 9.01s | 11.09s | 2.21s | 2.00s | 2.00s | 1.92s | -4.2% | 20.66s | 20.84s | 0.72x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.91s | 7.90s | +61.0% | 3.51s | 4.12s | 0.59s | 0.56s | 0.56s | 0.53s | -5.0% | 7.90s | 8.00s | 0.62x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 5.00s | 7.91s | +58.0% | 3.58s | 4.10s | 0.64s | 0.56s | 0.53s | 0.53s | -0.2% | 7.91s | 7.98s | 0.63x | - |
| `synthetic-256-sourcemaps` | 10 | 2.17s | 3.18s | +46.7% | 1.60s | 1.76s | 0.27s | 0.23s | 0.15s | 0.13s | -16.8% | 3.14s | 3.24s | 0.68x | - |
| `synthetic-256-ssr-esm` | 10 | 1.89s | 2.52s | +33.8% | 1.36s | 1.52s | 0.26s | 0.24s | 0.15s | 0.13s | -17.1% | 2.51s | 2.59s | 0.75x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.89s | 2.51s | +32.9% | 1.36s | 1.51s | 0.26s | 0.24s | 0.15s | 0.13s | -16.7% | 2.47s | 2.54s | 0.75x | - |
| `synthetic-48-ssr-esm` | 10 | 0.99s | 1.08s | +9.5% | 0.70s | 0.70s | 0.14s | 0.13s | 0.08s | 0.05s | -32.4% | 1.09s | 1.12s | 0.91x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1852.9ms | 1620.1ms | -12.6% | 1620.1ms | 14.0ms | 10 |
| node | `route:module` | 1785 | 925.0ms | 810.3ms | -12.4% | 810.3ms | 11.9ms | 10 |
| web | `route:client-entry` | 1785 | 407.5ms | 460.1ms | +12.9% | 460.1ms | 10.7ms | 10 |
| node | `manifest:transform` | 5 | 98.4ms | 92.3ms | -6.2% | 92.3ms | 21.5ms | 5 |
| web | `manifest:stage` | 15 | 15.3ms | 21.2ms | +38.6% | 21.2ms | 2.1ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 139.7ms | - | 139.7ms | 15.1ms | 10 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2201.9ms | 1875.7ms | -14.8% | 1875.7ms | 7.4ms | 10 |
| node | `route:module` | 5130 | 962.8ms | 988.8ms | +2.7% | 988.8ms | 11.0ms | 10 |
| web | `route:client-entry` | 5130 | 650.3ms | 626.6ms | -3.6% | 626.6ms | 7.2ms | 10 |
| node | `manifest:transform` | 5 | 228.1ms | 211.2ms | -7.4% | 211.2ms | 46.6ms | 5 |
| node | `module:client-only-stub` | 5 | 74.3ms | 244.5ms | +229.1% | 244.5ms | 73.3ms | 5 |
| web | `manifest:stage` | 15 | 70.4ms | 58.6ms | -16.8% | 58.6ms | 6.5ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 3.0ms | - | 3.0ms | 1.0ms | 10 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2130.9ms | 1844.2ms | -13.5% | 1844.2ms | 8.0ms | 10 |
| node | `route:module` | 5130 | 962.2ms | 964.5ms | +0.2% | 964.5ms | 7.3ms | 10 |
| web | `route:client-entry` | 5130 | 641.5ms | 647.3ms | +0.9% | 647.3ms | 9.1ms | 10 |
| node | `manifest:transform` | 5 | 223.2ms | 218.6ms | -2.1% | 218.6ms | 51.9ms | 5 |
| node | `module:client-only-stub` | 5 | 64.6ms | 278.5ms | +331.1% | 278.5ms | 69.0ms | 5 |
| web | `manifest:stage` | 15 | 53.3ms | 62.6ms | +17.4% | 62.6ms | 8.7ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.5ms | - | 2.5ms | 0.4ms | 10 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1482.8ms | 1378.9ms | -7.0% | 1378.9ms | 12.8ms | 21 |
| node | `route:module` | 2580 | 609.1ms | 624.3ms | +2.5% | 624.3ms | 5.2ms | 20 |
| web | `route:client-entry` | 2581 | 426.9ms | 404.0ms | -5.4% | 404.0ms | 6.3ms | 21 |
| node | `manifest:transform` | 10 | 165.1ms | 170.2ms | +3.1% | 170.2ms | 21.7ms | 10 |
| node | `module:client-only-stub` | 10 | 65.4ms | 30.9ms | -52.8% | 30.9ms | 6.5ms | 10 |
| web | `manifest:stage` | 33 | 26.9ms | 30.7ms | +14.1% | 30.7ms | 3.4ms | 33 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 23 | - | 6.4ms | - | 6.4ms | 0.4ms | 23 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2583 | 1413.0ms | 1288.8ms | -8.8% | 1288.8ms | 8.8ms | 23 |
| node | `route:module` | 2580 | 589.9ms | 628.4ms | +6.5% | 628.4ms | 8.9ms | 20 |
| web | `route:client-entry` | 2583 | 416.4ms | 425.9ms | +2.3% | 425.9ms | 5.9ms | 23 |
| node | `manifest:transform` | 10 | 164.9ms | 193.9ms | +17.6% | 193.9ms | 23.7ms | 10 |
| node | `module:client-only-stub` | 10 | 131.8ms | 23.5ms | -82.2% | 23.5ms | 2.9ms | 10 |
| web | `manifest:stage` | 33 | 23.7ms | 29.8ms | +25.7% | 29.8ms | 1.5ms | 33 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 23 | - | 4.9ms | - | 4.9ms | 0.4ms | 23 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2583 | 1443.8ms | 1267.0ms | -12.2% | 1267.0ms | 15.5ms | 23 |
| node | `route:module` | 2580 | 608.8ms | 625.8ms | +2.8% | 625.8ms | 9.1ms | 20 |
| node | `module:client-only-stub` | 10 | 426.3ms | 21.9ms | -94.9% | 21.9ms | 2.7ms | 10 |
| web | `route:client-entry` | 2583 | 409.7ms | 398.3ms | -2.8% | 398.3ms | 5.7ms | 23 |
| node | `manifest:transform` | 10 | 182.4ms | 169.6ms | -7.0% | 169.6ms | 23.5ms | 10 |
| web | `manifest:stage` | 33 | 22.5ms | 29.1ms | +29.3% | 29.1ms | 1.4ms | 33 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 23 | - | 5.1ms | - | 5.1ms | 0.4ms | 23 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 520.5ms | 388.3ms | -25.4% | 388.3ms | 9.2ms | 20 |
| node | `route:module` | 500 | 176.4ms | 141.5ms | -19.8% | 141.5ms | 0.6ms | 20 |
| web | `route:client-entry` | 500 | 114.0ms | 90.7ms | -20.4% | 90.7ms | 2.0ms | 20 |
| node | `module:client-only-stub` | 10 | 102.9ms | 81.9ms | -20.4% | 81.9ms | 9.4ms | 10 |
| node | `manifest:transform` | 10 | 54.6ms | 45.5ms | -16.7% | 45.5ms | 9.1ms | 10 |
| web | `manifest:stage` | 30 | 5.9ms | 7.9ms | +33.9% | 7.9ms | 0.4ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 4.5ms | - | 4.5ms | 0.4ms | 20 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 121.57s | 128.32s | +5.5% | 128.32s | - | 0.95x | - |
| complex app | 2 | 85.52s | 94.69s | +10.7% | 94.69s | - | 0.90x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 105.15s | 111.99s | +6.5% | 95.75s | 98.56s | 3.02s | 3.20s | 3.69s | 3.68s | -0.3% | 111.99s | - | 0.94x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28990272429)

