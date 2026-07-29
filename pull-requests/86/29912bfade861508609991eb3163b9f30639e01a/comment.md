<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `29912bf` against base `94ed3cc`.

### Reading benchmark confidence

Raw deltas are always shown. The signal label only indicates whether the observed median delta is larger than a robust run-to-run noise band; it does not erase or replace the measurement.

The noise band is the larger of 2% or two combined robust standard deviations estimated from each side's relative median absolute deviation (rMAD). Fewer than three finite samples is reported as insufficient data. An inconclusive result should be rerun or investigated from the uploaded raw samples before drawing a performance conclusion.

| Benchmark | Runs | Base total | Head total | Delta | Base rMAD | Head rMAD | Noise band | Signal |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| `large-355-ssr-esm (build)` | 3 | 8.92s | 8.74s | -2.0% | 0.8% | 0.3% | ±2.5% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm (build)` | 3 | 4.28s | 4.38s | +2.4% | 1.5% | 1.2% | ±5.6% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (build)` | 3 | 5.71s | 5.82s | +1.9% | 0.8% | 0.9% | ±3.5% | ⚪ inconclusive |
| `synthetic-256-sourcemaps (build)` | 5 | 2.13s | 2.10s | -1.4% | 0.2% | 0.2% | ±2.0% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (build)` | 5 | 2.01s | 1.95s | -2.8% | 0.2% | 0.9% | ±2.6% | 🟢 improvement |
| `synthetic-256-ssr-esm-split (build)` | 5 | 2.37s | 2.28s | -3.6% | 1.6% | 0.0% | ±4.6% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (build)` | 5 | 1.32s | 1.32s | +0.2% | 0.4% | 2.1% | ±6.2% | ⚪ inconclusive |
| `large-355-ssr-esm (dev)` | 3 | 14.66s | 14.71s | +0.3% | 0.6% | 0.1% | ±2.0% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm (dev)` | 3 | 4.67s | 4.62s | -1.1% | 0.3% | 0.8% | ±2.5% | ⚪ inconclusive |
| `synthetic-1024-ssr-esm-split (dev)` | 3 | 4.66s | 4.60s | -1.4% | 1.5% | 1.7% | ±6.7% | ⚪ inconclusive |
| `synthetic-256-sourcemaps (dev)` | 5 | 1.84s | 1.80s | -1.8% | 0.5% | 0.7% | ±2.5% | ⚪ inconclusive |
| `synthetic-256-ssr-esm (dev)` | 5 | 1.68s | 1.67s | -0.5% | 1.3% | 1.1% | ±5.1% | ⚪ inconclusive |
| `synthetic-256-ssr-esm-split (dev)` | 5 | 1.70s | 1.66s | -2.4% | 0.4% | 1.5% | ±4.5% | ⚪ inconclusive |
| `synthetic-48-ssr-esm (dev)` | 5 | 0.89s | 0.87s | -2.6% | 1.8% | 1.4% | ±6.9% | ⚪ inconclusive |
| `complex app (cold)` | 3 | 111.61s | 118.72s | +6.4% | 0.4% | 0.6% | ±2.1% | 🔴 regression |
| `complex app (dev)` | 3 | 102.23s | 103.60s | +1.3% | 0.3% | 0.3% | ±2.0% | ⚪ inconclusive |
| `complex app (warm)` | 3 | 83.64s | 84.45s | +1.0% | 0.4% | 0.9% | ±2.9% | ⚪ inconclusive |

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 30.11s | 29.93s | -0.6% | 18.79s | 18.77s | -0.1% | 4.04s | 3.95s | -2.2% | 2.63s | 2.68s | +1.8% | 1.01x |
| Large app | 1 | 14.66s | 14.71s | +0.3% | 8.04s | 8.06s | +0.3% | 1.98s | 2.02s | +1.9% | 1.57s | 1.57s | +0.0% | 1.00x |
| Standard fixtures | 6 | 15.44s | 15.22s | -1.4% | 10.75s | 10.71s | -0.4% | 2.05s | 1.93s | -6.2% | 1.06s | 1.11s | +4.3% | 1.01x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 8.92s | 8.74s | -2.0% | 8.77s | 8.84s | 1.02x | 1435 MB |
| `synthetic-1024-ssr-esm` | 3 | 4.28s | 4.38s | +2.4% | 4.40s | 4.50s | 0.98x | 550 MB |
| `synthetic-1024-ssr-esm-split` | 3 | 5.71s | 5.82s | +1.9% | 5.78s | 5.87s | 0.98x | 643 MB |
| `synthetic-256-sourcemaps` | 5 | 2.13s | 2.10s | -1.4% | 2.10s | 2.11s | 1.01x | 401 MB |
| `synthetic-256-ssr-esm` | 5 | 2.01s | 1.95s | -2.8% | 1.95s | 1.97s | 1.03x | 347 MB |
| `synthetic-256-ssr-esm-split` | 5 | 2.37s | 2.28s | -3.6% | 2.29s | 2.33s | 1.04x | 371 MB |
| `synthetic-48-ssr-esm` | 5 | 1.32s | 1.32s | +0.2% | 1.32s | 1.36s | 1.00x | 295 MB |

### ci-small+ci-large Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `ci-small+ci-large` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 3 | 14.66s | 14.71s | +0.3% | 8.04s | 8.06s | 1.98s | 2.02s | 1.57s | 1.57s | +0.0% | 14.71s | 14.73s | 1.00x | - |
| `synthetic-1024-ssr-esm` | 3 | 4.67s | 4.62s | -1.1% | 3.27s | 3.26s | 0.59s | 0.55s | 0.35s | 0.35s | +0.1% | 4.61s | 4.66s | 1.01x | - |
| `synthetic-1024-ssr-esm-split` | 3 | 4.66s | 4.60s | -1.4% | 3.19s | 3.24s | 0.61s | 0.55s | 0.33s | 0.35s | +7.2% | 4.61s | 4.70s | 1.01x | - |
| `synthetic-256-sourcemaps` | 5 | 1.84s | 1.80s | -1.8% | 1.32s | 1.30s | 0.24s | 0.22s | 0.13s | 0.13s | +0.8% | 1.80s | 1.82s | 1.02x | - |
| `synthetic-256-ssr-esm` | 5 | 1.68s | 1.67s | -0.5% | 1.16s | 1.15s | 0.25s | 0.24s | 0.10s | 0.13s | +20.7% | 1.68s | 1.74s | 1.01x | - |
| `synthetic-256-ssr-esm-split` | 5 | 1.70s | 1.66s | -2.4% | 1.19s | 1.15s | 0.24s | 0.24s | 0.10s | 0.10s | -0.1% | 1.67s | 1.70s | 1.02x | - |
| `synthetic-48-ssr-esm` | 5 | 0.89s | 0.87s | -2.6% | 0.63s | 0.61s | 0.12s | 0.12s | 0.05s | 0.05s | -0.7% | 0.87s | 0.88s | 1.03x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1071 | 1062.5ms | 1087.7ms | +2.4% | 1087.7ms | 18.8ms | 6 |
| node | `route:module` | 1071 | 614.2ms | 528.7ms | -13.9% | 528.7ms | 10.4ms | 6 |
| web | `route:client-entry` | 1071 | 260.6ms | 242.6ms | -6.9% | 242.6ms | 5.0ms | 6 |
| node | `manifest:transform` | 3 | 70.3ms | 90.6ms | +28.9% | 90.6ms | 43.0ms | 3 |
| web | `manifest:stage` | 6 | 8.6ms | 8.6ms | 0.0% | 8.6ms | 1.9ms | 6 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1293.5ms | 1277.5ms | -1.2% | 1277.5ms | 19.5ms | 6 |
| node | `route:module` | 3078 | 552.6ms | 562.6ms | +1.8% | 562.6ms | 6.3ms | 6 |
| web | `route:client-entry` | 3078 | 365.2ms | 398.4ms | +9.1% | 398.4ms | 6.3ms | 6 |
| node | `manifest:transform` | 3 | 122.5ms | 128.0ms | +4.5% | 128.0ms | 46.9ms | 3 |
| node | `module:client-only-stub` | 3 | 46.4ms | 138.8ms | +199.1% | 138.8ms | 63.1ms | 3 |
| web | `manifest:stage` | 6 | 34.6ms | 28.1ms | -18.8% | 28.1ms | 6.6ms | 6 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 3078 | 1210.7ms | 1271.2ms | +5.0% | 1271.2ms | 25.8ms | 6 |
| node | `route:module` | 3078 | 564.8ms | 602.4ms | +6.7% | 602.4ms | 12.3ms | 6 |
| web | `route:client-entry` | 3078 | 378.1ms | 407.4ms | +7.7% | 407.4ms | 6.2ms | 6 |
| node | `manifest:transform` | 3 | 133.4ms | 144.0ms | +7.9% | 144.0ms | 62.1ms | 3 |
| node | `module:client-only-stub` | 3 | 48.8ms | 142.1ms | +191.2% | 142.1ms | 104.5ms | 3 |
| web | `manifest:stage` | 6 | 28.2ms | 29.7ms | +5.3% | 29.7ms | 7.9ms | 6 |
| web | `manifest:transform` | 3 | 0.3ms | 0.3ms | 0.0% | 0.3ms | 0.1ms | 3 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1291 | 703.3ms | 755.7ms | +7.5% | 755.7ms | 12.4ms | 11 |
| node | `route:module` | 1290 | 311.5ms | 310.0ms | -0.5% | 310.0ms | 8.8ms | 10 |
| web | `route:client-entry` | 1291 | 189.9ms | 197.1ms | +3.8% | 197.1ms | 5.2ms | 11 |
| node | `manifest:transform` | 5 | 68.5ms | 66.9ms | -2.3% | 66.9ms | 20.5ms | 5 |
| node | `module:client-only-stub` | 5 | 43.1ms | 107.8ms | +150.1% | 107.8ms | 54.2ms | 5 |
| web | `manifest:stage` | 11 | 11.7ms | 11.5ms | -1.7% | 11.5ms | 1.5ms | 11 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1291 | 687.1ms | 695.6ms | +1.2% | 695.6ms | 13.5ms | 11 |
| node | `route:module` | 1290 | 279.7ms | 272.3ms | -2.6% | 272.3ms | 4.9ms | 10 |
| web | `route:client-entry` | 1291 | 200.7ms | 190.8ms | -4.9% | 190.8ms | 3.7ms | 11 |
| node | `module:client-only-stub` | 5 | 134.0ms | 61.4ms | -54.2% | 61.4ms | 33.2ms | 5 |
| node | `manifest:transform` | 5 | 78.5ms | 63.7ms | -18.9% | 63.7ms | 16.5ms | 5 |
| web | `manifest:stage` | 11 | 10.7ms | 11.7ms | +9.3% | 11.7ms | 1.5ms | 11 |
| web | `manifest:transform` | 5 | 0.4ms | 0.5ms | +25.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1291 | 689.1ms | 689.4ms | +0.0% | 689.4ms | 9.9ms | 11 |
| node | `route:module` | 1290 | 292.5ms | 296.9ms | +1.5% | 296.9ms | 5.1ms | 10 |
| web | `route:client-entry` | 1291 | 202.8ms | 181.0ms | -10.7% | 181.0ms | 3.7ms | 11 |
| node | `manifest:transform` | 5 | 82.2ms | 88.0ms | +7.1% | 88.0ms | 21.3ms | 5 |
| node | `module:client-only-stub` | 5 | 52.4ms | 211.3ms | +303.2% | 211.3ms | 145.1ms | 5 |
| web | `manifest:stage` | 11 | 10.7ms | 11.9ms | +11.2% | 11.9ms | 1.8ms | 11 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 250 | 222.1ms | 192.9ms | -13.1% | 192.9ms | 7.9ms | 10 |
| node | `route:module` | 250 | 84.1ms | 81.8ms | -2.7% | 81.8ms | 1.4ms | 10 |
| web | `route:client-entry` | 250 | 58.7ms | 49.8ms | -15.2% | 49.8ms | 3.3ms | 10 |
| node | `module:client-only-stub` | 5 | 29.6ms | 51.1ms | +72.6% | 51.1ms | 16.2ms | 5 |
| node | `manifest:transform` | 5 | 29.1ms | 25.0ms | -14.1% | 25.0ms | 5.9ms | 5 |
| web | `manifest:stage` | 10 | 2.7ms | 2.6ms | -3.7% | 2.6ms | 0.4ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 111.61s | 118.72s | +6.4% | 118.63s | - | 0.94x | - |
| complex app | 3 | 83.64s | 84.45s | +1.0% | 84.26s | - | 0.99x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 3 | 102.23s | 103.60s | +1.3% | 92.11s | 93.44s | 3.18s | 3.26s | 2.45s | 2.48s | +0.8% | 103.58s | - | 0.99x | - |

Profile: `ci-small+ci-large`; mode: `dev`; iterations: `5`; warmup: `1`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/30414989917)

