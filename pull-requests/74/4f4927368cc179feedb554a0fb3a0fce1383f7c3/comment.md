<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `4f49273` against base `96ed301`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 27.49s | 35.97s | +30.8% | 18.33s | 20.92s | +14.1% | 3.71s | 3.54s | -4.6% | 3.11s | 2.61s | -16.2% | 0.76x |
| Large app | 1 | 12.81s | 17.75s | +38.6% | 7.83s | 9.29s | +18.6% | 1.84s | 1.76s | -4.2% | 1.65s | 1.62s | -1.7% | 0.72x |
| Standard fixtures | 6 | 14.68s | 18.22s | +24.1% | 10.50s | 11.63s | +10.8% | 1.87s | 1.78s | -5.0% | 1.46s | 0.99s | -32.4% | 0.81x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.32s | 9.23s | +10.9% | 9.25s | 9.33s | 0.90x | 1614 MB |
| `synthetic-1024-ssr-esm` | 5 | 3.85s | 3.90s | +1.2% | 3.94s | 4.10s | 0.99x | 661 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.17s | 5.62s | +8.8% | 5.68s | 5.85s | 0.92x | 859 MB |
| `synthetic-256-sourcemaps` | 10 | 2.08s | 2.11s | +1.5% | 2.12s | 2.26s | 0.98x | 460 MB |
| `synthetic-256-ssr-esm` | 10 | 1.96s | 1.98s | +1.0% | 1.99s | 2.14s | 0.99x | 442 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.32s | 2.46s | +6.1% | 2.47s | 2.64s | 0.94x | 490 MB |
| `synthetic-48-ssr-esm` | 10 | 1.31s | 1.30s | -0.2% | 1.32s | 1.53s | 1.00x | 319 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 12.81s | 17.75s | +38.6% | 7.83s | 9.29s | 1.84s | 1.76s | 1.65s | 1.62s | -1.7% | 17.75s | 17.98s | 0.72x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.30s | 5.50s | +27.9% | 3.04s | 3.44s | 0.56s | 0.51s | 0.48s | 0.30s | -36.4% | 5.50s | 5.54s | 0.78x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.33s | 5.48s | +26.3% | 3.08s | 3.45s | 0.52s | 0.50s | 0.48s | 0.30s | -36.7% | 5.48s | 5.58s | 0.79x | - |
| `synthetic-256-sourcemaps` | 10 | 1.88s | 2.39s | +27.0% | 1.39s | 1.54s | 0.24s | 0.22s | 0.15s | 0.13s | -16.8% | 2.38s | 2.45s | 0.79x | - |
| `synthetic-256-ssr-esm` | 10 | 1.66s | 1.96s | +18.4% | 1.19s | 1.30s | 0.22s | 0.22s | 0.15s | 0.10s | -32.7% | 1.96s | 2.00s | 0.84x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.64s | 1.94s | +18.5% | 1.18s | 1.27s | 0.22s | 0.21s | 0.15s | 0.10s | -33.1% | 1.95s | 2.02s | 0.84x | - |
| `synthetic-48-ssr-esm` | 10 | 0.86s | 0.94s | +9.4% | 0.62s | 0.63s | 0.12s | 0.12s | 0.05s | 0.05s | -0.3% | 0.94s | 0.96s | 0.91x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1700.9ms | 1564.6ms | -8.0% | 1564.6ms | 12.2ms | 10 |
| node | `route:module` | 1785 | 908.6ms | 769.5ms | -15.3% | 769.5ms | 5.5ms | 10 |
| web | `route:client-entry` | 1785 | 367.7ms | 454.7ms | +23.7% | 454.7ms | 9.7ms | 10 |
| node | `manifest:transform` | 5 | 114.7ms | 110.1ms | -4.0% | 110.1ms | 25.1ms | 5 |
| web | `manifest:stage` | 15 | 18.5ms | 19.7ms | +6.5% | 19.7ms | 2.0ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 136.7ms | - | 136.7ms | 15.5ms | 10 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 1996.4ms | 1808.4ms | -9.4% | 1808.4ms | 14.7ms | 10 |
| node | `route:module` | 5130 | 892.2ms | 945.6ms | +6.0% | 945.6ms | 17.9ms | 10 |
| web | `route:client-entry` | 5130 | 637.5ms | 567.0ms | -11.1% | 567.0ms | 9.2ms | 10 |
| node | `manifest:transform` | 5 | 203.4ms | 216.4ms | +6.4% | 216.4ms | 78.4ms | 5 |
| node | `module:client-only-stub` | 5 | 78.1ms | 160.1ms | +105.0% | 160.1ms | 50.0ms | 5 |
| web | `manifest:stage` | 15 | 60.1ms | 59.8ms | -0.5% | 59.8ms | 7.2ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.2ms | - | 2.2ms | 0.4ms | 10 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 1959.4ms | 1798.5ms | -8.2% | 1798.5ms | 17.1ms | 10 |
| node | `route:module` | 5130 | 940.9ms | 919.6ms | -2.3% | 919.6ms | 17.9ms | 10 |
| web | `route:client-entry` | 5130 | 592.1ms | 536.8ms | -9.3% | 536.8ms | 6.2ms | 10 |
| node | `manifest:transform` | 5 | 194.2ms | 192.2ms | -1.0% | 192.2ms | 44.8ms | 5 |
| node | `module:client-only-stub` | 5 | 108.3ms | 88.7ms | -18.1% | 88.7ms | 51.3ms | 5 |
| web | `manifest:stage` | 15 | 66.5ms | 60.0ms | -9.8% | 60.0ms | 7.2ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.3ms | - | 2.3ms | 0.4ms | 10 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1357.2ms | 1249.5ms | -7.9% | 1249.5ms | 12.0ms | 20 |
| node | `route:module` | 2580 | 577.7ms | 615.3ms | +6.5% | 615.3ms | 7.8ms | 20 |
| web | `route:client-entry` | 2580 | 395.0ms | 353.2ms | -10.6% | 353.2ms | 6.0ms | 20 |
| node | `module:client-only-stub` | 10 | 159.2ms | 24.3ms | -84.7% | 24.3ms | 3.4ms | 10 |
| node | `manifest:transform` | 10 | 152.4ms | 143.1ms | -6.1% | 143.1ms | 20.2ms | 10 |
| web | `manifest:stage` | 32 | 21.7ms | 26.8ms | +23.5% | 26.8ms | 1.4ms | 32 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 22 | - | 4.6ms | - | 4.6ms | 0.4ms | 22 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2583 | 1334.6ms | 1192.6ms | -10.6% | 1192.6ms | 12.1ms | 23 |
| node | `route:module` | 2580 | 538.2ms | 582.4ms | +8.2% | 582.4ms | 8.2ms | 20 |
| web | `route:client-entry` | 2583 | 385.7ms | 369.7ms | -4.1% | 369.7ms | 5.4ms | 23 |
| node | `module:client-only-stub` | 10 | 174.8ms | 27.5ms | -84.3% | 27.5ms | 4.8ms | 10 |
| node | `manifest:transform` | 10 | 158.9ms | 165.4ms | +4.1% | 165.4ms | 26.9ms | 10 |
| web | `manifest:stage` | 34 | 21.2ms | 30.5ms | +43.9% | 30.5ms | 3.1ms | 34 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 24 | - | 4.4ms | - | 4.4ms | 0.3ms | 24 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1298.4ms | 1185.6ms | -8.7% | 1185.6ms | 9.6ms | 21 |
| node | `route:module` | 2580 | 547.3ms | 559.7ms | +2.3% | 559.7ms | 7.9ms | 20 |
| web | `route:client-entry` | 2581 | 380.4ms | 368.6ms | -3.1% | 368.6ms | 5.5ms | 21 |
| node | `module:client-only-stub` | 10 | 312.3ms | 32.9ms | -89.5% | 32.9ms | 5.8ms | 10 |
| node | `manifest:transform` | 10 | 162.2ms | 167.2ms | +3.1% | 167.2ms | 21.2ms | 10 |
| web | `manifest:stage` | 31 | 20.8ms | 26.3ms | +26.4% | 26.3ms | 1.4ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 4.1ms | - | 4.1ms | 0.3ms | 21 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 501 | 483.5ms | 346.5ms | -28.3% | 346.5ms | 7.5ms | 21 |
| node | `route:module` | 500 | 166.6ms | 132.0ms | -20.8% | 132.0ms | 0.5ms | 20 |
| web | `route:client-entry` | 501 | 112.7ms | 82.5ms | -26.8% | 82.5ms | 1.8ms | 21 |
| node | `module:client-only-stub` | 10 | 78.4ms | 85.9ms | +9.6% | 85.9ms | 13.7ms | 10 |
| node | `manifest:transform` | 10 | 50.8ms | 40.7ms | -19.9% | 40.7ms | 5.7ms | 10 |
| web | `manifest:stage` | 31 | 5.4ms | 8.3ms | +53.7% | 8.3ms | 0.4ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 4.3ms | - | 4.3ms | 0.4ms | 21 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 109.41s | 114.48s | +4.6% | 114.48s | - | 0.96x | - |
| complex app | 2 | 76.18s | 82.95s | +8.9% | 82.95s | - | 0.92x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 92.22s | 97.77s | +6.0% | 83.20s | 86.14s | 2.66s | 2.73s | 3.09s | 3.12s | +1.0% | 97.77s | - | 0.94x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29058054195)

