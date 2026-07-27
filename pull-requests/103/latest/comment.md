<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `1cd7448` against base `ebf5e3b`.

### Reading benchmark confidence

Raw deltas are always shown. The signal label only indicates whether the observed median delta is larger than a robust run-to-run noise band; it does not erase or replace the measurement.

The noise band is the larger of 2% or two combined robust standard deviations estimated from each side's relative median absolute deviation (rMAD). Fewer than three finite samples is reported as insufficient data. An inconclusive result should be rerun or investigated from the uploaded raw samples before drawing a performance conclusion.

| Benchmark | Runs | Base total | Head total | Delta | Base rMAD | Head rMAD | Noise band | Signal |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| `large-355-ssr-esm (build)` | 3 | 9.33s | 9.50s | +1.8% | 0.1% | 1.6% | ±4.8% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm (build)` | 3 | 3.94s | 3.92s | -0.5% | 1.3% | 0.4% | ±4.1% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (build)` | 3 | 5.54s | 5.69s | +2.6% | 1.2% | 0.6% | ±4.0% | ⚪ inconclusive |
| `synthetic-256-sourcemaps (build)` | 5 | 2.17s | 2.14s | -1.2% | 0.4% | 0.4% | ±2.0% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (build)` | 5 | 2.03s | 2.01s | -0.7% | 1.1% | 0.7% | ±4.0% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (build)` | 5 | 2.52s | 2.49s | -1.2% | 0.9% | 1.2% | ±4.3% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (build)` | 5 | 1.37s | 1.34s | -2.6% | 2.1% | 1.2% | ±7.1% | ⚪ inconclusive |
| `large-355-ssr-esm (dev)` | 3 | 15.20s | 14.98s | -1.5% | 0.6% | 0.6% | ±2.4% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm (dev)` | 3 | 4.18s | 4.14s | -0.8% | 0.0% | 0.0% | ±2.0% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (dev)` | 3 | 4.22s | 4.17s | -1.1% | 1.0% | 1.0% | ±4.2% | ⚪ inconclusive |
| `synthetic-256-sourcemaps (dev)` | 5 | 1.98s | 1.92s | -3.0% | 2.3% | 0.9% | ±7.3% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (dev)` | 5 | 1.80s | 1.75s | -2.7% | 1.1% | 0.9% | ±4.3% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (dev)` | 5 | 1.80s | 1.74s | -3.7% | 0.4% | 1.4% | ±4.3% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (dev)` | 5 | 0.93s | 0.90s | -3.2% | 1.1% | 1.5% | ±5.5% | ⚪ inconclusive |
| `complex app (cold)` | 3 | 87.62s | 87.36s | -0.3% | 0.1% | 0.5% | ±2.0% | ⚪ inconclusive |
| `complex app (dev)` | 3 | 70.54s | 70.33s | -0.3% | 0.5% | 0.2% | ±2.0% | ⚪ inconclusive |
| `complex app (warm)` | 3 | 64.00s | 64.42s | +0.7% | 0.2% | 0.1% | ±2.0% | ⚪ inconclusive |

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 30.11s | 29.60s | -1.7% | 19.56s | 19.18s | -1.9% | 3.78s | 3.67s | -3.1% | 2.50s | 2.45s | -2.0% | 1.02x |
| Large app | 1 | 15.20s | 14.98s | -1.5% | 8.93s | 8.76s | -1.8% | 1.81s | 1.81s | -0.1% | 1.56s | 1.54s | -1.6% | 1.01x |
| Standard fixtures | 6 | 14.91s | 14.63s | -1.9% | 10.63s | 10.42s | -2.0% | 1.97s | 1.86s | -5.8% | 0.94s | 0.91s | -2.6% | 1.02x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 9.33s | 9.50s | +1.8% | 9.63s | 10.05s | 0.98x | 1578 MB |
| `synthetic-1024-ssr-esm` | 3 | 3.94s | 3.92s | -0.5% | 3.92s | 3.94s | 1.00x | 608 MB |
| `synthetic-1024-ssr-esm-split` | 3 | 5.54s | 5.69s | +2.6% | 5.71s | 5.80s | 0.97x | 775 MB |
| `synthetic-256-sourcemaps` | 5 | 2.17s | 2.14s | -1.2% | 2.14s | 2.16s | 1.01x | 466 MB |
| `synthetic-256-ssr-esm` | 5 | 2.03s | 2.01s | -0.7% | 2.02s | 2.05s | 1.01x | 432 MB |
| `synthetic-256-ssr-esm-split` | 5 | 2.52s | 2.49s | -1.2% | 2.48s | 2.52s | 1.01x | 461 MB |
| `synthetic-48-ssr-esm` | 5 | 1.37s | 1.34s | -2.6% | 1.33s | 1.36s | 1.03x | 297 MB |

### ci-small+ci-large Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `ci-small+ci-large` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 15.20s | 14.98s | -1.5% | 8.93s | 8.76s | 1.81s | 1.81s | 1.56s | 1.54s | -1.6% | 15.02s | 15.20s | 1.01x | - |
| `synthetic-1024-ssr-esm` | 3 | 4.18s | 4.14s | -0.8% | 2.92s | 2.87s | 0.56s | 0.51s | 0.28s | 0.28s | +0.5% | 4.16s | 4.18s | 1.01x | - |
| `synthetic-1024-ssr-esm-split` | 3 | 4.22s | 4.17s | -1.1% | 2.92s | 2.90s | 0.58s | 0.57s | 0.30s | 0.28s | -8.4% | 4.18s | 4.25s | 1.01x | - |
| `synthetic-256-sourcemaps` | 5 | 1.98s | 1.92s | -3.0% | 1.48s | 1.45s | 0.23s | 0.21s | 0.10s | 0.10s | -0.8% | 1.93s | 1.95s | 1.03x | - |
| `synthetic-256-ssr-esm` | 5 | 1.80s | 1.75s | -2.7% | 1.31s | 1.28s | 0.24s | 0.22s | 0.10s | 0.10s | -0.2% | 1.76s | 1.86s | 1.03x | - |
| `synthetic-256-ssr-esm-split` | 5 | 1.80s | 1.74s | -3.7% | 1.33s | 1.27s | 0.24s | 0.21s | 0.10s | 0.10s | +0.8% | 1.74s | 1.76s | 1.04x | - |
| `synthetic-48-ssr-esm` | 5 | 0.93s | 0.90s | -3.2% | 0.67s | 0.64s | 0.13s | 0.13s | 0.05s | 0.05s | -0.5% | 0.91s | 0.92s | 1.03x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1071 | 381637.7ms | 426126.8ms | +11.7% | 2286.6ms | 747.7ms | 6 |
| web | `route:client-entry` | 1071 | 108583.1ms | 113601.8ms | +4.6% | 633.1ms | 202.0ms | 6 |
| node | `route:module` | 1071 | 103395.2ms | 120975.2ms | +17.0% | 861.3ms | 256.9ms | 6 |
| node | `manifest:transform` | 3 | 102.9ms | 90.2ms | -12.3% | 90.2ms | 38.1ms | 3 |
| node | `assets:relocate-ssr-only` | 6 | 80.1ms | 80.5ms | +0.5% | 80.5ms | 13.7ms | 6 |
| web | `manifest:stage` | 6 | 8.8ms | 8.7ms | -1.1% | 8.7ms | 2.0ms | 6 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 722067.6ms | 712559.0ms | -1.3% | 1724.4ms | 332.6ms | 6 |
| web | `route:client-entry` | 3078 | 471785.1ms | 484188.7ms | +2.6% | 1061.8ms | 285.2ms | 6 |
| node | `route:module` | 3078 | 219454.4ms | 232653.0ms | +6.0% | 874.1ms | 178.7ms | 6 |
| node | `manifest:transform` | 3 | 142.1ms | 124.3ms | -12.5% | 124.3ms | 45.3ms | 3 |
| node | `module:client-only-stub` | 3 | 129.8ms | 116.6ms | -10.2% | 116.6ms | 60.5ms | 3 |
| web | `manifest:stage` | 6 | 30.2ms | 29.0ms | -4.0% | 29.0ms | 7.2ms | 6 |
| node | `assets:relocate-ssr-only` | 6 | 1.5ms | 1.7ms | +13.3% | 1.7ms | 0.4ms | 6 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 708048.3ms | 690015.8ms | -2.5% | 1739.3ms | 329.8ms | 6 |
| web | `route:client-entry` | 3078 | 470278.6ms | 469552.1ms | -0.2% | 1084.6ms | 303.7ms | 6 |
| node | `route:module` | 3078 | 205615.7ms | 235927.9ms | +14.7% | 898.7ms | 150.9ms | 6 |
| node | `manifest:transform` | 3 | 122.5ms | 149.4ms | +22.0% | 149.4ms | 56.2ms | 3 |
| node | `module:client-only-stub` | 3 | 103.4ms | 62.7ms | -39.4% | 62.7ms | 30.9ms | 3 |
| web | `manifest:stage` | 6 | 30.3ms | 29.7ms | -2.0% | 29.7ms | 8.0ms | 6 |
| node | `assets:relocate-ssr-only` | 6 | 1.5ms | 1.5ms | 0.0% | 1.5ms | 0.4ms | 6 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1292 | 665.2ms | 648.2ms | -2.6% | 648.2ms | 16.1ms | 12 |
| node | `route:module` | 1290 | 296.9ms | 307.3ms | +3.5% | 307.3ms | 10.2ms | 10 |
| web | `route:client-entry` | 1292 | 202.7ms | 177.7ms | -12.3% | 177.7ms | 5.2ms | 12 |
| node | `manifest:transform` | 5 | 77.2ms | 72.0ms | -6.7% | 72.0ms | 19.6ms | 5 |
| node | `module:client-only-stub` | 5 | 26.8ms | 12.2ms | -54.5% | 12.2ms | 3.4ms | 5 |
| web | `manifest:stage` | 12 | 10.9ms | 10.8ms | -0.9% | 10.8ms | 1.3ms | 12 |
| node | `assets:relocate-ssr-only` | 10 | 3.1ms | 2.8ms | -9.7% | 2.8ms | 0.4ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 630.6ms | 618.5ms | -1.9% | 618.5ms | 9.6ms | 10 |
| node | `route:module` | 1290 | 273.5ms | 287.5ms | +5.1% | 287.5ms | 6.3ms | 10 |
| web | `route:client-entry` | 1290 | 217.2ms | 188.8ms | -13.1% | 188.8ms | 6.2ms | 10 |
| node | `manifest:transform` | 5 | 84.5ms | 78.6ms | -7.0% | 78.6ms | 20.9ms | 5 |
| node | `module:client-only-stub` | 5 | 48.9ms | 18.5ms | -62.2% | 18.5ms | 9.5ms | 5 |
| web | `manifest:stage` | 11 | 11.4ms | 10.2ms | -10.5% | 10.2ms | 1.3ms | 11 |
| node | `assets:relocate-ssr-only` | 11 | 2.4ms | 2.3ms | -4.2% | 2.3ms | 0.4ms | 11 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1291 | 629.7ms | 639.6ms | +1.6% | 639.6ms | 11.2ms | 11 |
| node | `route:module` | 1290 | 296.6ms | 285.1ms | -3.9% | 285.1ms | 5.2ms | 10 |
| web | `route:client-entry` | 1291 | 201.1ms | 182.0ms | -9.5% | 182.0ms | 5.5ms | 11 |
| node | `manifest:transform` | 5 | 69.6ms | 74.9ms | +7.6% | 74.9ms | 15.6ms | 5 |
| node | `module:client-only-stub` | 5 | 28.5ms | 22.6ms | -20.7% | 22.6ms | 10.7ms | 5 |
| web | `manifest:stage` | 11 | 10.2ms | 10.7ms | +4.9% | 10.7ms | 1.4ms | 11 |
| node | `assets:relocate-ssr-only` | 10 | 2.4ms | 2.3ms | -4.2% | 2.3ms | 0.4ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 250 | 184.4ms | 221.8ms | +20.3% | 221.8ms | 7.2ms | 10 |
| node | `route:module` | 250 | 64.8ms | 74.1ms | +14.4% | 74.1ms | 4.0ms | 10 |
| web | `route:client-entry` | 250 | 41.9ms | 35.0ms | -16.5% | 35.0ms | 0.8ms | 10 |
| node | `module:client-only-stub` | 5 | 28.4ms | 26.9ms | -5.3% | 26.9ms | 7.0ms | 5 |
| node | `manifest:transform` | 5 | 25.6ms | 29.0ms | +13.3% | 29.0ms | 7.2ms | 5 |
| web | `manifest:stage` | 10 | 2.9ms | 2.9ms | 0.0% | 2.9ms | 0.4ms | 10 |
| node | `assets:relocate-ssr-only` | 10 | 2.5ms | 2.4ms | -4.0% | 2.4ms | 0.4ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 87.62s | 87.36s | -0.3% | 87.51s | - | 1.00x | - |
| complex app | 3 | 64.00s | 64.42s | +0.7% | 64.56s | - | 0.99x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 70.54s | 70.33s | -0.3% | 63.74s | 63.56s | 2.17s | 2.17s | 1.77s | 1.84s | +4.3% | 70.35s | - | 1.00x | - |

Profile: `ci-small+ci-large`; mode: `dev`; iterations: `5`; warmup: `1`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/30313021415)

