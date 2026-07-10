<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `52b25cb` against base `96ed301`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 27.49s | 42.44s | +54.4% | 18.33s | 23.02s | +25.6% | 3.71s | 3.73s | +0.5% | 3.11s | 3.13s | +0.7% | 0.65x |
| Large app | 1 | 12.81s | 19.17s | +49.6% | 7.83s | 10.28s | +31.3% | 1.84s | 1.89s | +2.6% | 1.65s | 1.72s | +4.4% | 0.67x |
| Standard fixtures | 6 | 14.68s | 23.28s | +58.6% | 10.50s | 12.73s | +21.3% | 1.87s | 1.84s | -1.7% | 1.46s | 1.41s | -3.5% | 0.63x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.32s | 10.07s | +21.0% | 10.10s | 10.21s | 0.83x | 1594 MB |
| `synthetic-1024-ssr-esm` | 5 | 3.85s | 4.17s | +8.4% | 4.26s | 4.56s | 0.92x | 643 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.17s | 6.18s | +19.6% | 6.21s | 6.40s | 0.84x | 860 MB |
| `synthetic-256-sourcemaps` | 10 | 2.08s | 2.22s | +6.6% | 2.23s | 2.37s | 0.94x | 464 MB |
| `synthetic-256-ssr-esm` | 10 | 1.96s | 2.10s | +7.1% | 2.10s | 2.26s | 0.93x | 425 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.32s | 2.59s | +11.8% | 2.61s | 2.78s | 0.89x | 488 MB |
| `synthetic-48-ssr-esm` | 10 | 1.31s | 1.35s | +3.3% | 1.38s | 1.65s | 0.97x | 323 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 12.81s | 19.17s | +49.6% | 7.83s | 10.28s | 1.84s | 1.89s | 1.65s | 1.72s | +4.4% | 19.13s | 19.24s | 0.67x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.30s | 7.35s | +70.8% | 3.04s | 3.81s | 0.56s | 0.52s | 0.48s | 0.50s | +5.4% | 7.35s | 7.46s | 0.59x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.33s | 7.35s | +69.6% | 3.08s | 3.82s | 0.52s | 0.53s | 0.48s | 0.50s | +5.3% | 7.34s | 7.39s | 0.59x | - |
| `synthetic-256-sourcemaps` | 10 | 1.88s | 2.92s | +55.2% | 1.39s | 1.64s | 0.24s | 0.22s | 0.15s | 0.13s | -16.8% | 2.92s | 2.97s | 0.64x | - |
| `synthetic-256-ssr-esm` | 10 | 1.66s | 2.31s | +39.5% | 1.19s | 1.41s | 0.22s | 0.22s | 0.15s | 0.13s | -17.3% | 2.30s | 2.41s | 0.72x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.64s | 2.33s | +42.0% | 1.18s | 1.41s | 0.22s | 0.22s | 0.15s | 0.10s | -32.7% | 2.32s | 2.36s | 0.70x | - |
| `synthetic-48-ssr-esm` | 10 | 0.86s | 1.01s | +17.3% | 0.62s | 0.65s | 0.12s | 0.13s | 0.05s | 0.05s | -0.1% | 1.01s | 1.02s | 0.85x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1700.9ms | 1537.7ms | -9.6% | 1537.7ms | 13.1ms | 10 |
| node | `route:module` | 1785 | 908.6ms | 760.2ms | -16.3% | 760.2ms | 12.9ms | 10 |
| web | `route:client-entry` | 1785 | 367.7ms | 450.9ms | +22.6% | 450.9ms | 9.3ms | 10 |
| node | `manifest:transform` | 5 | 114.7ms | 94.6ms | -17.5% | 94.6ms | 25.1ms | 5 |
| web | `manifest:stage` | 15 | 18.5ms | 19.3ms | +4.3% | 19.3ms | 1.9ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 138.1ms | - | 138.1ms | 15.4ms | 10 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 1996.4ms | 1763.1ms | -11.7% | 1763.1ms | 8.0ms | 10 |
| node | `route:module` | 5130 | 892.2ms | 904.2ms | +1.3% | 904.2ms | 6.6ms | 10 |
| web | `route:client-entry` | 5130 | 637.5ms | 613.3ms | -3.8% | 613.3ms | 8.6ms | 10 |
| node | `manifest:transform` | 5 | 203.4ms | 202.0ms | -0.7% | 202.0ms | 46.4ms | 5 |
| node | `module:client-only-stub` | 5 | 78.1ms | 273.2ms | +249.8% | 273.2ms | 65.6ms | 5 |
| web | `manifest:stage` | 15 | 60.1ms | 57.4ms | -4.5% | 57.4ms | 6.4ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.4ms | - | 2.4ms | 0.4ms | 10 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 1959.4ms | 1803.4ms | -8.0% | 1803.4ms | 7.8ms | 10 |
| node | `route:module` | 5130 | 940.9ms | 897.0ms | -4.7% | 897.0ms | 8.2ms | 10 |
| web | `route:client-entry` | 5130 | 592.1ms | 611.4ms | +3.3% | 611.4ms | 6.8ms | 10 |
| node | `manifest:transform` | 5 | 194.2ms | 201.0ms | +3.5% | 201.0ms | 44.4ms | 5 |
| node | `module:client-only-stub` | 5 | 108.3ms | 203.6ms | +88.0% | 203.6ms | 54.9ms | 5 |
| web | `manifest:stage` | 15 | 66.5ms | 57.3ms | -13.8% | 57.3ms | 6.4ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.1ms | - | 2.1ms | 0.4ms | 10 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1357.2ms | 1316.9ms | -3.0% | 1316.9ms | 18.3ms | 20 |
| node | `route:module` | 2580 | 577.7ms | 622.9ms | +7.8% | 622.9ms | 8.3ms | 20 |
| web | `route:client-entry` | 2580 | 395.0ms | 380.5ms | -3.7% | 380.5ms | 5.6ms | 20 |
| node | `module:client-only-stub` | 10 | 159.2ms | 35.5ms | -77.7% | 35.5ms | 15.1ms | 10 |
| node | `manifest:transform` | 10 | 152.4ms | 150.2ms | -1.4% | 150.2ms | 19.9ms | 10 |
| web | `manifest:stage` | 31 | 21.7ms | 26.4ms | +21.7% | 26.4ms | 1.5ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 5.6ms | - | 5.6ms | 0.5ms | 21 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1334.6ms | 1237.3ms | -7.3% | 1237.3ms | 14.7ms | 21 |
| node | `route:module` | 2580 | 538.2ms | 575.3ms | +6.9% | 575.3ms | 7.3ms | 20 |
| web | `route:client-entry` | 2581 | 385.7ms | 382.5ms | -0.8% | 382.5ms | 5.8ms | 21 |
| node | `module:client-only-stub` | 10 | 174.8ms | 21.0ms | -88.0% | 21.0ms | 3.1ms | 10 |
| node | `manifest:transform` | 10 | 158.9ms | 184.0ms | +15.8% | 184.0ms | 22.8ms | 10 |
| web | `manifest:stage` | 31 | 21.2ms | 25.9ms | +22.2% | 25.9ms | 1.3ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 4.2ms | - | 4.2ms | 0.4ms | 21 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1298.4ms | 1219.1ms | -6.1% | 1219.1ms | 13.9ms | 21 |
| node | `route:module` | 2580 | 547.3ms | 578.6ms | +5.7% | 578.6ms | 5.1ms | 20 |
| web | `route:client-entry` | 2581 | 380.4ms | 398.0ms | +4.6% | 398.0ms | 5.7ms | 21 |
| node | `module:client-only-stub` | 10 | 312.3ms | 25.6ms | -91.8% | 25.6ms | 6.4ms | 10 |
| node | `manifest:transform` | 10 | 162.2ms | 179.1ms | +10.4% | 179.1ms | 23.3ms | 10 |
| web | `manifest:stage` | 31 | 20.8ms | 28.8ms | +38.5% | 28.8ms | 3.8ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 4.3ms | - | 4.3ms | 0.4ms | 21 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 483.5ms | 366.4ms | -24.2% | 366.4ms | 8.9ms | 20 |
| node | `route:module` | 500 | 166.6ms | 130.3ms | -21.8% | 130.3ms | 0.5ms | 20 |
| web | `route:client-entry` | 500 | 112.7ms | 86.9ms | -22.9% | 86.9ms | 2.0ms | 20 |
| node | `module:client-only-stub` | 10 | 78.4ms | 71.8ms | -8.4% | 71.8ms | 11.3ms | 10 |
| node | `manifest:transform` | 10 | 50.8ms | 45.9ms | -9.6% | 45.9ms | 6.0ms | 10 |
| web | `manifest:stage` | 30 | 5.4ms | 7.7ms | +42.6% | 7.7ms | 0.4ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 4.1ms | - | 4.1ms | 0.4ms | 20 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 109.41s | 116.39s | +6.4% | 116.39s | - | 0.94x | - |
| complex app | 2 | 76.18s | 85.59s | +12.3% | 85.59s | - | 0.89x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 92.22s | 101.55s | +10.1% | 83.20s | 89.37s | 2.66s | 2.93s | 3.09s | 3.28s | +6.1% | 101.55s | - | 0.91x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29061424976)

