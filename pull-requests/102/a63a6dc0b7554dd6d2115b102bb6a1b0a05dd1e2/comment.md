<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `a63a6dc` against base `7bb55da`.

### Reading benchmark confidence

Raw deltas are always shown. The signal label only indicates whether the observed median delta is larger than a robust run-to-run noise band; it does not erase or replace the measurement.

The noise band is the larger of 2% or two combined robust standard deviations estimated from each side's relative median absolute deviation (rMAD). Fewer than three finite samples is reported as insufficient data. An inconclusive result should be rerun or investigated from the uploaded raw samples before drawing a performance conclusion.

| Benchmark | Runs | Base total | Head total | Delta | Base rMAD | Head rMAD | Noise band | Signal |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| `large-355-ssr-esm (build)` | 3 | 7.20s | 6.93s | -3.8% | 1.8% | 0.6% | ±5.5% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm (build)` | 3 | 2.64s | 2.71s | +2.7% | 0.5% | 0.8% | ±2.7% | 🔴 regression |
| `synthetic-1024-ssr-esm-split (build)` | 3 | 3.55s | 3.66s | +3.2% | 0.8% | 0.5% | ±2.8% | 🔴 regression |
| `synthetic-256-sourcemaps (build)` | 5 | 2.25s | 2.29s | +1.7% | 0.4% | 1.0% | ±3.1% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (build)` | 5 | 2.07s | 2.14s | +3.5% | 0.3% | 0.3% | ±2.0% | 🔴 regression |
| `synthetic-256-ssr-esm-split (build)` | 5 | 2.58s | 2.56s | -0.7% | 1.3% | 0.8% | ±4.6% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (build)` | 5 | 1.38s | 1.38s | -0.0% | 0.2% | 1.2% | ±3.7% | ⚪ inconclusive |
| `large-355-ssr-esm (dev)` | 3 | 14.63s | 13.19s | -9.8% | 1.4% | 2.4% | ±8.4% | 🟢 improvement |
| `synthetic-1024-ssr-esm (dev)` | 3 | 3.75s | 3.68s | -1.9% | 1.8% | 0.3% | ±5.4% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (dev)` | 3 | 4.05s | 3.82s | -5.7% | 3.1% | 6.9% | ±22.5% | ⚪ inconclusive |
| `synthetic-256-sourcemaps (dev)` | 5 | 2.16s | 2.07s | -3.8% | 1.6% | 1.2% | ±5.9% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (dev)` | 5 | 1.88s | 1.89s | +0.9% | 0.7% | 1.7% | ±5.4% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (dev)` | 5 | 1.87s | 1.83s | -2.3% | 0.3% | 2.1% | ±6.3% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (dev)` | 5 | 0.98s | 0.97s | -1.3% | 1.3% | 1.3% | ±5.3% | ⚪ inconclusive |
| `complex app (cold)` | 3 | 94.59s | 94.02s | -0.6% | 2.8% | 1.3% | ±9.1% | ⚪ inconclusive |
| `complex app (dev)` | 3 | 83.87s | 83.33s | -0.6% | 2.2% | 0.3% | ±6.5% | ⚪ inconclusive |
| `complex app (warm)` | 3 | 63.00s | 64.48s | +2.3% | 2.0% | 1.3% | ±7.1% | ⚪ inconclusive |

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.32s | 27.46s | -6.4% | 17.77s | 16.81s | -5.4% | 3.09s | 3.09s | -0.0% | 3.06s | 2.98s | -2.3% | 1.07x |
| Large app | 1 | 14.63s | 13.19s | -9.8% | 7.43s | 6.99s | -6.0% | 1.38s | 1.35s | -1.6% | 1.92s | 1.65s | -14.1% | 1.11x |
| Standard fixtures | 6 | 14.69s | 14.27s | -2.9% | 10.34s | 9.83s | -5.0% | 1.72s | 1.74s | +1.2% | 1.13s | 1.33s | +17.6% | 1.03x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 7.20s | 6.93s | -3.8% | 6.88s | 6.97s | 1.04x | 1502 MB |
| `synthetic-1024-ssr-esm` | 3 | 2.64s | 2.71s | +2.7% | 2.70s | 2.73s | 0.97x | 645 MB |
| `synthetic-1024-ssr-esm-split` | 3 | 3.55s | 3.66s | +3.2% | 3.66s | 3.68s | 0.97x | 802 MB |
| `synthetic-256-sourcemaps` | 5 | 2.25s | 2.29s | +1.7% | 2.28s | 2.31s | 0.98x | 440 MB |
| `synthetic-256-ssr-esm` | 5 | 2.07s | 2.14s | +3.5% | 2.15s | 2.20s | 0.97x | 426 MB |
| `synthetic-256-ssr-esm-split` | 5 | 2.58s | 2.56s | -0.7% | 2.56s | 2.60s | 1.01x | 451 MB |
| `synthetic-48-ssr-esm` | 5 | 1.38s | 1.38s | -0.0% | 1.38s | 1.40s | 1.00x | 292 MB |

### ci-small+ci-large Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `ci-small+ci-large` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 14.63s | 13.19s | -9.8% | 7.43s | 6.99s | 1.38s | 1.35s | 1.92s | 1.65s | -14.1% | 13.28s | 13.77s | 1.11x | - |
| `synthetic-1024-ssr-esm` | 3 | 3.75s | 3.68s | -1.9% | 2.59s | 2.49s | 0.42s | 0.42s | 0.33s | 0.38s | +15.3% | 3.60s | 3.69s | 1.02x | - |
| `synthetic-1024-ssr-esm-split` | 3 | 4.05s | 3.82s | -5.7% | 2.94s | 2.65s | 0.41s | 0.41s | 0.28s | 0.48s | +71.9% | 3.92s | 4.39s | 1.06x | - |
| `synthetic-256-sourcemaps` | 5 | 2.16s | 2.07s | -3.8% | 1.52s | 1.48s | 0.26s | 0.25s | 0.15s | 0.15s | -0.3% | 2.09s | 2.15s | 1.04x | - |
| `synthetic-256-ssr-esm` | 5 | 1.88s | 1.89s | +0.9% | 1.31s | 1.28s | 0.24s | 0.26s | 0.15s | 0.13s | -17.1% | 1.88s | 1.93s | 0.99x | - |
| `synthetic-256-ssr-esm-split` | 5 | 1.87s | 1.83s | -2.3% | 1.29s | 1.27s | 0.25s | 0.26s | 0.15s | 0.13s | -16.1% | 1.85s | 1.94s | 1.02x | - |
| `synthetic-48-ssr-esm` | 5 | 0.98s | 0.97s | -1.3% | 0.68s | 0.65s | 0.13s | 0.13s | 0.08s | 0.08s | -0.1% | 0.97s | 0.98s | 1.01x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1071 | 757.2ms | 749.1ms | -1.1% | 749.1ms | 11.2ms | 6 |
| node | `route:module` | 1071 | 400.0ms | 375.6ms | -6.1% | 375.6ms | 6.7ms | 6 |
| web | `route:client-entry` | 1071 | 170.3ms | 155.6ms | -8.6% | 155.6ms | 5.1ms | 6 |
| node | `manifest:transform` | 3 | 42.3ms | 39.7ms | -6.1% | 39.7ms | 16.2ms | 3 |
| web | `manifest:stage` | 9 | 10.0ms | 9.5ms | -5.0% | 9.5ms | 1.4ms | 9 |
| web | `manifest:transform` | 3 | 0.2ms | 0.1ms | -50.0% | 0.1ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 966.1ms | 946.9ms | -2.0% | 946.9ms | 15.6ms | 6 |
| node | `route:module` | 3078 | 441.2ms | 464.3ms | +5.2% | 464.3ms | 7.7ms | 6 |
| web | `route:client-entry` | 3078 | 235.2ms | 244.7ms | +4.0% | 244.7ms | 6.1ms | 6 |
| node | `manifest:transform` | 3 | 80.9ms | 87.3ms | +7.9% | 87.3ms | 30.3ms | 3 |
| node | `module:client-only-stub` | 3 | 37.9ms | 102.3ms | +169.9% | 102.3ms | 57.6ms | 3 |
| web | `manifest:stage` | 9 | 27.9ms | 32.4ms | +16.1% | 32.4ms | 6.8ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.2ms | -33.3% | 0.2ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1017.8ms | 962.7ms | -5.4% | 962.7ms | 10.9ms | 6 |
| node | `route:module` | 3078 | 416.1ms | 438.1ms | +5.3% | 438.1ms | 5.8ms | 6 |
| web | `route:client-entry` | 3078 | 261.9ms | 249.5ms | -4.7% | 249.5ms | 6.3ms | 6 |
| node | `manifest:transform` | 3 | 88.8ms | 84.1ms | -5.3% | 84.1ms | 31.1ms | 3 |
| node | `module:client-only-stub` | 3 | 31.1ms | 24.2ms | -22.2% | 24.2ms | 10.2ms | 3 |
| web | `manifest:stage` | 9 | 30.4ms | 29.8ms | -2.0% | 29.8ms | 5.4ms | 9 |
| web | `manifest:transform` | 3 | 0.2ms | 0.3ms | +50.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 706.9ms | 768.8ms | +8.8% | 768.8ms | 20.3ms | 10 |
| node | `route:module` | 1290 | 324.0ms | 309.7ms | -4.4% | 309.7ms | 3.6ms | 10 |
| web | `route:client-entry` | 1290 | 199.5ms | 198.7ms | -0.4% | 198.7ms | 5.8ms | 10 |
| node | `module:client-only-stub` | 5 | 181.2ms | 212.3ms | +17.2% | 212.3ms | 117.0ms | 5 |
| node | `manifest:transform` | 5 | 80.1ms | 70.0ms | -12.6% | 70.0ms | 20.6ms | 5 |
| web | `manifest:stage` | 15 | 18.0ms | 14.5ms | -19.4% | 14.5ms | 1.4ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 718.0ms | 736.0ms | +2.5% | 736.0ms | 23.8ms | 10 |
| node | `route:module` | 1290 | 300.6ms | 286.4ms | -4.7% | 286.4ms | 5.6ms | 10 |
| web | `route:client-entry` | 1290 | 205.3ms | 234.4ms | +14.2% | 234.4ms | 7.4ms | 10 |
| node | `module:client-only-stub` | 5 | 153.4ms | 51.1ms | -66.7% | 51.1ms | 36.4ms | 5 |
| node | `manifest:transform` | 5 | 98.4ms | 95.5ms | -2.9% | 95.5ms | 23.9ms | 5 |
| web | `manifest:stage` | 15 | 15.1ms | 15.3ms | +1.3% | 15.3ms | 1.5ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 709.2ms | 695.8ms | -1.9% | 695.8ms | 14.8ms | 10 |
| node | `route:module` | 1290 | 288.5ms | 291.9ms | +1.2% | 291.9ms | 4.6ms | 10 |
| web | `route:client-entry` | 1290 | 221.0ms | 217.6ms | -1.5% | 217.6ms | 5.5ms | 10 |
| node | `module:client-only-stub` | 5 | 103.0ms | 251.5ms | +144.2% | 251.5ms | 112.6ms | 5 |
| node | `manifest:transform` | 5 | 81.5ms | 97.0ms | +19.0% | 97.0ms | 23.7ms | 5 |
| web | `manifest:stage` | 15 | 15.2ms | 15.0ms | -1.3% | 15.0ms | 1.5ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 250 | 249.3ms | 235.6ms | -5.5% | 235.6ms | 10.3ms | 10 |
| node | `route:module` | 250 | 84.9ms | 86.1ms | +1.4% | 86.1ms | 6.6ms | 10 |
| web | `route:client-entry` | 250 | 61.2ms | 61.3ms | +0.2% | 61.3ms | 3.7ms | 10 |
| node | `module:client-only-stub` | 5 | 41.4ms | 60.2ms | +45.4% | 60.2ms | 20.4ms | 5 |
| node | `manifest:transform` | 5 | 27.9ms | 28.2ms | +1.1% | 28.2ms | 7.4ms | 5 |
| web | `manifest:stage` | 15 | 3.7ms | 3.9ms | +5.4% | 3.9ms | 0.4ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 94.59s | 94.02s | -0.6% | 92.97s | - | 1.01x | - |
| complex app | 3 | 63.00s | 64.48s | +2.3% | 64.76s | - | 0.98x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 83.87s | 83.33s | -0.6% | 74.30s | 73.78s | 2.15s | 2.11s | 3.83s | 3.70s | -3.3% | 83.20s | - | 1.01x | - |

Profile: `ci-small+ci-large`; mode: `dev`; iterations: `5`; warmup: `1`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29806412273)

