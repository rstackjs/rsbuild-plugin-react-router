<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `b072c88` against base `96ed301`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 27.49s | 44.75s | +62.8% | 18.33s | 24.29s | +32.6% | 3.71s | 3.98s | +7.3% | 3.11s | 3.39s | +8.9% | 0.61x |
| Large app | 1 | 12.81s | 20.21s | +57.8% | 7.83s | 10.89s | +39.0% | 1.84s | 2.02s | +10.1% | 1.65s | 1.90s | +15.2% | 0.63x |
| Standard fixtures | 6 | 14.68s | 24.53s | +67.1% | 10.50s | 13.41s | +27.7% | 1.87s | 1.96s | +4.4% | 1.46s | 1.49s | +1.9% | 0.60x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.32s | 10.69s | +28.5% | 10.69s | 10.99s | 0.78x | 1600 MB |
| `synthetic-1024-ssr-esm` | 5 | 3.85s | 4.40s | +14.4% | 4.44s | 4.70s | 0.87x | 656 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.17s | 6.43s | +24.3% | 6.51s | 6.81s | 0.80x | 835 MB |
| `synthetic-256-sourcemaps` | 10 | 2.08s | 2.31s | +11.0% | 2.32s | 2.46s | 0.90x | 464 MB |
| `synthetic-256-ssr-esm` | 10 | 1.96s | 2.15s | +9.6% | 2.17s | 2.33s | 0.91x | 442 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.32s | 2.72s | +17.0% | 2.73s | 2.90s | 0.85x | 490 MB |
| `synthetic-48-ssr-esm` | 10 | 1.31s | 1.38s | +5.5% | 1.40s | 1.66s | 0.95x | 322 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 12.81s | 20.21s | +57.8% | 7.83s | 10.89s | 1.84s | 2.02s | 1.65s | 1.90s | +15.2% | 20.24s | 20.45s | 0.63x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.30s | 7.68s | +78.4% | 3.04s | 4.03s | 0.56s | 0.57s | 0.48s | 0.53s | +10.4% | 7.70s | 7.83s | 0.56x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.33s | 7.70s | +77.6% | 3.08s | 4.00s | 0.52s | 0.54s | 0.48s | 0.53s | +11.0% | 7.70s | 7.83s | 0.56x | - |
| `synthetic-256-sourcemaps` | 10 | 1.88s | 3.08s | +63.4% | 1.39s | 1.71s | 0.24s | 0.23s | 0.15s | 0.13s | -15.9% | 3.05s | 3.14s | 0.61x | - |
| `synthetic-256-ssr-esm` | 10 | 1.66s | 2.53s | +52.8% | 1.19s | 1.50s | 0.22s | 0.25s | 0.15s | 0.13s | -16.2% | 2.50s | 2.55s | 0.65x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.64s | 2.44s | +48.9% | 1.18s | 1.47s | 0.22s | 0.23s | 0.15s | 0.13s | -16.5% | 2.43s | 2.54s | 0.67x | - |
| `synthetic-48-ssr-esm` | 10 | 0.86s | 1.11s | +28.3% | 0.62s | 0.70s | 0.12s | 0.14s | 0.05s | 0.05s | +0.1% | 1.10s | 1.13s | 0.78x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1700.9ms | 1522.1ms | -10.5% | 1522.1ms | 13.3ms | 10 |
| node | `route:module` | 1785 | 908.6ms | 771.4ms | -15.1% | 771.4ms | 8.0ms | 10 |
| web | `route:client-entry` | 1785 | 367.7ms | 452.0ms | +22.9% | 452.0ms | 10.0ms | 10 |
| node | `manifest:transform` | 5 | 114.7ms | 125.8ms | +9.7% | 125.8ms | 37.5ms | 5 |
| web | `manifest:stage` | 15 | 18.5ms | 20.7ms | +11.9% | 20.7ms | 2.1ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 141.1ms | - | 141.1ms | 14.8ms | 10 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 1996.4ms | 1851.2ms | -7.3% | 1851.2ms | 9.2ms | 10 |
| node | `route:module` | 5130 | 892.2ms | 931.4ms | +4.4% | 931.4ms | 16.0ms | 10 |
| web | `route:client-entry` | 5130 | 637.5ms | 632.9ms | -0.7% | 632.9ms | 9.1ms | 10 |
| node | `manifest:transform` | 5 | 203.4ms | 214.1ms | +5.3% | 214.1ms | 51.5ms | 5 |
| node | `module:client-only-stub` | 5 | 78.1ms | 85.8ms | +9.9% | 85.8ms | 33.0ms | 5 |
| web | `manifest:stage` | 15 | 60.1ms | 58.4ms | -2.8% | 58.4ms | 6.6ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.2ms | - | 2.2ms | 0.4ms | 10 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 1959.4ms | 1801.4ms | -8.1% | 1801.4ms | 11.1ms | 10 |
| node | `route:module` | 5130 | 940.9ms | 915.2ms | -2.7% | 915.2ms | 10.8ms | 10 |
| web | `route:client-entry` | 5130 | 592.1ms | 627.5ms | +6.0% | 627.5ms | 7.6ms | 10 |
| node | `manifest:transform` | 5 | 194.2ms | 195.0ms | +0.4% | 195.0ms | 41.8ms | 5 |
| node | `module:client-only-stub` | 5 | 108.3ms | 189.7ms | +75.2% | 189.7ms | 69.2ms | 5 |
| web | `manifest:stage` | 15 | 66.5ms | 60.4ms | -9.2% | 60.4ms | 8.6ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.1ms | - | 2.1ms | 0.4ms | 10 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1357.2ms | 1305.2ms | -3.8% | 1305.2ms | 12.8ms | 21 |
| node | `route:module` | 2580 | 577.7ms | 630.6ms | +9.2% | 630.6ms | 7.7ms | 20 |
| web | `route:client-entry` | 2581 | 395.0ms | 373.8ms | -5.4% | 373.8ms | 6.1ms | 21 |
| node | `module:client-only-stub` | 10 | 159.2ms | 24.7ms | -84.5% | 24.7ms | 3.7ms | 10 |
| node | `manifest:transform` | 10 | 152.4ms | 149.3ms | -2.0% | 149.3ms | 22.0ms | 10 |
| web | `manifest:stage` | 31 | 21.7ms | 26.0ms | +19.8% | 26.0ms | 1.3ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 6.0ms | - | 6.0ms | 0.5ms | 21 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1334.6ms | 1288.0ms | -3.5% | 1288.0ms | 15.0ms | 21 |
| node | `route:module` | 2580 | 538.2ms | 616.6ms | +14.6% | 616.6ms | 8.9ms | 20 |
| web | `route:client-entry` | 2581 | 385.7ms | 393.6ms | +2.0% | 393.6ms | 5.6ms | 21 |
| node | `module:client-only-stub` | 10 | 174.8ms | 30.9ms | -82.3% | 30.9ms | 9.3ms | 10 |
| node | `manifest:transform` | 10 | 158.9ms | 173.9ms | +9.4% | 173.9ms | 30.7ms | 10 |
| web | `manifest:stage` | 31 | 21.2ms | 30.9ms | +45.8% | 30.9ms | 3.9ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 4.7ms | - | 4.7ms | 0.4ms | 21 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1298.4ms | 1280.9ms | -1.3% | 1280.9ms | 11.0ms | 22 |
| node | `route:module` | 2580 | 547.3ms | 609.6ms | +11.4% | 609.6ms | 8.6ms | 20 |
| web | `route:client-entry` | 2582 | 380.4ms | 366.9ms | -3.5% | 366.9ms | 5.4ms | 22 |
| node | `module:client-only-stub` | 10 | 312.3ms | 28.8ms | -90.8% | 28.8ms | 6.0ms | 10 |
| node | `manifest:transform` | 10 | 162.2ms | 174.9ms | +7.8% | 174.9ms | 21.4ms | 10 |
| web | `manifest:stage` | 32 | 20.8ms | 27.6ms | +32.7% | 27.6ms | 1.4ms | 32 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 22 | - | 4.7ms | - | 4.7ms | 0.4ms | 22 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 483.5ms | 387.9ms | -19.8% | 387.9ms | 9.2ms | 20 |
| node | `route:module` | 500 | 166.6ms | 152.6ms | -8.4% | 152.6ms | 1.1ms | 20 |
| web | `route:client-entry` | 500 | 112.7ms | 86.2ms | -23.5% | 86.2ms | 0.9ms | 20 |
| node | `module:client-only-stub` | 10 | 78.4ms | 92.0ms | +17.3% | 92.0ms | 13.5ms | 10 |
| node | `manifest:transform` | 10 | 50.8ms | 52.2ms | +2.8% | 52.2ms | 6.4ms | 10 |
| web | `manifest:stage` | 30 | 5.4ms | 8.1ms | +50.0% | 8.1ms | 0.6ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 5.1ms | - | 5.1ms | 0.4ms | 20 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 109.41s | 123.33s | +12.7% | 123.33s | - | 0.89x | - |
| complex app | 2 | 76.18s | 92.50s | +21.4% | 92.50s | - | 0.82x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 92.22s | 109.36s | +18.6% | 83.20s | 94.88s | 2.66s | 3.22s | 3.09s | 3.54s | +14.5% | 109.36s | - | 0.84x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29060047333)

