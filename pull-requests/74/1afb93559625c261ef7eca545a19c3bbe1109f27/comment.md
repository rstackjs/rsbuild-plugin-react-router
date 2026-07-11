<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `1afb935` against base `b2edd38`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 31.38s | 33.05s | +5.3% | 19.17s | 21.54s | +12.4% | 3.96s | 3.71s | -6.3% | 2.94s | 2.68s | -8.8% | 0.95x |
| Large app | 1 | 15.38s | 16.68s | +8.4% | 8.15s | 9.56s | +17.3% | 1.92s | 1.81s | -5.6% | 1.75s | 1.70s | -3.0% | 0.92x |
| Standard fixtures | 6 | 16.00s | 16.37s | +2.3% | 11.02s | 11.98s | +8.7% | 2.04s | 1.89s | -7.0% | 1.19s | 0.98s | -17.3% | 0.98x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 8.55s | 9.30s | +8.8% | 9.42s | 9.68s | 0.92x | 1612 MB |
| `synthetic-1024-ssr-esm` | 3 | 4.00s | 4.03s | +0.7% | 4.13s | 4.38s | 0.99x | 660 MB |
| `synthetic-1024-ssr-esm-split` | 3 | 5.38s | 5.80s | +7.7% | 5.84s | 6.04s | 0.93x | 873 MB |
| `synthetic-256-sourcemaps` | 3 | 2.32s | 2.33s | +0.7% | 2.38s | 2.49s | 0.99x | 467 MB |
| `synthetic-256-ssr-esm` | 3 | 2.19s | 2.20s | +0.6% | 2.24s | 2.33s | 0.99x | 440 MB |
| `synthetic-256-ssr-esm-split` | 3 | 2.59s | 2.72s | +5.1% | 2.81s | 3.00s | 0.95x | 485 MB |
| `synthetic-48-ssr-esm` | 3 | 1.52s | 1.42s | -6.9% | 1.50s | 1.69s | 1.07x | 322 MB |

### ci-small+ci-large Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `ci-small+ci-large` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 15.38s | 16.68s | +8.4% | 8.15s | 9.56s | 1.92s | 1.81s | 1.75s | 1.70s | -3.0% | 16.57s | 16.71s | 0.92x | - |
| `synthetic-1024-ssr-esm` | 3 | 4.48s | 4.73s | +5.5% | 3.06s | 3.45s | 0.58s | 0.53s | 0.33s | 0.30s | -8.1% | 4.73s | 4.73s | 0.95x | - |
| `synthetic-1024-ssr-esm-split` | 3 | 4.58s | 4.60s | +0.6% | 3.13s | 3.33s | 0.53s | 0.52s | 0.36s | 0.30s | -14.8% | 4.66s | 4.80s | 0.99x | - |
| `synthetic-256-sourcemaps` | 3 | 2.15s | 2.20s | +2.0% | 1.55s | 1.66s | 0.27s | 0.24s | 0.15s | 0.13s | -16.6% | 2.19s | 2.21s | 0.98x | - |
| `synthetic-256-ssr-esm` | 3 | 1.90s | 1.95s | +2.5% | 1.31s | 1.44s | 0.27s | 0.24s | 0.13s | 0.10s | -20.7% | 1.94s | 1.96s | 0.98x | - |
| `synthetic-256-ssr-esm-split` | 3 | 1.89s | 1.93s | +2.1% | 1.30s | 1.43s | 0.25s | 0.23s | 0.15s | 0.10s | -32.7% | 1.94s | 1.96s | 0.98x | - |
| `synthetic-48-ssr-esm` | 3 | 0.99s | 0.96s | -3.4% | 0.68s | 0.68s | 0.13s | 0.13s | 0.08s | 0.05s | -33.4% | 0.98s | 1.01s | 1.04x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1071 | 1039.8ms | 951.9ms | -8.5% | 951.9ms | 25.3ms | 6 |
| node | `route:module` | 1071 | 524.5ms | 443.1ms | -15.5% | 443.1ms | 7.5ms | 6 |
| web | `route:client-entry` | 1071 | 254.8ms | 247.3ms | -2.9% | 247.3ms | 10.3ms | 6 |
| node | `manifest:transform` | 3 | 65.2ms | 75.1ms | +15.2% | 75.1ms | 30.2ms | 3 |
| web | `manifest:stage` | 9 | 12.0ms | 12.4ms | +3.3% | 12.4ms | 2.2ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |
| node | `assets:relocate-ssr-only` | 6 | - | 80.9ms | - | 80.9ms | 14.0ms | 6 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1187.7ms | 1063.8ms | -10.4% | 1063.8ms | 7.3ms | 6 |
| node | `route:module` | 3078 | 533.3ms | 553.8ms | +3.8% | 553.8ms | 19.5ms | 6 |
| web | `route:client-entry` | 3078 | 378.4ms | 339.3ms | -10.3% | 339.3ms | 7.1ms | 6 |
| node | `manifest:transform` | 3 | 123.4ms | 117.2ms | -5.0% | 117.2ms | 42.2ms | 3 |
| node | `module:client-only-stub` | 3 | 120.9ms | 76.2ms | -37.0% | 76.2ms | 38.3ms | 3 |
| web | `manifest:stage` | 9 | 47.1ms | 39.7ms | -15.7% | 39.7ms | 10.5ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |
| node | `assets:relocate-ssr-only` | 6 | - | 1.3ms | - | 1.3ms | 0.4ms | 6 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1265.8ms | 1134.6ms | -10.4% | 1134.6ms | 9.7ms | 6 |
| node | `route:module` | 3078 | 561.8ms | 529.7ms | -5.7% | 529.7ms | 17.6ms | 6 |
| web | `route:client-entry` | 3078 | 374.1ms | 320.3ms | -14.4% | 320.3ms | 8.1ms | 6 |
| node | `manifest:transform` | 3 | 122.5ms | 148.6ms | +21.3% | 148.6ms | 68.3ms | 3 |
| node | `module:client-only-stub` | 3 | 51.4ms | 65.4ms | +27.2% | 65.4ms | 47.3ms | 3 |
| web | `manifest:stage` | 9 | 50.0ms | 37.5ms | -25.0% | 37.5ms | 8.6ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |
| node | `assets:relocate-ssr-only` | 6 | - | 1.5ms | - | 1.5ms | 0.4ms | 6 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 774 | 465.1ms | 391.3ms | -15.9% | 391.3ms | 10.6ms | 6 |
| node | `route:module` | 774 | 177.7ms | 187.8ms | +5.7% | 187.8ms | 4.5ms | 6 |
| web | `route:client-entry` | 774 | 125.5ms | 118.7ms | -5.4% | 118.7ms | 5.4ms | 6 |
| node | `manifest:transform` | 3 | 44.0ms | 49.9ms | +13.4% | 49.9ms | 19.8ms | 3 |
| node | `module:client-only-stub` | 3 | 36.6ms | 7.0ms | -80.9% | 7.0ms | 3.1ms | 3 |
| web | `manifest:stage` | 9 | 9.0ms | 7.9ms | -12.2% | 7.9ms | 1.3ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |
| node | `assets:relocate-ssr-only` | 6 | - | 1.8ms | - | 1.8ms | 0.4ms | 6 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 774 | 443.4ms | 409.4ms | -7.7% | 409.4ms | 11.5ms | 6 |
| node | `route:module` | 774 | 168.8ms | 168.2ms | -0.4% | 168.2ms | 4.6ms | 6 |
| web | `route:client-entry` | 774 | 123.1ms | 112.7ms | -8.4% | 112.7ms | 5.7ms | 6 |
| node | `manifest:transform` | 3 | 51.0ms | 51.5ms | +1.0% | 51.5ms | 20.8ms | 3 |
| web | `manifest:stage` | 9 | 9.2ms | 8.0ms | -13.0% | 8.0ms | 1.3ms | 9 |
| node | `module:client-only-stub` | 3 | 6.9ms | 6.7ms | -2.9% | 6.7ms | 2.4ms | 3 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |
| node | `assets:relocate-ssr-only` | 6 | - | 1.3ms | - | 1.3ms | 0.4ms | 6 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 774 | 435.0ms | 406.8ms | -6.5% | 406.8ms | 11.3ms | 6 |
| node | `route:module` | 774 | 172.3ms | 159.1ms | -7.7% | 159.1ms | 4.3ms | 6 |
| web | `route:client-entry` | 774 | 123.7ms | 108.4ms | -12.4% | 108.4ms | 5.4ms | 6 |
| node | `module:client-only-stub` | 3 | 77.6ms | 6.7ms | -91.4% | 6.7ms | 2.6ms | 3 |
| node | `manifest:transform` | 3 | 67.1ms | 39.1ms | -41.7% | 39.1ms | 17.3ms | 3 |
| web | `manifest:stage` | 9 | 9.2ms | 8.2ms | -10.9% | 8.2ms | 1.4ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |
| node | `assets:relocate-ssr-only` | 6 | - | 1.3ms | - | 1.3ms | 0.4ms | 6 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 150 | 154.5ms | 107.4ms | -30.5% | 107.4ms | 8.0ms | 6 |
| node | `route:module` | 150 | 55.0ms | 40.4ms | -26.5% | 40.4ms | 0.7ms | 6 |
| web | `route:client-entry` | 150 | 37.0ms | 26.2ms | -29.2% | 26.2ms | 2.0ms | 6 |
| node | `module:client-only-stub` | 3 | 28.5ms | 16.1ms | -43.5% | 16.1ms | 8.6ms | 3 |
| node | `manifest:transform` | 3 | 15.1ms | 13.6ms | -9.9% | 13.6ms | 6.1ms | 3 |
| web | `manifest:stage` | 9 | 2.3ms | 2.4ms | +4.3% | 2.4ms | 0.5ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |
| node | `assets:relocate-ssr-only` | 6 | - | 1.4ms | - | 1.4ms | 0.4ms | 6 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 112.56s | 126.36s | +12.3% | 124.70s | - | 0.89x | - |
| complex app | 3 | 77.81s | 86.18s | +10.8% | 85.44s | - | 0.90x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 99.37s | 100.81s | +1.4% | 88.13s | 90.02s | 2.89s | 2.97s | 3.35s | 3.38s | +1.0% | 101.63s | - | 0.99x | - |

Profile: `ci-small+ci-large`; mode: `dev`; iterations: `3`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29132539597)

