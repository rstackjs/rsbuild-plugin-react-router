<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `ad857b6` against base `96ed301`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 27.49s | 40.53s | +47.4% | 18.33s | 21.57s | +17.7% | 3.71s | 3.71s | +0.1% | 3.11s | 3.19s | +2.7% | 0.68x |
| Large app | 1 | 12.81s | 17.96s | +40.1% | 7.83s | 9.33s | +19.2% | 1.84s | 1.81s | -1.6% | 1.65s | 1.75s | +6.2% | 0.71x |
| Standard fixtures | 6 | 14.68s | 22.58s | +53.8% | 10.50s | 12.24s | +16.5% | 1.87s | 1.91s | +1.7% | 1.46s | 1.44s | -1.2% | 0.65x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.32s | 9.73s | +16.9% | 9.74s | 9.91s | 0.86x | 1606 MB |
| `synthetic-1024-ssr-esm` | 5 | 3.85s | 4.05s | +5.1% | 4.11s | 4.32s | 0.95x | 643 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.17s | 5.91s | +14.4% | 5.91s | 6.09s | 0.87x | 862 MB |
| `synthetic-256-sourcemaps` | 10 | 2.08s | 2.21s | +6.0% | 2.21s | 2.35s | 0.94x | 465 MB |
| `synthetic-256-ssr-esm` | 10 | 1.96s | 2.06s | +5.0% | 2.06s | 2.23s | 0.95x | 427 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.32s | 2.54s | +9.4% | 2.54s | 2.68s | 0.91x | 476 MB |
| `synthetic-48-ssr-esm` | 10 | 1.31s | 1.37s | +5.1% | 1.40s | 1.61s | 0.95x | 325 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 12.81s | 17.96s | +40.1% | 7.83s | 9.33s | 1.84s | 1.81s | 1.65s | 1.75s | +6.2% | 18.07s | 18.39s | 0.71x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.30s | 7.14s | +66.0% | 3.04s | 3.61s | 0.56s | 0.54s | 0.48s | 0.51s | +6.1% | 7.11s | 7.15s | 0.60x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.33s | 7.07s | +63.2% | 3.08s | 3.62s | 0.52s | 0.54s | 0.48s | 0.51s | +5.8% | 7.13s | 7.41s | 0.61x | - |
| `synthetic-256-sourcemaps` | 10 | 1.88s | 2.83s | +50.2% | 1.39s | 1.63s | 0.24s | 0.23s | 0.15s | 0.13s | -16.2% | 2.81s | 2.90s | 0.67x | - |
| `synthetic-256-ssr-esm` | 10 | 1.66s | 2.25s | +35.9% | 1.19s | 1.35s | 0.22s | 0.23s | 0.15s | 0.13s | -15.7% | 2.23s | 2.31s | 0.74x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.64s | 2.27s | +38.1% | 1.18s | 1.38s | 0.22s | 0.23s | 0.15s | 0.13s | -17.2% | 2.26s | 2.35s | 0.72x | - |
| `synthetic-48-ssr-esm` | 10 | 0.86s | 1.01s | +17.8% | 0.62s | 0.65s | 0.12s | 0.13s | 0.05s | 0.05s | +0.4% | 1.02s | 1.04s | 0.85x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1700.9ms | 1560.1ms | -8.3% | 1560.1ms | 13.8ms | 10 |
| node | `route:module` | 1785 | 908.6ms | 768.3ms | -15.4% | 768.3ms | 6.5ms | 10 |
| web | `route:client-entry` | 1785 | 367.7ms | 476.8ms | +29.7% | 476.8ms | 9.9ms | 10 |
| node | `manifest:transform` | 5 | 114.7ms | 106.3ms | -7.3% | 106.3ms | 26.1ms | 5 |
| web | `manifest:stage` | 15 | 18.5ms | 20.5ms | +10.8% | 20.5ms | 2.0ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 132.3ms | - | 132.3ms | 13.7ms | 10 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 1996.4ms | 1806.7ms | -9.5% | 1806.7ms | 6.8ms | 10 |
| node | `route:module` | 5130 | 892.2ms | 946.0ms | +6.0% | 946.0ms | 13.4ms | 10 |
| web | `route:client-entry` | 5130 | 637.5ms | 585.6ms | -8.1% | 585.6ms | 8.4ms | 10 |
| node | `manifest:transform` | 5 | 203.4ms | 192.5ms | -5.4% | 192.5ms | 39.7ms | 5 |
| node | `module:client-only-stub` | 5 | 78.1ms | 153.3ms | +96.3% | 153.3ms | 49.2ms | 5 |
| web | `manifest:stage` | 15 | 60.1ms | 61.6ms | +2.5% | 61.6ms | 7.2ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.2ms | - | 2.2ms | 0.4ms | 10 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 1959.4ms | 1832.7ms | -6.5% | 1832.7ms | 9.9ms | 10 |
| node | `route:module` | 5130 | 940.9ms | 902.7ms | -4.1% | 902.7ms | 7.0ms | 10 |
| web | `route:client-entry` | 5130 | 592.1ms | 602.5ms | +1.8% | 602.5ms | 8.4ms | 10 |
| node | `manifest:transform` | 5 | 194.2ms | 206.6ms | +6.4% | 206.6ms | 44.9ms | 5 |
| node | `module:client-only-stub` | 5 | 108.3ms | 158.1ms | +46.0% | 158.1ms | 50.0ms | 5 |
| web | `manifest:stage` | 16 | 66.5ms | 69.6ms | +4.7% | 69.6ms | 7.2ms | 16 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 11 | - | 2.7ms | - | 2.7ms | 0.5ms | 11 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1357.2ms | 1304.6ms | -3.9% | 1304.6ms | 16.8ms | 21 |
| node | `route:module` | 2580 | 577.7ms | 621.5ms | +7.6% | 621.5ms | 12.0ms | 20 |
| web | `route:client-entry` | 2581 | 395.0ms | 387.9ms | -1.8% | 387.9ms | 6.0ms | 21 |
| node | `module:client-only-stub` | 10 | 159.2ms | 31.4ms | -80.3% | 31.4ms | 6.9ms | 10 |
| node | `manifest:transform` | 10 | 152.4ms | 153.2ms | +0.5% | 153.2ms | 24.6ms | 10 |
| web | `manifest:stage` | 32 | 21.7ms | 30.1ms | +38.7% | 30.1ms | 3.5ms | 32 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 22 | - | 5.9ms | - | 5.9ms | 0.4ms | 22 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2584 | 1334.6ms | 1253.8ms | -6.1% | 1253.8ms | 13.9ms | 24 |
| node | `route:module` | 2580 | 538.2ms | 569.4ms | +5.8% | 569.4ms | 10.1ms | 20 |
| web | `route:client-entry` | 2584 | 385.7ms | 395.1ms | +2.4% | 395.1ms | 6.2ms | 24 |
| node | `module:client-only-stub` | 10 | 174.8ms | 39.2ms | -77.6% | 39.2ms | 13.1ms | 10 |
| node | `manifest:transform` | 10 | 158.9ms | 189.9ms | +19.5% | 189.9ms | 24.6ms | 10 |
| web | `manifest:stage` | 34 | 21.2ms | 30.5ms | +43.9% | 30.5ms | 1.4ms | 34 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 24 | - | 4.9ms | - | 4.9ms | 0.4ms | 24 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1298.4ms | 1249.3ms | -3.8% | 1249.3ms | 13.4ms | 21 |
| node | `route:module` | 2580 | 547.3ms | 575.5ms | +5.2% | 575.5ms | 9.6ms | 20 |
| web | `route:client-entry` | 2581 | 380.4ms | 388.6ms | +2.2% | 388.6ms | 7.3ms | 21 |
| node | `module:client-only-stub` | 10 | 312.3ms | 41.0ms | -86.9% | 41.0ms | 9.5ms | 10 |
| node | `manifest:transform` | 10 | 162.2ms | 175.7ms | +8.3% | 175.7ms | 22.2ms | 10 |
| web | `manifest:stage` | 31 | 20.8ms | 28.1ms | +35.1% | 28.1ms | 1.4ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 4.5ms | - | 4.5ms | 0.4ms | 21 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 483.5ms | 364.2ms | -24.7% | 364.2ms | 8.8ms | 20 |
| node | `route:module` | 500 | 166.6ms | 140.3ms | -15.8% | 140.3ms | 0.8ms | 20 |
| web | `route:client-entry` | 500 | 112.7ms | 88.1ms | -21.8% | 88.1ms | 4.6ms | 20 |
| node | `module:client-only-stub` | 10 | 78.4ms | 78.8ms | +0.5% | 78.8ms | 12.8ms | 10 |
| node | `manifest:transform` | 10 | 50.8ms | 41.6ms | -18.1% | 41.6ms | 5.7ms | 10 |
| web | `manifest:stage` | 30 | 5.4ms | 8.7ms | +61.1% | 8.7ms | 0.4ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 4.4ms | - | 4.4ms | 0.4ms | 20 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 109.41s | 118.55s | +8.4% | 118.55s | - | 0.92x | - |
| complex app | 2 | 76.18s | 93.38s | +22.6% | 93.38s | - | 0.82x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 92.22s | 107.17s | +16.2% | 83.20s | 94.75s | 2.66s | 2.88s | 3.09s | 3.38s | +9.5% | 107.17s | - | 0.86x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29063874900)

