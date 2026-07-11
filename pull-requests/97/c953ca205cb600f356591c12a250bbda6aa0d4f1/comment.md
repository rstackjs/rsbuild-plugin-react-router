<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `c953ca2` against base `7bb55da`.

### Reading benchmark confidence

Raw deltas are always shown. The signal label only indicates whether the observed median delta is larger than a robust run-to-run noise band; it does not erase or replace the measurement.

The noise band is the larger of 2% or two combined robust standard deviations estimated from each side's relative median absolute deviation (rMAD). Fewer than three finite samples is reported as insufficient data. An inconclusive result should be rerun or investigated from the uploaded raw samples before drawing a performance conclusion.

| Benchmark | Runs | Base total | Head total | Delta | Base rMAD | Head rMAD | Noise band | Signal |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| `large-355-ssr-esm (build)` | 3 | 8.31s | 8.32s | +0.2% | 0.1% | 0.4% | ±2.0% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm (build)` | 3 | 3.90s | 3.84s | -1.7% | 1.4% | 1.6% | ±6.3% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (build)` | 3 | 5.11s | 5.48s | +7.4% | 0.7% | 0.2% | ±2.2% | 🔴 regression |
| `synthetic-256-sourcemaps (build)` | 5 | 2.25s | 2.26s | +0.2% | 0.7% | 0.7% | ±2.9% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (build)` | 5 | 2.17s | 2.11s | -2.7% | 0.6% | 0.5% | ±2.3% | 🟢 improvement |
| `synthetic-256-ssr-esm-split (build)` | 5 | 2.53s | 2.60s | +2.5% | 1.4% | 0.1% | ±4.2% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (build)` | 5 | 1.39s | 1.39s | -0.3% | 0.2% | 0.6% | ±2.0% | ⚪ inconclusive |
| `large-355-ssr-esm (dev)` | 3 | 14.98s | 14.72s | -1.7% | 1.7% | 1.0% | ±5.9% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm (dev)` | 3 | 4.53s | 4.46s | -1.4% | 2.7% | 0.3% | ±8.2% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (dev)` | 3 | 4.58s | 4.42s | -3.4% | 1.0% | 0.1% | ±3.0% | 🟢 improvement |
| `synthetic-256-sourcemaps (dev)` | 5 | 2.15s | 2.07s | -3.6% | 2.3% | 1.1% | ±7.5% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (dev)` | 5 | 1.93s | 1.84s | -4.3% | 0.4% | 0.7% | ±2.3% | 🟢 improvement |
| `synthetic-256-ssr-esm-split (dev)` | 5 | 1.85s | 1.88s | +1.7% | 1.2% | 2.1% | ±7.1% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (dev)` | 5 | 0.97s | 0.93s | -4.5% | 0.4% | 2.3% | ±6.8% | ⚪ inconclusive |
| `complex app (cold)` | 3 | 113.90s | 115.23s | +1.2% | 0.3% | 0.8% | ±2.6% | ⚪ inconclusive |
| `complex app (dev)` | 3 | 98.97s | 98.80s | -0.2% | 0.6% | 0.1% | ±2.0% | ⚪ inconclusive |
| `complex app (warm)` | 3 | 77.38s | 80.58s | +4.1% | 0.2% | 0.0% | ±2.0% | 🔴 regression |

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 30.98s | 30.33s | -2.1% | 19.05s | 18.64s | -2.1% | 3.90s | 3.83s | -1.8% | 2.82s | 2.74s | -2.8% | 1.02x |
| Large app | 1 | 14.98s | 14.72s | -1.7% | 8.06s | 7.82s | -3.0% | 1.87s | 1.84s | -1.6% | 1.63s | 1.63s | +0.0% | 1.02x |
| Standard fixtures | 6 | 16.00s | 15.61s | -2.5% | 10.99s | 10.82s | -1.5% | 2.03s | 1.99s | -1.9% | 1.19s | 1.11s | -6.8% | 1.03x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 8.31s | 8.32s | +0.2% | 8.30s | 8.36s | 1.00x | 1492 MB |
| `synthetic-1024-ssr-esm` | 3 | 3.90s | 3.84s | -1.7% | 3.82s | 3.90s | 1.02x | 643 MB |
| `synthetic-1024-ssr-esm-split` | 3 | 5.11s | 5.48s | +7.4% | 5.51s | 5.56s | 0.93x | 894 MB |
| `synthetic-256-sourcemaps` | 5 | 2.25s | 2.26s | +0.2% | 2.26s | 2.30s | 1.00x | 445 MB |
| `synthetic-256-ssr-esm` | 5 | 2.17s | 2.11s | -2.7% | 2.11s | 2.12s | 1.03x | 426 MB |
| `synthetic-256-ssr-esm-split` | 5 | 2.53s | 2.60s | +2.5% | 2.59s | 2.60s | 0.98x | 454 MB |
| `synthetic-48-ssr-esm` | 5 | 1.39s | 1.39s | -0.3% | 1.38s | 1.40s | 1.00x | 295 MB |

### ci-small+ci-large Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `ci-small+ci-large` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 14.98s | 14.72s | -1.7% | 8.06s | 7.82s | 1.87s | 1.84s | 1.63s | 1.63s | +0.0% | 14.96s | 15.59s | 1.02x | - |
| `synthetic-1024-ssr-esm` | 3 | 4.53s | 4.46s | -1.4% | 3.06s | 3.09s | 0.59s | 0.55s | 0.36s | 0.33s | -8.2% | 4.44s | 4.48s | 1.01x | - |
| `synthetic-1024-ssr-esm-split` | 3 | 4.58s | 4.42s | -3.4% | 3.12s | 3.03s | 0.58s | 0.56s | 0.35s | 0.33s | -6.9% | 4.49s | 4.63s | 1.04x | - |
| `synthetic-256-sourcemaps` | 5 | 2.15s | 2.07s | -3.6% | 1.56s | 1.49s | 0.25s | 0.25s | 0.15s | 0.15s | -0.5% | 2.07s | 2.11s | 1.04x | - |
| `synthetic-256-ssr-esm` | 5 | 1.93s | 1.84s | -4.3% | 1.30s | 1.27s | 0.25s | 0.25s | 0.13s | 0.13s | -0.8% | 1.85s | 1.88s | 1.04x | - |
| `synthetic-256-ssr-esm-split` | 5 | 1.85s | 1.88s | +1.7% | 1.28s | 1.30s | 0.23s | 0.26s | 0.15s | 0.13s | -16.4% | 1.90s | 1.99s | 0.98x | - |
| `synthetic-48-ssr-esm` | 5 | 0.97s | 0.93s | -4.5% | 0.67s | 0.64s | 0.13s | 0.13s | 0.05s | 0.05s | -1.6% | 0.94s | 0.99s | 1.05x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1071 | 1031.3ms | 1032.3ms | +0.1% | 1032.3ms | 16.7ms | 6 |
| node | `route:module` | 1071 | 523.2ms | 514.3ms | -1.7% | 514.3ms | 5.7ms | 6 |
| web | `route:client-entry` | 1071 | 258.4ms | 245.0ms | -5.2% | 245.0ms | 5.3ms | 6 |
| node | `manifest:transform` | 3 | 67.0ms | 56.4ms | -15.8% | 56.4ms | 20.3ms | 3 |
| web | `manifest:stage` | 9 | 14.8ms | 11.8ms | -20.3% | 11.8ms | 2.0ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1247.1ms | 1231.1ms | -1.3% | 1231.1ms | 34.3ms | 6 |
| node | `route:module` | 3078 | 547.4ms | 542.7ms | -0.9% | 542.7ms | 6.4ms | 6 |
| web | `route:client-entry` | 3078 | 367.8ms | 388.5ms | +5.6% | 388.5ms | 6.6ms | 6 |
| node | `manifest:transform` | 3 | 127.7ms | 121.9ms | -4.5% | 121.9ms | 41.5ms | 3 |
| web | `manifest:stage` | 9 | 48.7ms | 45.0ms | -7.6% | 45.0ms | 8.5ms | 9 |
| node | `module:client-only-stub` | 3 | 35.2ms | 51.3ms | +45.7% | 51.3ms | 22.8ms | 3 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1236.0ms | 1268.6ms | +2.6% | 1268.6ms | 20.9ms | 6 |
| node | `route:module` | 3078 | 561.3ms | 544.1ms | -3.1% | 544.1ms | 6.0ms | 6 |
| web | `route:client-entry` | 3078 | 388.3ms | 366.2ms | -5.7% | 366.2ms | 6.5ms | 6 |
| node | `manifest:transform` | 3 | 131.9ms | 115.6ms | -12.4% | 115.6ms | 39.9ms | 3 |
| node | `module:client-only-stub` | 3 | 77.0ms | 162.7ms | +111.3% | 162.7ms | 117.3ms | 3 |
| web | `manifest:stage` | 9 | 45.0ms | 39.5ms | -12.2% | 39.5ms | 8.6ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 758.9ms | 736.3ms | -3.0% | 736.3ms | 23.6ms | 10 |
| node | `route:module` | 1290 | 303.3ms | 318.9ms | +5.1% | 318.9ms | 4.0ms | 10 |
| web | `route:client-entry` | 1290 | 195.0ms | 217.7ms | +11.6% | 217.7ms | 5.4ms | 10 |
| node | `module:client-only-stub` | 5 | 127.5ms | 135.1ms | +6.0% | 135.1ms | 58.4ms | 5 |
| node | `manifest:transform` | 5 | 82.8ms | 74.0ms | -10.6% | 74.0ms | 17.6ms | 5 |
| web | `manifest:stage` | 15 | 18.2ms | 14.4ms | -20.9% | 14.4ms | 1.4ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 705.2ms | 718.9ms | +1.9% | 718.9ms | 12.5ms | 10 |
| node | `route:module` | 1290 | 283.8ms | 269.2ms | -5.1% | 269.2ms | 4.6ms | 10 |
| web | `route:client-entry` | 1290 | 199.0ms | 198.7ms | -0.2% | 198.7ms | 4.8ms | 10 |
| node | `manifest:transform` | 5 | 80.3ms | 72.7ms | -9.5% | 72.7ms | 20.3ms | 5 |
| node | `module:client-only-stub` | 5 | 41.0ms | 45.4ms | +10.7% | 45.4ms | 25.8ms | 5 |
| web | `manifest:stage` | 15 | 15.1ms | 14.2ms | -6.0% | 14.2ms | 1.4ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1291 | 705.0ms | 743.4ms | +5.4% | 743.4ms | 10.7ms | 11 |
| node | `route:module` | 1290 | 287.5ms | 282.5ms | -1.7% | 282.5ms | 9.2ms | 10 |
| web | `route:client-entry` | 1291 | 199.2ms | 209.4ms | +5.1% | 209.4ms | 5.6ms | 11 |
| node | `manifest:transform` | 5 | 80.2ms | 81.9ms | +2.1% | 81.9ms | 20.8ms | 5 |
| node | `module:client-only-stub` | 5 | 53.3ms | 33.2ms | -37.7% | 33.2ms | 20.6ms | 5 |
| web | `manifest:stage` | 16 | 14.5ms | 15.5ms | +6.9% | 15.5ms | 1.4ms | 16 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 250 | 251.6ms | 234.0ms | -7.0% | 234.0ms | 14.1ms | 10 |
| node | `route:module` | 250 | 89.8ms | 83.5ms | -7.0% | 83.5ms | 6.2ms | 10 |
| web | `route:client-entry` | 250 | 59.2ms | 61.0ms | +3.0% | 61.0ms | 3.7ms | 10 |
| node | `module:client-only-stub` | 5 | 35.0ms | 51.6ms | +47.4% | 51.6ms | 13.4ms | 5 |
| node | `manifest:transform` | 5 | 24.3ms | 23.8ms | -2.1% | 23.8ms | 5.7ms | 5 |
| web | `manifest:stage` | 15 | 3.7ms | 3.8ms | +2.7% | 3.8ms | 0.4ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 113.90s | 115.23s | +1.2% | 115.19s | - | 0.99x | - |
| complex app | 3 | 77.38s | 80.58s | +4.1% | 80.41s | - | 0.96x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 98.97s | 98.80s | -0.2% | 88.46s | 88.32s | 2.66s | 2.68s | 3.33s | 3.31s | -0.7% | 98.69s | - | 1.00x | - |

Profile: `ci-small+ci-large`; mode: `dev`; iterations: `5`; warmup: `1`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29145867375)

