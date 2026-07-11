<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `2fdf701` against base `7bb55da`.

### Reading benchmark confidence

Raw deltas are always shown. The signal label only indicates whether the observed median delta is larger than a robust run-to-run noise band; it does not erase or replace the measurement.

The noise band is the larger of 2% or two combined robust standard deviations estimated from each side's relative median absolute deviation (rMAD). Fewer than three finite samples is reported as insufficient data. An inconclusive result should be rerun or investigated from the uploaded raw samples before drawing a performance conclusion.

| Benchmark | Runs | Base total | Head total | Delta | Base rMAD | Head rMAD | Noise band | Signal |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| `large-355-ssr-esm (build)` | 3 | 8.92s | 8.93s | +0.1% | 0.0% | 0.5% | ±2.0% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm (build)` | 3 | 4.19s | 4.27s | +1.9% | 0.4% | 1.1% | ±3.4% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (build)` | 3 | 5.82s | 6.08s | +4.5% | 1.6% | 3.2% | ±10.7% | ⚪ inconclusive |
| `synthetic-256-sourcemaps (build)` | 5 | 2.21s | 2.17s | -1.7% | 0.4% | 0.5% | ±2.0% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (build)` | 5 | 2.06s | 2.06s | +0.0% | 1.2% | 0.2% | ±3.5% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (build)` | 5 | 2.49s | 2.52s | +1.1% | 0.3% | 1.0% | ±3.1% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (build)` | 5 | 1.34s | 1.33s | -0.6% | 0.4% | 0.5% | ±2.0% | ⚪ inconclusive |
| `large-355-ssr-esm (dev)` | 3 | 16.16s | 15.91s | -1.6% | 1.7% | 0.4% | ±5.1% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm (dev)` | 3 | 5.19s | 4.91s | -5.5% | 0.9% | 3.2% | ±9.9% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (dev)` | 3 | 4.89s | 4.78s | -2.2% | 0.1% | 0.6% | ±2.0% | 🟢 improvement |
| `synthetic-256-sourcemaps (dev)` | 5 | 2.12s | 1.96s | -7.6% | 2.9% | 2.1% | ±10.7% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (dev)` | 5 | 1.84s | 1.80s | -2.3% | 0.5% | 3.3% | ±9.8% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (dev)` | 5 | 1.83s | 1.75s | -4.4% | 1.7% | 0.1% | ±4.9% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (dev)` | 5 | 0.95s | 0.89s | -6.3% | 0.6% | 1.2% | ±4.0% | 🟢 improvement |
| `complex app (cold)` | 3 | 112.40s | 111.84s | -0.5% | 0.7% | 0.3% | ±2.4% | ⚪ inconclusive |
| `complex app (dev)` | 3 | 96.29s | 97.13s | +0.9% | 0.1% | 0.1% | ±2.0% | ⚪ inconclusive |
| `complex app (warm)` | 3 | 76.83s | 77.56s | +1.0% | 0.1% | 0.2% | ±2.0% | ⚪ inconclusive |

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 32.98s | 31.99s | -3.0% | 20.21s | 19.52s | -3.4% | 4.07s | 3.96s | -2.9% | 3.07s | 2.93s | -4.3% | 1.03x |
| Large app | 1 | 16.16s | 15.91s | -1.6% | 8.61s | 8.46s | -1.8% | 2.07s | 1.99s | -4.0% | 1.80s | 1.75s | -2.9% | 1.02x |
| Standard fixtures | 6 | 16.82s | 16.08s | -4.4% | 11.59s | 11.06s | -4.6% | 2.01s | 1.97s | -1.8% | 1.27s | 1.19s | -6.3% | 1.05x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 8.92s | 8.93s | +0.1% | 8.95s | 9.02s | 1.00x | 1518 MB |
| `synthetic-1024-ssr-esm` | 3 | 4.19s | 4.27s | +1.9% | 4.28s | 4.33s | 0.98x | 654 MB |
| `synthetic-1024-ssr-esm-split` | 3 | 5.82s | 6.08s | +4.5% | 6.08s | 6.28s | 0.96x | 898 MB |
| `synthetic-256-sourcemaps` | 5 | 2.21s | 2.17s | -1.7% | 2.18s | 2.21s | 1.02x | 444 MB |
| `synthetic-256-ssr-esm` | 5 | 2.06s | 2.06s | +0.0% | 2.06s | 2.08s | 1.00x | 425 MB |
| `synthetic-256-ssr-esm-split` | 5 | 2.49s | 2.52s | +1.1% | 2.52s | 2.55s | 0.99x | 470 MB |
| `synthetic-48-ssr-esm` | 5 | 1.34s | 1.33s | -0.6% | 1.34s | 1.35s | 1.01x | 303 MB |

### ci-small+ci-large Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `ci-small+ci-large` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 16.16s | 15.91s | -1.6% | 8.61s | 8.46s | 2.07s | 1.99s | 1.80s | 1.75s | -2.9% | 15.86s | 15.97s | 1.02x | - |
| `synthetic-1024-ssr-esm` | 3 | 5.19s | 4.91s | -5.5% | 3.54s | 3.32s | 0.61s | 0.55s | 0.38s | 0.38s | -0.2% | 4.93s | 5.12s | 1.06x | - |
| `synthetic-1024-ssr-esm-split` | 3 | 4.89s | 4.78s | -2.2% | 3.38s | 3.28s | 0.55s | 0.59s | 0.40s | 0.38s | -6.2% | 4.77s | 4.81s | 1.02x | - |
| `synthetic-256-sourcemaps` | 5 | 2.12s | 1.96s | -7.6% | 1.48s | 1.42s | 0.25s | 0.22s | 0.15s | 0.13s | -17.1% | 1.98s | 2.07s | 1.08x | - |
| `synthetic-256-ssr-esm` | 5 | 1.84s | 1.80s | -2.3% | 1.27s | 1.22s | 0.25s | 0.24s | 0.13s | 0.13s | -1.2% | 1.81s | 1.88s | 1.02x | - |
| `synthetic-256-ssr-esm-split` | 5 | 1.83s | 1.75s | -4.4% | 1.26s | 1.21s | 0.23s | 0.24s | 0.15s | 0.13s | -16.8% | 1.75s | 1.77s | 1.05x | - |
| `synthetic-48-ssr-esm` | 5 | 0.95s | 0.89s | -6.3% | 0.67s | 0.62s | 0.12s | 0.12s | 0.05s | 0.05s | +0.2% | 0.89s | 0.91s | 1.07x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1071 | 1121.6ms | 1126.4ms | +0.4% | 1126.4ms | 21.0ms | 6 |
| node | `route:module` | 1071 | 570.0ms | 561.6ms | -1.5% | 561.6ms | 7.5ms | 6 |
| web | `route:client-entry` | 1071 | 274.4ms | 255.2ms | -7.0% | 255.2ms | 5.5ms | 6 |
| node | `manifest:transform` | 3 | 59.6ms | 110.5ms | +85.4% | 110.5ms | 62.6ms | 3 |
| web | `manifest:stage` | 9 | 12.1ms | 12.3ms | +1.7% | 12.3ms | 1.9ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1294.8ms | 1294.7ms | -0.0% | 1294.7ms | 19.5ms | 6 |
| node | `route:module` | 3078 | 589.3ms | 563.5ms | -4.4% | 563.5ms | 5.1ms | 6 |
| web | `route:client-entry` | 3078 | 407.5ms | 411.0ms | +0.9% | 411.0ms | 6.2ms | 6 |
| node | `manifest:transform` | 3 | 119.6ms | 125.4ms | +4.8% | 125.4ms | 45.6ms | 3 |
| node | `module:client-only-stub` | 3 | 105.4ms | 138.3ms | +31.2% | 138.3ms | 67.5ms | 3 |
| web | `manifest:stage` | 9 | 37.2ms | 43.9ms | +18.0% | 43.9ms | 8.2ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1256.4ms | 1303.7ms | +3.8% | 1303.7ms | 19.5ms | 6 |
| node | `route:module` | 3078 | 544.7ms | 575.0ms | +5.6% | 575.0ms | 5.4ms | 6 |
| web | `route:client-entry` | 3078 | 388.2ms | 402.6ms | +3.7% | 402.6ms | 6.4ms | 6 |
| node | `manifest:transform` | 3 | 133.3ms | 127.9ms | -4.1% | 127.9ms | 44.2ms | 3 |
| node | `module:client-only-stub` | 3 | 85.4ms | 182.2ms | +113.3% | 182.2ms | 94.9ms | 3 |
| web | `manifest:stage` | 9 | 47.7ms | 38.5ms | -19.3% | 38.5ms | 8.2ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 704.2ms | 763.8ms | +8.5% | 763.8ms | 17.4ms | 10 |
| node | `route:module` | 1290 | 297.0ms | 293.7ms | -1.1% | 293.7ms | 3.7ms | 10 |
| web | `route:client-entry` | 1290 | 199.4ms | 201.8ms | +1.2% | 201.8ms | 5.1ms | 10 |
| node | `manifest:transform` | 5 | 68.0ms | 85.4ms | +25.6% | 85.4ms | 20.5ms | 5 |
| node | `module:client-only-stub` | 5 | 25.9ms | 166.6ms | +543.2% | 166.6ms | 82.6ms | 5 |
| web | `manifest:stage` | 15 | 15.0ms | 13.9ms | -7.3% | 13.9ms | 1.4ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1292 | 699.6ms | 712.5ms | +1.8% | 712.5ms | 13.4ms | 12 |
| node | `route:module` | 1290 | 277.1ms | 281.6ms | +1.6% | 281.6ms | 5.1ms | 10 |
| web | `route:client-entry` | 1292 | 196.0ms | 209.1ms | +6.7% | 209.1ms | 4.8ms | 12 |
| node | `module:client-only-stub` | 5 | 124.9ms | 40.4ms | -67.7% | 40.4ms | 26.2ms | 5 |
| node | `manifest:transform` | 5 | 71.5ms | 75.9ms | +6.2% | 75.9ms | 26.0ms | 5 |
| web | `manifest:stage` | 17 | 15.0ms | 15.0ms | -0.0% | 15.0ms | 1.3ms | 17 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 682.7ms | 718.7ms | +5.3% | 718.7ms | 17.6ms | 10 |
| node | `route:module` | 1290 | 295.7ms | 283.7ms | -4.1% | 283.7ms | 4.3ms | 10 |
| web | `route:client-entry` | 1290 | 206.7ms | 204.9ms | -0.9% | 204.9ms | 5.1ms | 10 |
| node | `module:client-only-stub` | 5 | 161.0ms | 179.0ms | +11.2% | 179.0ms | 100.9ms | 5 |
| node | `manifest:transform` | 5 | 81.4ms | 81.2ms | -0.2% | 81.2ms | 20.4ms | 5 |
| web | `manifest:stage` | 15 | 17.9ms | 13.9ms | -22.3% | 13.9ms | 1.4ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 250 | 248.1ms | 198.9ms | -19.8% | 198.9ms | 9.1ms | 10 |
| node | `route:module` | 250 | 85.7ms | 78.2ms | -8.8% | 78.2ms | 0.8ms | 10 |
| web | `route:client-entry` | 250 | 58.0ms | 51.1ms | -11.9% | 51.1ms | 3.4ms | 10 |
| node | `module:client-only-stub` | 5 | 40.0ms | 37.6ms | -6.0% | 37.6ms | 10.7ms | 5 |
| node | `manifest:transform` | 5 | 32.0ms | 27.6ms | -13.7% | 27.6ms | 6.3ms | 5 |
| web | `manifest:stage` | 15 | 3.6ms | 3.6ms | -0.0% | 3.6ms | 0.4ms | 15 |
| web | `manifest:transform` | 5 | 0.6ms | 0.5ms | -16.7% | 0.5ms | 0.1ms | 5 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 112.40s | 111.84s | -0.5% | 111.42s | - | 1.01x | - |
| complex app | 3 | 76.83s | 77.56s | +1.0% | 77.85s | - | 0.99x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 96.29s | 97.13s | +0.9% | 86.15s | 86.85s | 2.61s | 2.67s | 3.29s | 3.35s | +1.8% | 97.05s | - | 0.99x | - |

Profile: `ci-small+ci-large`; mode: `dev`; iterations: `5`; warmup: `1`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29140641100)

