<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `fbe35ce` against base `7bb55da`.

### Reading benchmark confidence

Raw deltas are always shown. The signal label only indicates whether the observed median delta is larger than a robust run-to-run noise band; it does not erase or replace the measurement.

The noise band is the larger of 2% or two combined robust standard deviations estimated from each side's relative median absolute deviation (rMAD). Fewer than three finite samples is reported as insufficient data. An inconclusive result should be rerun or investigated from the uploaded raw samples before drawing a performance conclusion.

| Benchmark | Runs | Base total | Head total | Delta | Base rMAD | Head rMAD | Noise band | Signal |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| `large-355-ssr-esm (build)` | 3 | 8.93s | 10.35s | +15.9% | 1.0% | 0.5% | ±3.3% | 🔴 regression |
| `synthetic-1024-ssr-esm (build)` | 3 | 4.16s | 4.34s | +4.4% | 0.2% | 0.1% | ±2.0% | 🔴 regression |
| `synthetic-1024-ssr-esm-split (build)` | 3 | 5.55s | 6.35s | +14.5% | 0.0% | 0.4% | ±2.0% | 🔴 regression |
| `synthetic-256-sourcemaps (build)` | 5 | 2.24s | 2.37s | +5.9% | 1.0% | 0.6% | ±3.6% | 🔴 regression |
| `synthetic-256-ssr-esm (build)` | 5 | 2.11s | 2.18s | +3.0% | 1.6% | 1.2% | ±5.8% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (build)` | 5 | 2.51s | 2.71s | +8.2% | 0.4% | 0.3% | ±2.0% | 🔴 regression |
| `synthetic-48-ssr-esm (build)` | 5 | 1.36s | 1.41s | +3.4% | 1.9% | 0.2% | ±5.5% | ⚪ inconclusive |
| `large-355-ssr-esm (dev)` | 3 | 17.02s | 18.98s | +11.5% | 1.0% | 0.4% | ±3.1% | 🔴 regression |
| `synthetic-1024-ssr-esm (dev)` | 3 | 4.93s | 4.97s | +0.8% | 1.9% | 0.9% | ±6.1% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (dev)` | 3 | 4.77s | 4.93s | +3.2% | 1.1% | 0.1% | ±3.1% | 🔴 regression |
| `synthetic-256-sourcemaps (dev)` | 5 | 2.12s | 2.26s | +6.7% | 0.1% | 1.3% | ±4.0% | 🔴 regression |
| `synthetic-256-ssr-esm (dev)` | 5 | 1.87s | 2.01s | +7.1% | 1.6% | 1.5% | ±6.5% | 🔴 regression |
| `synthetic-256-ssr-esm-split (dev)` | 5 | 1.85s | 2.03s | +10.0% | 1.0% | 2.0% | ±6.7% | 🔴 regression |
| `synthetic-48-ssr-esm (dev)` | 5 | 0.96s | 1.02s | +6.3% | 0.6% | 0.7% | ±2.8% | 🔴 regression |
| `complex app (cold)` | 3 | 111.67s | 116.96s | +4.7% | 0.2% | 0.1% | ±2.0% | 🔴 regression |
| `complex app (dev)` | 3 | 98.14s | 101.52s | +3.4% | 0.2% | 0.1% | ±2.0% | 🔴 regression |
| `complex app (warm)` | 3 | 76.60s | 85.02s | +11.0% | 0.0% | 0.5% | ±2.0% | 🔴 regression |

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 33.52s | 36.20s | +8.0% | 19.42s | 22.51s | +15.9% | 3.99s | 4.08s | +2.2% | 2.97s | 2.81s | -5.4% | 0.93x |
| Large app | 1 | 17.02s | 18.98s | +11.5% | 8.46s | 10.43s | +23.2% | 2.03s | 2.01s | -0.9% | 1.78s | 1.82s | +2.5% | 0.90x |
| Standard fixtures | 6 | 16.50s | 17.22s | +4.3% | 10.96s | 12.08s | +10.3% | 1.96s | 2.06s | +5.5% | 1.19s | 0.99s | -17.1% | 0.96x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 8.93s | 10.35s | +15.9% | 10.37s | 10.47s | 0.86x | 1600 MB |
| `synthetic-1024-ssr-esm` | 3 | 4.16s | 4.34s | +4.4% | 4.33s | 4.34s | 0.96x | 599 MB |
| `synthetic-1024-ssr-esm-split` | 3 | 5.55s | 6.35s | +14.5% | 6.35s | 6.38s | 0.87x | 761 MB |
| `synthetic-256-sourcemaps` | 5 | 2.24s | 2.37s | +5.9% | 2.37s | 2.40s | 0.94x | 454 MB |
| `synthetic-256-ssr-esm` | 5 | 2.11s | 2.18s | +3.0% | 2.18s | 2.22s | 0.97x | 428 MB |
| `synthetic-256-ssr-esm-split` | 5 | 2.51s | 2.71s | +8.2% | 2.74s | 2.78s | 0.92x | 466 MB |
| `synthetic-48-ssr-esm` | 5 | 1.36s | 1.41s | +3.4% | 1.41s | 1.41s | 0.97x | 303 MB |

### ci-small+ci-large Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `ci-small+ci-large` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 17.02s | 18.98s | +11.5% | 8.46s | 10.43s | 2.03s | 2.01s | 1.78s | 1.82s | +2.5% | 18.97s | 19.05s | 0.90x | - |
| `synthetic-1024-ssr-esm` | 3 | 4.93s | 4.97s | +0.8% | 3.13s | 3.38s | 0.55s | 0.60s | 0.35s | 0.30s | -14.0% | 4.99s | 5.06s | 0.99x | - |
| `synthetic-1024-ssr-esm-split` | 3 | 4.77s | 4.93s | +3.2% | 3.06s | 3.34s | 0.55s | 0.60s | 0.35s | 0.30s | -14.2% | 4.95s | 4.99s | 0.97x | - |
| `synthetic-256-sourcemaps` | 5 | 2.12s | 2.26s | +6.7% | 1.52s | 1.70s | 0.26s | 0.23s | 0.15s | 0.13s | -16.6% | 2.29s | 2.36s | 0.94x | - |
| `synthetic-256-ssr-esm` | 5 | 1.87s | 2.01s | +7.1% | 1.30s | 1.46s | 0.24s | 0.24s | 0.13s | 0.10s | -20.7% | 2.01s | 2.07s | 0.93x | - |
| `synthetic-256-ssr-esm-split` | 5 | 1.85s | 2.03s | +10.0% | 1.28s | 1.48s | 0.24s | 0.25s | 0.15s | 0.10s | -33.5% | 2.03s | 2.11s | 0.91x | - |
| `synthetic-48-ssr-esm` | 5 | 0.96s | 1.02s | +6.3% | 0.66s | 0.72s | 0.13s | 0.14s | 0.05s | 0.05s | -1.9% | 1.02s | 1.03s | 0.94x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1071 | 472642.3ms | 356603.8ms | -24.6% | 2014.9ms | 613.1ms | 6 |
| node | `route:module` | 1071 | 99811.9ms | 99218.4ms | -0.6% | 645.8ms | 162.1ms | 6 |
| web | `route:client-entry` | 1071 | 59094.0ms | 123766.2ms | +109.4% | 680.6ms | 209.6ms | 6 |
| node | `manifest:transform` | 3 | 82.2ms | 102.4ms | +24.6% | 102.4ms | 41.3ms | 3 |
| web | `manifest:stage` | 9 | 13.8ms | 12.1ms | -12.3% | 12.1ms | 1.9ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |
| node | `assets:relocate-ssr-only` | 6 | - | 82.7ms | - | 82.7ms | 14.6ms | 6 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 769551.2ms | 694838.7ms | -9.7% | 1851.2ms | 346.7ms | 6 |
| web | `route:client-entry` | 3078 | 332230.7ms | 535240.5ms | +61.1% | 1196.6ms | 317.1ms | 6 |
| node | `route:module` | 3078 | 264283.1ms | 242340.0ms | -8.3% | 991.0ms | 153.5ms | 6 |
| node | `module:client-only-stub` | 3 | 163.1ms | 79.8ms | -51.1% | 79.8ms | 31.6ms | 3 |
| node | `manifest:transform` | 3 | 152.6ms | 137.8ms | -9.7% | 137.8ms | 51.9ms | 3 |
| web | `manifest:stage` | 9 | 43.2ms | 38.3ms | -11.3% | 38.3ms | 7.7ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |
| node | `assets:relocate-ssr-only` | 9 | - | 2.6ms | - | 2.6ms | 0.5ms | 9 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 713679.1ms | 673086.0ms | -5.7% | 1868.1ms | 351.7ms | 6 |
| node | `route:module` | 3078 | 352218.5ms | 298241.6ms | -15.3% | 869.1ms | 245.8ms | 6 |
| web | `route:client-entry` | 3078 | 344924.1ms | 503160.5ms | +45.9% | 1185.6ms | 326.5ms | 6 |
| node | `manifest:transform` | 3 | 169.5ms | 138.1ms | -18.5% | 138.1ms | 52.6ms | 3 |
| node | `module:client-only-stub` | 3 | 90.6ms | 111.5ms | +23.1% | 111.5ms | 57.7ms | 3 |
| web | `manifest:stage` | 9 | 38.2ms | 40.7ms | +6.5% | 40.7ms | 6.6ms | 9 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |
| node | `assets:relocate-ssr-only` | 8 | - | 2.0ms | - | 2.0ms | 0.4ms | 8 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 725.8ms | 685.4ms | -5.6% | 685.4ms | 11.4ms | 10 |
| node | `route:module` | 1290 | 300.0ms | 325.5ms | +8.5% | 325.5ms | 4.8ms | 10 |
| web | `route:client-entry` | 1290 | 206.9ms | 209.4ms | +1.2% | 209.4ms | 6.6ms | 10 |
| node | `manifest:transform` | 5 | 91.6ms | 85.0ms | -7.2% | 85.0ms | 21.6ms | 5 |
| node | `module:client-only-stub` | 5 | 57.2ms | 17.8ms | -68.9% | 17.8ms | 5.1ms | 5 |
| web | `manifest:stage` | 16 | 16.5ms | 13.3ms | -19.4% | 13.3ms | 1.3ms | 16 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 11 | - | 3.0ms | - | 3.0ms | 0.4ms | 11 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1290 | 682.5ms | 649.2ms | -4.9% | 649.2ms | 17.2ms | 10 |
| node | `route:module` | 1290 | 274.6ms | 272.9ms | -0.6% | 272.9ms | 5.1ms | 10 |
| web | `route:client-entry` | 1290 | 217.9ms | 218.4ms | +0.2% | 218.4ms | 7.3ms | 10 |
| node | `manifest:transform` | 5 | 89.0ms | 93.0ms | +4.5% | 93.0ms | 21.6ms | 5 |
| node | `module:client-only-stub` | 5 | 78.1ms | 11.3ms | -85.5% | 11.3ms | 2.5ms | 5 |
| web | `manifest:stage` | 15 | 17.0ms | 13.4ms | -21.2% | 13.4ms | 1.3ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.1ms | - | 2.1ms | 0.4ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1291 | 677.8ms | 668.8ms | -1.3% | 668.8ms | 12.4ms | 11 |
| node | `route:module` | 1290 | 281.5ms | 294.8ms | +4.7% | 294.8ms | 12.0ms | 10 |
| web | `route:client-entry` | 1291 | 201.7ms | 197.0ms | -2.3% | 197.0ms | 5.6ms | 11 |
| node | `module:client-only-stub` | 5 | 128.6ms | 11.0ms | -91.4% | 11.0ms | 2.6ms | 5 |
| node | `manifest:transform` | 5 | 75.6ms | 83.2ms | +10.1% | 83.2ms | 25.6ms | 5 |
| web | `manifest:stage` | 16 | 14.8ms | 14.2ms | -4.1% | 14.2ms | 1.3ms | 16 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 11 | - | 2.6ms | - | 2.6ms | 0.4ms | 11 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 250 | 261.3ms | 193.9ms | -25.8% | 193.9ms | 8.3ms | 10 |
| node | `route:module` | 250 | 91.5ms | 68.9ms | -24.7% | 68.9ms | 0.6ms | 10 |
| web | `route:client-entry` | 250 | 60.2ms | 46.3ms | -23.1% | 46.3ms | 2.0ms | 10 |
| node | `module:client-only-stub` | 5 | 59.8ms | 50.0ms | -16.4% | 50.0ms | 17.2ms | 5 |
| node | `manifest:transform` | 5 | 28.5ms | 26.8ms | -6.0% | 26.8ms | 6.3ms | 5 |
| web | `manifest:stage` | 15 | 3.7ms | 4.0ms | +8.1% | 4.0ms | 0.4ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.4ms | - | 2.4ms | 0.4ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 111.67s | 116.96s | +4.7% | 117.41s | - | 0.95x | - |
| complex app | 3 | 76.60s | 85.02s | +11.0% | 85.09s | - | 0.90x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 98.14s | 101.52s | +3.4% | 87.49s | 90.68s | 2.83s | 2.95s | 3.24s | 3.25s | +0.2% | 101.35s | - | 0.97x | - |

Profile: `ci-small+ci-large`; mode: `dev`; iterations: `5`; warmup: `1`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29792804631)

