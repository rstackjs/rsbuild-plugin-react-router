<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `0871b63` against base `c93ec98`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.47s | 35.24s | +19.6% | 19.72s | 18.53s | -6.0% | 3.97s | 3.65s | -7.9% | 3.27s | 3.02s | -7.5% | 0.84x |
| Large app | 1 | 13.83s | 14.68s | +6.2% | 8.44s | 7.95s | -5.8% | 2.01s | 1.81s | -10.1% | 1.75s | 1.63s | -6.9% | 0.94x |
| Standard fixtures | 6 | 15.65s | 20.56s | +31.4% | 11.28s | 10.58s | -6.2% | 1.96s | 1.85s | -5.7% | 1.52s | 1.39s | -8.2% | 0.76x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.71s | 8.43s | -3.2% | 8.45s | 8.61s | 1.03x | 1520 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.18s | 3.64s | -12.9% | 3.71s | 3.91s | 1.15x | 636 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.57s | 5.11s | -8.2% | 5.11s | 5.20s | 1.09x | 802 MB |
| `synthetic-256-sourcemaps` | 10 | 2.17s | 2.00s | -7.9% | 2.02s | 2.20s | 1.09x | 447 MB |
| `synthetic-256-ssr-esm` | 10 | 2.02s | 1.88s | -7.0% | 1.89s | 2.07s | 1.08x | 394 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.44s | 2.26s | -7.0% | 2.28s | 2.42s | 1.08x | 449 MB |
| `synthetic-48-ssr-esm` | 10 | 1.35s | 1.31s | -2.9% | 1.33s | 1.59s | 1.03x | 322 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.83s | 14.68s | +6.2% | 8.44s | 7.95s | 2.01s | 1.81s | 1.75s | 1.63s | -6.9% | 14.74s | 15.10s | 0.94x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.63s | 6.43s | +39.0% | 3.30s | 3.10s | 0.56s | 0.52s | 0.50s | 0.50s | +0.1% | 6.43s | 6.49s | 0.72x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.60s | 6.44s | +40.1% | 3.29s | 3.07s | 0.54s | 0.53s | 0.51s | 0.50s | -0.5% | 6.44s | 6.54s | 0.71x | - |
| `synthetic-256-sourcemaps` | 10 | 2.00s | 2.65s | +32.5% | 1.50s | 1.43s | 0.25s | 0.22s | 0.15s | 0.13s | -16.9% | 2.64s | 2.72s | 0.75x | - |
| `synthetic-256-ssr-esm` | 10 | 1.76s | 2.03s | +15.5% | 1.27s | 1.17s | 0.24s | 0.22s | 0.15s | 0.10s | -31.4% | 2.02s | 2.07s | 0.87x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.75s | 2.05s | +17.1% | 1.26s | 1.20s | 0.23s | 0.22s | 0.15s | 0.10s | -32.6% | 2.03s | 2.07s | 0.85x | - |
| `synthetic-48-ssr-esm` | 10 | 0.91s | 0.96s | +5.1% | 0.66s | 0.60s | 0.13s | 0.12s | 0.05s | 0.05s | +0.4% | 0.95s | 0.98s | 0.95x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1713.2ms | 1792.4ms | +4.6% | 1792.4ms | 16.7ms | 10 |
| node | `route:module` | 1785 | 910.1ms | 849.9ms | -6.6% | 849.9ms | 13.1ms | 10 |
| web | `route:client-entry` | 1785 | 380.3ms | 483.1ms | +27.0% | 483.1ms | 11.1ms | 10 |
| node | `manifest:transform` | 5 | 141.8ms | 118.5ms | -16.4% | 118.5ms | 32.6ms | 5 |
| web | `manifest:stage` | 15 | 14.4ms | 19.6ms | +36.1% | 19.6ms | 2.0ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 134.1ms | - | 134.1ms | 14.0ms | 10 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2035.1ms | 1957.0ms | -3.8% | 1957.0ms | 13.1ms | 10 |
| node | `route:module` | 5130 | 921.3ms | 1009.1ms | +9.5% | 1009.1ms | 16.4ms | 10 |
| web | `route:client-entry` | 5130 | 627.2ms | 602.4ms | -4.0% | 602.4ms | 8.7ms | 10 |
| node | `manifest:transform` | 5 | 208.2ms | 190.5ms | -8.5% | 190.5ms | 39.9ms | 5 |
| node | `module:client-only-stub` | 5 | 103.1ms | 228.7ms | +121.8% | 228.7ms | 166.9ms | 5 |
| web | `manifest:stage` | 15 | 59.4ms | 61.6ms | +3.7% | 61.6ms | 7.2ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.0ms | - | 2.0ms | 0.3ms | 10 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2056.4ms | 1987.2ms | -3.4% | 1987.2ms | 13.0ms | 10 |
| node | `route:module` | 5130 | 919.2ms | 960.1ms | +4.4% | 960.1ms | 15.0ms | 10 |
| web | `route:client-entry` | 5130 | 603.6ms | 562.3ms | -6.8% | 562.3ms | 8.6ms | 10 |
| node | `module:client-only-stub` | 5 | 469.5ms | 79.4ms | -83.1% | 79.4ms | 20.3ms | 5 |
| node | `manifest:transform` | 5 | 204.7ms | 202.9ms | -0.9% | 202.9ms | 45.5ms | 5 |
| web | `manifest:stage` | 15 | 60.7ms | 60.6ms | -0.2% | 60.6ms | 7.0ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.0ms | - | 2.0ms | 0.3ms | 10 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1410.9ms | 1402.9ms | -0.6% | 1402.9ms | 11.6ms | 20 |
| node | `route:module` | 2580 | 598.2ms | 660.4ms | +10.4% | 660.4ms | 5.6ms | 20 |
| web | `route:client-entry` | 2580 | 397.2ms | 336.1ms | -15.4% | 336.1ms | 6.4ms | 20 |
| node | `module:client-only-stub` | 10 | 244.6ms | 179.0ms | -26.8% | 179.0ms | 107.1ms | 10 |
| node | `manifest:transform` | 10 | 145.5ms | 160.9ms | +10.6% | 160.9ms | 19.5ms | 10 |
| web | `manifest:stage` | 31 | 20.1ms | 27.5ms | +36.8% | 27.5ms | 1.4ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 4.4ms | - | 4.4ms | 0.4ms | 21 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1358.0ms | 1315.1ms | -3.2% | 1315.1ms | 15.9ms | 21 |
| node | `route:module` | 2580 | 553.6ms | 602.5ms | +8.8% | 602.5ms | 4.9ms | 20 |
| web | `route:client-entry` | 2581 | 383.5ms | 396.9ms | +3.5% | 396.9ms | 6.8ms | 21 |
| node | `module:client-only-stub` | 10 | 195.5ms | 256.6ms | +31.3% | 256.6ms | 139.8ms | 10 |
| node | `manifest:transform` | 10 | 151.0ms | 156.4ms | +3.6% | 156.4ms | 21.7ms | 10 |
| web | `manifest:stage` | 31 | 20.2ms | 27.1ms | +34.2% | 27.1ms | 1.4ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 2.0ms | +100.0% | 2.0ms | 1.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 4.2ms | - | 4.2ms | 0.3ms | 21 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2583 | 1325.3ms | 1347.9ms | +1.7% | 1347.9ms | 18.3ms | 23 |
| node | `route:module` | 2581 | 542.4ms | 591.8ms | +9.1% | 591.8ms | 8.3ms | 21 |
| web | `route:client-entry` | 2583 | 380.0ms | 372.7ms | -1.9% | 372.7ms | 6.2ms | 23 |
| node | `manifest:transform` | 10 | 179.8ms | 140.7ms | -21.7% | 140.7ms | 21.9ms | 10 |
| node | `module:client-only-stub` | 10 | 131.9ms | 131.8ms | -0.1% | 131.8ms | 32.3ms | 10 |
| web | `manifest:stage` | 33 | 20.6ms | 31.9ms | +54.9% | 31.9ms | 4.2ms | 33 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 25 | - | 5.0ms | - | 5.0ms | 0.3ms | 25 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 487.5ms | 429.0ms | -12.0% | 429.0ms | 9.3ms | 20 |
| node | `route:module` | 500 | 163.8ms | 136.6ms | -16.6% | 136.6ms | 1.6ms | 20 |
| web | `route:client-entry` | 500 | 107.7ms | 81.1ms | -24.7% | 81.1ms | 2.4ms | 20 |
| node | `module:client-only-stub` | 10 | 76.8ms | 68.7ms | -10.5% | 68.7ms | 13.0ms | 10 |
| node | `manifest:transform` | 10 | 50.2ms | 44.2ms | -12.0% | 44.2ms | 6.2ms | 10 |
| web | `manifest:stage` | 30 | 5.5ms | 7.8ms | +41.8% | 7.8ms | 0.4ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 4.0ms | - | 4.0ms | 0.3ms | 20 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 113.46s | 112.07s | -1.2% | 112.07s | - | 1.01x | - |
| complex app | 2 | 78.98s | 77.86s | -1.4% | 77.86s | - | 1.01x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 96.87s | 97.14s | +0.3% | 88.10s | 85.36s | 2.88s | 2.79s | 3.29s | 3.15s | -4.2% | 97.14s | - | 1.00x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28721247675)

