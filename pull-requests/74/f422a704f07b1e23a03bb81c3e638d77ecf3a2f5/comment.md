<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `f422a70` against base `c93ec98`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.47s | 41.18s | +39.7% | 19.72s | 21.28s | +7.9% | 3.97s | 4.35s | +9.7% | 3.27s | 3.59s | +10.0% | 0.72x |
| Large app | 1 | 13.83s | 17.39s | +25.8% | 8.44s | 9.25s | +9.5% | 2.01s | 2.23s | +10.8% | 1.75s | 2.00s | +14.4% | 0.80x |
| Standard fixtures | 6 | 15.65s | 23.79s | +52.1% | 11.28s | 12.03s | +6.7% | 1.96s | 2.12s | +8.6% | 1.52s | 1.59s | +5.0% | 0.66x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.71s | 9.52s | +9.3% | 9.57s | 9.86s | 0.92x | 1518 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.18s | 4.35s | +3.9% | 4.34s | 4.49s | 0.96x | 623 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.57s | 6.06s | +8.9% | 6.12s | 6.34s | 0.92x | 811 MB |
| `synthetic-256-sourcemaps` | 10 | 2.17s | 2.34s | +7.8% | 2.37s | 2.55s | 0.93x | 433 MB |
| `synthetic-256-ssr-esm` | 10 | 2.02s | 2.14s | +5.8% | 2.14s | 2.24s | 0.95x | 407 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.44s | 2.64s | +8.4% | 2.66s | 2.92s | 0.92x | 439 MB |
| `synthetic-48-ssr-esm` | 10 | 1.35s | 1.41s | +4.2% | 1.43s | 1.69s | 0.96x | 318 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.83s | 17.39s | +25.8% | 8.44s | 9.25s | 2.01s | 2.23s | 1.75s | 2.00s | +14.4% | 17.57s | 18.39s | 0.80x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.63s | 7.27s | +57.2% | 3.30s | 3.48s | 0.56s | 0.59s | 0.50s | 0.56s | +10.2% | 7.31s | 7.48s | 0.64x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.60s | 7.41s | +61.3% | 3.29s | 3.54s | 0.54s | 0.59s | 0.51s | 0.55s | +9.1% | 7.42s | 7.54s | 0.62x | - |
| `synthetic-256-sourcemaps` | 10 | 2.00s | 3.21s | +60.3% | 1.50s | 1.64s | 0.25s | 0.26s | 0.15s | 0.15s | +0.3% | 3.18s | 3.39s | 0.62x | - |
| `synthetic-256-ssr-esm` | 10 | 1.76s | 2.38s | +35.7% | 1.27s | 1.35s | 0.24s | 0.27s | 0.15s | 0.13s | -15.5% | 2.36s | 2.41s | 0.74x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.75s | 2.39s | +36.5% | 1.26s | 1.32s | 0.23s | 0.27s | 0.15s | 0.13s | -15.7% | 2.38s | 2.42s | 0.73x | - |
| `synthetic-48-ssr-esm` | 10 | 0.91s | 1.13s | +23.3% | 0.66s | 0.70s | 0.13s | 0.14s | 0.05s | 0.08s | +48.5% | 1.12s | 1.16s | 0.81x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1713.2ms | 1823.6ms | +6.4% | 1823.6ms | 28.8ms | 10 |
| node | `route:module` | 1785 | 910.1ms | 959.8ms | +5.5% | 959.8ms | 14.4ms | 10 |
| web | `route:client-entry` | 1785 | 380.3ms | 450.2ms | +18.4% | 450.2ms | 10.2ms | 10 |
| node | `manifest:transform` | 5 | 141.8ms | 167.4ms | +18.1% | 167.4ms | 48.7ms | 5 |
| web | `manifest:stage` | 15 | 14.4ms | 22.5ms | +56.3% | 22.5ms | 2.7ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 146.4ms | - | 146.4ms | 15.8ms | 10 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2035.1ms | 2130.1ms | +4.7% | 2130.1ms | 23.7ms | 10 |
| node | `route:module` | 5130 | 921.3ms | 1103.1ms | +19.7% | 1103.1ms | 18.1ms | 10 |
| web | `route:client-entry` | 5130 | 627.2ms | 635.5ms | +1.3% | 635.5ms | 9.6ms | 10 |
| node | `manifest:transform` | 5 | 208.2ms | 223.4ms | +7.3% | 223.4ms | 48.5ms | 5 |
| node | `module:client-only-stub` | 5 | 103.1ms | 396.8ms | +284.9% | 396.8ms | 163.3ms | 5 |
| web | `manifest:stage` | 15 | 59.4ms | 62.6ms | +5.4% | 62.6ms | 7.0ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.1ms | - | 2.1ms | 0.4ms | 10 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2056.4ms | 2111.8ms | +2.7% | 2111.8ms | 12.0ms | 10 |
| node | `route:module` | 5130 | 919.2ms | 998.7ms | +8.6% | 998.7ms | 17.3ms | 10 |
| web | `route:client-entry` | 5130 | 603.6ms | 635.3ms | +5.3% | 635.3ms | 7.9ms | 10 |
| node | `module:client-only-stub` | 5 | 469.5ms | 157.5ms | -66.5% | 157.5ms | 82.3ms | 5 |
| node | `manifest:transform` | 5 | 204.7ms | 266.4ms | +30.1% | 266.4ms | 78.5ms | 5 |
| web | `manifest:stage` | 15 | 60.7ms | 64.8ms | +6.8% | 64.8ms | 7.0ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.5ms | - | 2.5ms | 0.6ms | 10 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1410.9ms | 1498.6ms | +6.2% | 1498.6ms | 12.1ms | 20 |
| node | `route:module` | 2580 | 598.2ms | 736.2ms | +23.1% | 736.2ms | 7.1ms | 20 |
| web | `route:client-entry` | 2580 | 397.2ms | 439.4ms | +10.6% | 439.4ms | 7.8ms | 20 |
| node | `module:client-only-stub` | 10 | 244.6ms | 253.0ms | +3.4% | 253.0ms | 94.6ms | 10 |
| node | `manifest:transform` | 10 | 145.5ms | 173.0ms | +18.9% | 173.0ms | 22.3ms | 10 |
| web | `manifest:stage` | 30 | 20.1ms | 30.4ms | +51.2% | 30.4ms | 1.6ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 7.7ms | - | 7.7ms | 2.0ms | 20 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1358.0ms | 1384.0ms | +1.9% | 1384.0ms | 22.9ms | 21 |
| node | `route:module` | 2580 | 553.6ms | 598.7ms | +8.1% | 598.7ms | 5.9ms | 20 |
| web | `route:client-entry` | 2581 | 383.5ms | 417.2ms | +8.8% | 417.2ms | 7.6ms | 21 |
| node | `module:client-only-stub` | 10 | 195.5ms | 228.5ms | +16.9% | 228.5ms | 66.0ms | 10 |
| node | `manifest:transform` | 10 | 151.0ms | 190.7ms | +26.3% | 190.7ms | 24.5ms | 10 |
| web | `manifest:stage` | 31 | 20.2ms | 30.4ms | +50.5% | 30.4ms | 1.8ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 4.6ms | - | 4.6ms | 0.4ms | 21 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1325.3ms | 1381.9ms | +4.3% | 1381.9ms | 10.6ms | 21 |
| node | `route:module` | 2580 | 542.4ms | 634.9ms | +17.1% | 634.9ms | 6.7ms | 20 |
| web | `route:client-entry` | 2581 | 380.0ms | 412.0ms | +8.4% | 412.0ms | 7.9ms | 21 |
| node | `manifest:transform` | 10 | 179.8ms | 207.0ms | +15.1% | 207.0ms | 32.9ms | 10 |
| node | `module:client-only-stub` | 10 | 131.9ms | 190.3ms | +44.3% | 190.3ms | 56.4ms | 10 |
| web | `manifest:stage` | 31 | 20.6ms | 32.0ms | +55.3% | 32.0ms | 2.2ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 1.1ms | +10.0% | 1.1ms | 0.2ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 4.8ms | - | 4.8ms | 0.5ms | 21 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 487.5ms | 500.9ms | +2.7% | 500.9ms | 12.7ms | 20 |
| node | `route:module` | 500 | 163.8ms | 153.0ms | -6.6% | 153.0ms | 0.7ms | 20 |
| web | `route:client-entry` | 500 | 107.7ms | 94.3ms | -12.4% | 94.3ms | 2.3ms | 20 |
| node | `module:client-only-stub` | 10 | 76.8ms | 84.3ms | +9.8% | 84.3ms | 14.9ms | 10 |
| node | `manifest:transform` | 10 | 50.2ms | 48.6ms | -3.2% | 48.6ms | 6.6ms | 10 |
| web | `manifest:stage` | 30 | 5.5ms | 8.0ms | +45.5% | 8.0ms | 0.4ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 4.5ms | - | 4.5ms | 0.4ms | 20 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 113.46s | 120.48s | +6.2% | 120.48s | - | 0.94x | - |
| complex app | 2 | 78.98s | 78.79s | -0.2% | 78.79s | - | 1.00x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 96.87s | 99.18s | +2.4% | 88.10s | 86.91s | 2.88s | 3.01s | 3.29s | 3.23s | -1.9% | 99.18s | - | 0.98x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28691377427)

