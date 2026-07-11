<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `490c349` against base `7bb55da`.

### Reading benchmark confidence

Raw deltas are always shown. The signal label only indicates whether the observed median delta is larger than a robust run-to-run noise band; it does not erase or replace the measurement.

The noise band is the larger of 2% or two combined robust standard deviations estimated from each side's relative median absolute deviation (rMAD). Fewer than three finite samples is reported as insufficient data. An inconclusive result should be rerun or investigated from the uploaded raw samples before drawing a performance conclusion.

| Benchmark | Runs | Base total | Head total | Delta | Base rMAD | Head rMAD | Noise band | Signal |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| `large-355-ssr-esm (build)` | 3 | 8.40s | 9.34s | +11.2% | 0.3% | 0.9% | ±2.8% | 🔴 regression |
| `synthetic-1024-ssr-esm (build)` | 3 | 3.92s | 4.03s | +2.8% | 0.6% | 2.9% | ±8.7% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (build)` | 3 | 5.16s | 5.76s | +11.6% | 0.3% | 0.9% | ±2.9% | 🔴 regression |
| `synthetic-256-sourcemaps (build)` | 5 | 2.17s | 2.22s | +2.5% | 0.6% | 0.7% | ±2.7% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (build)` | 5 | 2.03s | 2.10s | +3.4% | 0.6% | 0.2% | ±2.0% | 🔴 regression |
| `synthetic-256-ssr-esm-split (build)` | 5 | 2.45s | 2.62s | +6.9% | 1.0% | 0.9% | ±3.9% | 🔴 regression |
| `synthetic-48-ssr-esm (build)` | 5 | 1.33s | 1.37s | +2.5% | 0.3% | 0.3% | ±2.0% | 🔴 regression |
| `large-355-ssr-esm (dev)` | 3 | 15.21s | 17.54s | +15.3% | 0.3% | 6.2% | ±18.5% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm (dev)` | 3 | 4.48s | 4.71s | +5.3% | 1.2% | 1.9% | ±6.6% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (dev)` | 3 | 4.58s | 4.75s | +3.8% | 0.8% | 0.3% | ±2.6% | 🔴 regression |
| `synthetic-256-sourcemaps (dev)` | 5 | 2.12s | 2.21s | +4.2% | 3.5% | 1.0% | ±10.8% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (dev)` | 5 | 1.79s | 1.88s | +5.2% | 0.5% | 0.7% | ±2.6% | 🔴 regression |
| `synthetic-256-ssr-esm-split (dev)` | 5 | 1.83s | 1.93s | +5.1% | 1.6% | 2.4% | ±8.4% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (dev)` | 5 | 0.92s | 0.92s | -0.1% | 0.7% | 0.4% | ±2.4% | ⚪ inconclusive |
| `complex app (cold)` | 3 | 115.69s | 120.51s | +4.2% | 0.2% | 0.3% | ±2.0% | 🔴 regression |
| `complex app (dev)` | 3 | 101.82s | 104.03s | +2.2% | 1.1% | 0.7% | ±4.0% | ⚪ inconclusive |
| `complex app (warm)` | 3 | 78.66s | 87.87s | +11.7% | 0.5% | 0.2% | ±2.0% | 🔴 regression |

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 30.92s | 33.94s | +9.8% | 18.86s | 21.35s | +13.2% | 3.87s | 3.65s | -5.6% | 2.89s | 2.71s | -6.3% | 0.91x |
| Large app | 1 | 15.21s | 17.54s | +15.3% | 8.12s | 9.45s | +16.3% | 1.93s | 1.80s | -7.0% | 1.70s | 1.72s | +1.2% | 0.87x |
| Standard fixtures | 6 | 15.72s | 16.40s | +4.3% | 10.74s | 11.90s | +10.8% | 1.94s | 1.86s | -4.1% | 1.19s | 0.99s | -17.0% | 0.96x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 8.40s | 9.34s | +11.2% | 9.32s | 9.42s | 0.90x | 1623 MB |
| `synthetic-1024-ssr-esm` | 3 | 3.92s | 4.03s | +2.8% | 4.03s | 4.14s | 0.97x | 646 MB |
| `synthetic-1024-ssr-esm-split` | 3 | 5.16s | 5.76s | +11.6% | 5.76s | 5.82s | 0.90x | 805 MB |
| `synthetic-256-sourcemaps` | 5 | 2.17s | 2.22s | +2.5% | 2.23s | 2.26s | 0.98x | 447 MB |
| `synthetic-256-ssr-esm` | 5 | 2.03s | 2.10s | +3.4% | 2.10s | 2.11s | 0.97x | 421 MB |
| `synthetic-256-ssr-esm-split` | 5 | 2.45s | 2.62s | +6.9% | 2.61s | 2.66s | 0.94x | 462 MB |
| `synthetic-48-ssr-esm` | 5 | 1.33s | 1.37s | +2.5% | 1.36s | 1.37s | 0.98x | 319 MB |

### ci-small+ci-large Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `ci-small+ci-large` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 15.21s | 17.54s | +15.3% | 8.12s | 9.45s | 1.93s | 1.80s | 1.70s | 1.72s | +1.2% | 17.50s | 18.63s | 0.87x | - |
| `synthetic-1024-ssr-esm` | 3 | 4.48s | 4.71s | +5.3% | 3.03s | 3.45s | 0.57s | 0.52s | 0.35s | 0.30s | -14.7% | 4.73s | 4.84s | 0.95x | - |
| `synthetic-1024-ssr-esm-split` | 3 | 4.58s | 4.75s | +3.8% | 3.11s | 3.46s | 0.53s | 0.53s | 0.40s | 0.30s | -25.0% | 4.79s | 4.90s | 0.96x | - |
| `synthetic-256-sourcemaps` | 5 | 2.12s | 2.21s | +4.2% | 1.47s | 1.60s | 0.25s | 0.23s | 0.13s | 0.13s | +0.2% | 2.20s | 2.23s | 0.96x | - |
| `synthetic-256-ssr-esm` | 5 | 1.79s | 1.88s | +5.2% | 1.23s | 1.37s | 0.23s | 0.23s | 0.13s | 0.10s | -19.6% | 1.87s | 1.89s | 0.95x | - |
| `synthetic-256-ssr-esm-split` | 5 | 1.83s | 1.93s | +5.1% | 1.26s | 1.38s | 0.24s | 0.23s | 0.13s | 0.10s | -19.8% | 1.96s | 2.06s | 0.95x | - |
| `synthetic-48-ssr-esm` | 5 | 0.92s | 0.92s | -0.1% | 0.64s | 0.64s | 0.12s | 0.13s | 0.05s | 0.05s | +1.2% | 0.92s | 0.94s | 1.00x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1072 | 1023.8ms | 928.8ms | -9.3% | 928.8ms | 11.9ms | 7 |
| node | `route:module` | 1071 | 494.6ms | 470.0ms | -5.0% | 470.0ms | 7.5ms | 6 |
| web | `route:client-entry` | 1072 | 271.5ms | 271.8ms | +0.1% | 271.8ms | 7.3ms | 7 |
| node | `manifest:transform` | 3 | 70.0ms | 62.6ms | -10.6% | 62.6ms | 24.2ms | 3 |
| web | `manifest:stage` | 10 | 15.5ms | 12.8ms | -17.4% | 12.8ms | 1.9ms | 10 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |
| node | `assets:relocate-ssr-only` | 7 | - | 109.4ms | - | 109.4ms | 21.5ms | 7 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1219.8ms | 1111.8ms | -8.9% | 1111.8ms | 10.3ms | 6 |
| node | `route:module` | 3078 | 577.3ms | 531.7ms | -7.9% | 531.7ms | 18.7ms | 6 |
| web | `route:client-entry` | 3078 | 399.7ms | 372.6ms | -6.8% | 372.6ms | 8.0ms | 6 |
| node | `module:client-only-stub` | 3 | 168.9ms | 102.2ms | -39.5% | 102.2ms | 53.6ms | 3 |
| node | `manifest:transform` | 3 | 114.9ms | 114.7ms | -0.2% | 114.7ms | 38.5ms | 3 |
| web | `manifest:stage` | 9 | 43.5ms | 37.2ms | -14.5% | 37.2ms | 7.1ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |
| node | `assets:relocate-ssr-only` | 6 | - | 1.3ms | - | 1.3ms | 0.4ms | 6 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1241.9ms | 1080.2ms | -13.0% | 1080.2ms | 6.9ms | 6 |
| node | `route:module` | 3078 | 568.0ms | 548.0ms | -3.5% | 548.0ms | 19.3ms | 6 |
| web | `route:client-entry` | 3078 | 343.3ms | 323.7ms | -5.7% | 323.7ms | 8.2ms | 6 |
| node | `module:client-only-stub` | 3 | 317.8ms | 88.9ms | -72.0% | 88.9ms | 51.6ms | 3 |
| node | `manifest:transform` | 3 | 129.5ms | 124.0ms | -4.2% | 124.0ms | 45.4ms | 3 |
| web | `manifest:stage` | 9 | 46.6ms | 36.3ms | -22.1% | 36.3ms | 7.1ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |
| node | `assets:relocate-ssr-only` | 6 | - | 1.4ms | - | 1.4ms | 0.4ms | 6 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1293 | 708.4ms | 657.6ms | -7.2% | 657.6ms | 16.6ms | 13 |
| node | `route:module` | 1290 | 281.3ms | 291.6ms | +3.7% | 291.6ms | 3.4ms | 10 |
| web | `route:client-entry` | 1293 | 196.6ms | 199.3ms | +1.4% | 199.3ms | 5.3ms | 13 |
| node | `manifest:transform` | 5 | 64.9ms | 72.5ms | +11.7% | 72.5ms | 16.5ms | 5 |
| node | `module:client-only-stub` | 5 | 42.5ms | 9.9ms | -76.7% | 9.9ms | 2.3ms | 5 |
| web | `manifest:stage` | 18 | 19.8ms | 15.2ms | -23.2% | 15.2ms | 1.3ms | 18 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 13 | - | 3.5ms | - | 3.5ms | 0.4ms | 13 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 683.0ms | 650.7ms | -4.7% | 650.7ms | 17.7ms | 10 |
| node | `route:module` | 1290 | 275.7ms | 257.9ms | -6.5% | 257.9ms | 4.9ms | 10 |
| web | `route:client-entry` | 1290 | 202.1ms | 184.9ms | -8.5% | 184.9ms | 5.1ms | 10 |
| node | `module:client-only-stub` | 5 | 87.8ms | 14.1ms | -83.9% | 14.1ms | 4.4ms | 5 |
| node | `manifest:transform` | 5 | 85.2ms | 72.7ms | -14.7% | 72.7ms | 19.2ms | 5 |
| web | `manifest:stage` | 15 | 13.8ms | 13.0ms | -5.8% | 13.0ms | 1.3ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.2ms | - | 2.2ms | 0.4ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1292 | 696.4ms | 603.7ms | -13.3% | 603.7ms | 16.5ms | 12 |
| node | `route:module` | 1290 | 283.7ms | 260.4ms | -8.2% | 260.4ms | 4.7ms | 10 |
| web | `route:client-entry` | 1292 | 206.3ms | 195.6ms | -5.2% | 195.6ms | 5.2ms | 12 |
| node | `manifest:transform` | 5 | 88.4ms | 64.4ms | -27.1% | 64.4ms | 18.8ms | 5 |
| node | `module:client-only-stub` | 5 | 55.1ms | 13.6ms | -75.3% | 13.6ms | 5.4ms | 5 |
| web | `manifest:stage` | 17 | 14.0ms | 14.7ms | +5.0% | 14.7ms | 1.6ms | 17 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 12 | - | 2.2ms | - | 2.2ms | 0.3ms | 12 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 250 | 250.8ms | 190.9ms | -23.9% | 190.9ms | 7.7ms | 10 |
| node | `route:module` | 250 | 81.6ms | 65.8ms | -19.4% | 65.8ms | 0.5ms | 10 |
| web | `route:client-entry` | 250 | 57.8ms | 44.2ms | -23.5% | 44.2ms | 2.0ms | 10 |
| node | `module:client-only-stub` | 5 | 44.8ms | 30.7ms | -31.5% | 30.7ms | 8.6ms | 5 |
| node | `manifest:transform` | 5 | 27.0ms | 22.9ms | -15.2% | 22.9ms | 6.3ms | 5 |
| web | `manifest:stage` | 15 | 3.6ms | 3.8ms | +5.6% | 3.8ms | 0.4ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.2ms | - | 2.2ms | 0.4ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 115.69s | 120.51s | +4.2% | 120.67s | - | 0.96x | - |
| complex app | 3 | 78.66s | 87.87s | +11.7% | 87.85s | - | 0.90x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 101.82s | 104.03s | +2.2% | 90.86s | 92.91s | 2.98s | 3.04s | 3.36s | 3.39s | +1.0% | 104.56s | - | 0.98x | - |

Profile: `ci-small+ci-large`; mode: `dev`; iterations: `5`; warmup: `1`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29136160075)

