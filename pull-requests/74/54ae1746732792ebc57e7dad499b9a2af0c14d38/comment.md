<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `54ae174` against base `c93ec98`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 28.98s | 37.72s | +30.2% | 19.35s | 19.69s | +1.7% | 3.90s | 3.84s | -1.6% | 3.24s | 3.15s | -2.7% | 0.77x |
| Large app | 1 | 13.57s | 15.68s | +15.6% | 8.28s | 8.46s | +2.1% | 1.95s | 1.94s | -0.8% | 1.77s | 1.71s | -3.3% | 0.87x |
| Standard fixtures | 6 | 15.41s | 22.04s | +43.0% | 11.07s | 11.23s | +1.5% | 1.95s | 1.90s | -2.5% | 1.47s | 1.44s | -2.1% | 0.70x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.58s | 8.90s | +3.7% | 8.93s | 9.15s | 0.96x | 1520 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.16s | 4.01s | -3.6% | 3.97s | 4.17s | 1.04x | 624 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.62s | 5.45s | -3.0% | 5.52s | 5.68s | 1.03x | 812 MB |
| `synthetic-256-sourcemaps` | 10 | 2.15s | 2.12s | -1.6% | 2.12s | 2.31s | 1.02x | 437 MB |
| `synthetic-256-ssr-esm` | 10 | 2.00s | 1.98s | -1.3% | 2.00s | 2.17s | 1.01x | 407 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.41s | 2.39s | -0.8% | 2.40s | 2.57s | 1.01x | 446 MB |
| `synthetic-48-ssr-esm` | 10 | 1.35s | 1.34s | -0.7% | 1.37s | 1.65s | 1.01x | 324 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.57s | 15.68s | +15.6% | 8.28s | 8.46s | 1.95s | 1.94s | 1.77s | 1.71s | -3.3% | 15.66s | 15.75s | 0.87x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.51s | 6.96s | +54.2% | 3.21s | 3.33s | 0.53s | 0.54s | 0.51s | 0.51s | -0.4% | 6.96s | 7.02s | 0.65x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.55s | 6.82s | +50.1% | 3.25s | 3.25s | 0.58s | 0.54s | 0.48s | 0.50s | +5.0% | 6.83s | 6.88s | 0.67x | - |
| `synthetic-256-sourcemaps` | 10 | 1.97s | 2.86s | +45.3% | 1.47s | 1.51s | 0.25s | 0.23s | 0.15s | 0.13s | -16.2% | 2.79s | 2.92s | 0.69x | - |
| `synthetic-256-ssr-esm` | 10 | 1.74s | 2.19s | +25.5% | 1.26s | 1.25s | 0.24s | 0.23s | 0.13s | 0.13s | -1.8% | 2.17s | 2.25s | 0.80x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.75s | 2.22s | +26.5% | 1.24s | 1.26s | 0.23s | 0.23s | 0.15s | 0.13s | -17.2% | 2.21s | 2.24s | 0.79x | - |
| `synthetic-48-ssr-esm` | 10 | 0.89s | 1.00s | +11.8% | 0.64s | 0.63s | 0.12s | 0.13s | 0.05s | 0.05s | -0.3% | 1.00s | 1.05s | 0.89x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1697.7ms | 1891.1ms | +11.4% | 1891.1ms | 19.3ms | 10 |
| node | `route:module` | 1785 | 852.4ms | 959.4ms | +12.6% | 959.4ms | 13.4ms | 10 |
| web | `route:client-entry` | 1785 | 380.9ms | 456.8ms | +19.9% | 456.8ms | 9.4ms | 10 |
| node | `manifest:transform` | 5 | 109.0ms | 100.8ms | -7.5% | 100.8ms | 25.5ms | 5 |
| web | `manifest:stage` | 15 | 14.0ms | 18.9ms | +35.0% | 18.9ms | 1.8ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 137.8ms | - | 137.8ms | 14.5ms | 10 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2072.6ms | 2042.4ms | -1.5% | 2042.4ms | 14.0ms | 10 |
| node | `route:module` | 5130 | 942.6ms | 1005.1ms | +6.6% | 1005.1ms | 10.7ms | 10 |
| web | `route:client-entry` | 5130 | 637.7ms | 589.1ms | -7.6% | 589.1ms | 8.2ms | 10 |
| node | `module:client-only-stub` | 5 | 273.0ms | 376.3ms | +37.8% | 376.3ms | 218.0ms | 5 |
| node | `manifest:transform` | 5 | 217.2ms | 200.7ms | -7.6% | 200.7ms | 42.6ms | 5 |
| web | `manifest:stage` | 15 | 61.3ms | 68.5ms | +11.7% | 68.5ms | 14.5ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.0ms | - | 2.0ms | 0.3ms | 10 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2048.7ms | 1989.4ms | -2.9% | 1989.4ms | 15.0ms | 10 |
| node | `route:module` | 5130 | 910.1ms | 993.9ms | +9.2% | 993.9ms | 13.0ms | 10 |
| web | `route:client-entry` | 5130 | 623.2ms | 579.7ms | -7.0% | 579.7ms | 6.4ms | 10 |
| node | `manifest:transform` | 5 | 205.0ms | 222.6ms | +8.6% | 222.6ms | 58.5ms | 5 |
| node | `module:client-only-stub` | 5 | 84.7ms | 695.2ms | +720.8% | 695.2ms | 258.1ms | 5 |
| web | `manifest:stage` | 15 | 52.2ms | 58.2ms | +11.5% | 58.2ms | 6.6ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.0ms | - | 2.0ms | 0.3ms | 10 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1360.0ms | 1394.5ms | +2.5% | 1394.5ms | 17.0ms | 22 |
| node | `route:module` | 2580 | 577.7ms | 676.4ms | +17.1% | 676.4ms | 7.4ms | 20 |
| web | `route:client-entry` | 2582 | 387.6ms | 371.9ms | -4.1% | 371.9ms | 5.5ms | 22 |
| node | `manifest:transform` | 10 | 148.2ms | 161.7ms | +9.1% | 161.7ms | 20.0ms | 10 |
| node | `module:client-only-stub` | 10 | 122.5ms | 135.8ms | +10.9% | 135.8ms | 58.7ms | 10 |
| web | `manifest:stage` | 33 | 19.9ms | 28.5ms | +43.2% | 28.5ms | 1.5ms | 33 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 24 | - | 5.6ms | - | 5.6ms | 0.4ms | 24 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2583 | 1309.6ms | 1368.7ms | +4.5% | 1368.7ms | 18.9ms | 23 |
| node | `route:module` | 2580 | 567.0ms | 588.9ms | +3.9% | 588.9ms | 9.5ms | 20 |
| web | `route:client-entry` | 2583 | 381.8ms | 385.8ms | +1.0% | 385.8ms | 6.2ms | 23 |
| node | `module:client-only-stub` | 10 | 209.9ms | 132.4ms | -36.9% | 132.4ms | 31.2ms | 10 |
| node | `manifest:transform` | 10 | 165.0ms | 145.2ms | -12.0% | 145.2ms | 20.6ms | 10 |
| web | `manifest:stage` | 33 | 20.9ms | 28.9ms | +38.3% | 28.9ms | 1.4ms | 33 |
| web | `manifest:transform` | 10 | 1.0ms | 1.1ms | +10.0% | 1.1ms | 0.2ms | 10 |
| node | `assets:relocate-ssr-only` | 23 | - | 4.4ms | - | 4.4ms | 0.3ms | 23 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1301.6ms | 1349.4ms | +3.7% | 1349.4ms | 17.4ms | 20 |
| node | `route:module` | 2580 | 536.0ms | 619.7ms | +15.6% | 619.7ms | 7.4ms | 20 |
| web | `route:client-entry` | 2580 | 376.6ms | 373.1ms | -0.9% | 373.1ms | 6.5ms | 20 |
| node | `module:client-only-stub` | 10 | 203.2ms | 55.5ms | -72.7% | 55.5ms | 15.0ms | 10 |
| node | `manifest:transform` | 10 | 159.4ms | 162.2ms | +1.8% | 162.2ms | 22.6ms | 10 |
| web | `manifest:stage` | 30 | 22.4ms | 26.4ms | +17.9% | 26.4ms | 1.4ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 4.0ms | - | 4.0ms | 0.3ms | 20 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 512.4ms | 446.8ms | -12.8% | 446.8ms | 11.5ms | 20 |
| node | `route:module` | 500 | 175.5ms | 143.8ms | -18.1% | 143.8ms | 1.0ms | 20 |
| web | `route:client-entry` | 500 | 102.2ms | 96.1ms | -6.0% | 96.1ms | 4.7ms | 20 |
| node | `module:client-only-stub` | 10 | 69.3ms | 70.3ms | +1.4% | 70.3ms | 12.7ms | 10 |
| node | `manifest:transform` | 10 | 52.5ms | 45.5ms | -13.3% | 45.5ms | 5.9ms | 10 |
| web | `manifest:stage` | 30 | 5.2ms | 7.8ms | +50.0% | 7.8ms | 0.4ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 4.0ms | - | 4.0ms | 0.3ms | 20 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 112.74s | 129.59s | +14.9% | 129.59s | - | 0.87x | - |
| complex app | 2 | 78.16s | 94.10s | +20.4% | 94.10s | - | 0.83x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 95.50s | 112.31s | +17.6% | 86.76s | 98.83s | 2.87s | 3.19s | 3.34s | 3.60s | +7.9% | 112.31s | - | 0.85x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28825400337)

