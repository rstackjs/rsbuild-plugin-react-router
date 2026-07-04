<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `f8964b0` against base `c93ec98`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.47s | 38.91s | +32.0% | 19.72s | 20.17s | +2.3% | 3.97s | 4.06s | +2.4% | 3.27s | 3.32s | +1.6% | 0.76x |
| Large app | 1 | 13.83s | 16.20s | +17.2% | 8.44s | 8.69s | +2.9% | 2.01s | 2.05s | +1.8% | 1.75s | 1.83s | +4.6% | 0.85x |
| Standard fixtures | 6 | 15.65s | 22.72s | +45.2% | 11.28s | 11.48s | +1.8% | 1.96s | 2.02s | +3.0% | 1.52s | 1.49s | -1.8% | 0.69x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.71s | 9.08s | +4.3% | 9.08s | 9.24s | 0.96x | 1510 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.18s | 3.96s | -5.4% | 4.06s | 4.45s | 1.06x | 618 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.57s | 5.63s | +1.0% | 5.61s | 5.86s | 0.99x | 805 MB |
| `synthetic-256-sourcemaps` | 10 | 2.17s | 2.16s | -0.6% | 2.17s | 2.33s | 1.01x | 452 MB |
| `synthetic-256-ssr-esm` | 10 | 2.02s | 2.07s | +2.5% | 2.08s | 2.19s | 0.98x | 398 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.44s | 2.44s | +0.1% | 2.45s | 2.67s | 1.00x | 447 MB |
| `synthetic-48-ssr-esm` | 10 | 1.35s | 1.40s | +3.0% | 1.43s | 1.72s | 0.97x | 321 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.83s | 16.20s | +17.2% | 8.44s | 8.69s | 2.01s | 2.05s | 1.75s | 1.83s | +4.6% | 16.22s | 16.30s | 0.85x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.63s | 7.08s | +53.1% | 3.30s | 3.33s | 0.56s | 0.57s | 0.50s | 0.53s | +4.8% | 7.11s | 7.23s | 0.65x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.60s | 7.12s | +55.0% | 3.29s | 3.37s | 0.54s | 0.56s | 0.51s | 0.53s | +4.1% | 7.13s | 7.21s | 0.65x | - |
| `synthetic-256-sourcemaps` | 10 | 2.00s | 2.91s | +45.0% | 1.50s | 1.54s | 0.25s | 0.24s | 0.15s | 0.13s | -16.7% | 2.91s | 2.97s | 0.69x | - |
| `synthetic-256-ssr-esm` | 10 | 1.76s | 2.27s | +29.1% | 1.27s | 1.29s | 0.24s | 0.25s | 0.15s | 0.13s | -15.2% | 2.26s | 2.30s | 0.77x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.75s | 2.27s | +29.7% | 1.26s | 1.29s | 0.23s | 0.25s | 0.15s | 0.13s | -16.1% | 2.25s | 2.32s | 0.77x | - |
| `synthetic-48-ssr-esm` | 10 | 0.91s | 1.07s | +16.8% | 0.66s | 0.65s | 0.13s | 0.13s | 0.05s | 0.05s | +0.5% | 1.05s | 1.08s | 0.86x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1713.2ms | 1704.9ms | -0.5% | 1704.9ms | 13.7ms | 10 |
| node | `route:module` | 1785 | 910.1ms | 948.0ms | +4.2% | 948.0ms | 9.6ms | 10 |
| web | `route:client-entry` | 1785 | 380.3ms | 451.6ms | +18.7% | 451.6ms | 8.8ms | 10 |
| node | `manifest:transform` | 5 | 141.8ms | 140.3ms | -1.1% | 140.3ms | 55.5ms | 5 |
| web | `manifest:stage` | 15 | 14.4ms | 20.7ms | +43.7% | 20.7ms | 2.0ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 141.1ms | - | 141.1ms | 15.2ms | 10 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2035.1ms | 2050.5ms | +0.8% | 2050.5ms | 13.1ms | 10 |
| node | `route:module` | 5130 | 921.3ms | 1024.4ms | +11.2% | 1024.4ms | 13.6ms | 10 |
| web | `route:client-entry` | 5130 | 627.2ms | 656.5ms | +4.7% | 656.5ms | 8.6ms | 10 |
| node | `manifest:transform` | 5 | 208.2ms | 214.6ms | +3.1% | 214.6ms | 47.8ms | 5 |
| node | `module:client-only-stub` | 5 | 103.1ms | 171.7ms | +66.5% | 171.7ms | 91.2ms | 5 |
| web | `manifest:stage` | 15 | 59.4ms | 63.3ms | +6.6% | 63.3ms | 8.4ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.0ms | - | 2.0ms | 0.3ms | 10 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2056.4ms | 2060.9ms | +0.2% | 2060.9ms | 13.8ms | 10 |
| node | `route:module` | 5130 | 919.2ms | 965.3ms | +5.0% | 965.3ms | 14.7ms | 10 |
| web | `route:client-entry` | 5130 | 603.6ms | 632.4ms | +4.8% | 632.4ms | 8.0ms | 10 |
| node | `module:client-only-stub` | 5 | 469.5ms | 81.5ms | -82.6% | 81.5ms | 20.7ms | 5 |
| node | `manifest:transform` | 5 | 204.7ms | 210.6ms | +2.9% | 210.6ms | 44.5ms | 5 |
| web | `manifest:stage` | 15 | 60.7ms | 62.5ms | +3.0% | 62.5ms | 6.7ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.0ms | - | 2.0ms | 0.3ms | 10 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1410.9ms | 1394.3ms | -1.2% | 1394.3ms | 18.0ms | 20 |
| node | `route:module` | 2580 | 598.2ms | 652.7ms | +9.1% | 652.7ms | 7.8ms | 20 |
| web | `route:client-entry` | 2580 | 397.2ms | 396.2ms | -0.3% | 396.2ms | 6.7ms | 20 |
| node | `module:client-only-stub` | 10 | 244.6ms | 155.0ms | -36.6% | 155.0ms | 92.6ms | 10 |
| node | `manifest:transform` | 10 | 145.5ms | 154.8ms | +6.4% | 154.8ms | 19.9ms | 10 |
| web | `manifest:stage` | 30 | 20.1ms | 27.8ms | +38.3% | 27.8ms | 1.4ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 5.3ms | - | 5.3ms | 0.4ms | 20 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1358.0ms | 1367.1ms | +0.7% | 1367.1ms | 17.5ms | 22 |
| node | `route:module` | 2580 | 553.6ms | 585.4ms | +5.7% | 585.4ms | 4.8ms | 20 |
| web | `route:client-entry` | 2582 | 383.5ms | 366.3ms | -4.5% | 366.3ms | 5.8ms | 22 |
| node | `module:client-only-stub` | 10 | 195.5ms | 124.7ms | -36.2% | 124.7ms | 37.1ms | 10 |
| node | `manifest:transform` | 10 | 151.0ms | 170.4ms | +12.8% | 170.4ms | 22.1ms | 10 |
| web | `manifest:stage` | 32 | 20.2ms | 29.8ms | +47.5% | 29.8ms | 1.5ms | 32 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 22 | - | 4.3ms | - | 4.3ms | 0.3ms | 22 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1325.3ms | 1402.9ms | +5.9% | 1402.9ms | 16.9ms | 22 |
| node | `route:module` | 2580 | 542.4ms | 621.0ms | +14.5% | 621.0ms | 7.1ms | 20 |
| web | `route:client-entry` | 2582 | 380.0ms | 379.6ms | -0.1% | 379.6ms | 6.0ms | 22 |
| node | `manifest:transform` | 10 | 179.8ms | 161.5ms | -10.2% | 161.5ms | 22.7ms | 10 |
| node | `module:client-only-stub` | 10 | 131.9ms | 163.3ms | +23.8% | 163.3ms | 46.2ms | 10 |
| web | `manifest:stage` | 32 | 20.6ms | 29.6ms | +43.7% | 29.6ms | 1.4ms | 32 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 22 | - | 4.6ms | - | 4.6ms | 0.5ms | 22 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 487.5ms | 431.5ms | -11.5% | 431.5ms | 9.9ms | 20 |
| node | `route:module` | 500 | 163.8ms | 139.9ms | -14.6% | 139.9ms | 0.8ms | 20 |
| web | `route:client-entry` | 500 | 107.7ms | 85.6ms | -20.5% | 85.6ms | 2.1ms | 20 |
| node | `module:client-only-stub` | 10 | 76.8ms | 76.4ms | -0.5% | 76.4ms | 10.5ms | 10 |
| node | `manifest:transform` | 10 | 50.2ms | 50.8ms | +1.2% | 50.8ms | 12.0ms | 10 |
| web | `manifest:stage` | 30 | 5.5ms | 8.0ms | +45.5% | 8.0ms | 0.4ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 4.0ms | - | 4.0ms | 0.3ms | 20 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 113.46s | 121.10s | +6.7% | 121.10s | - | 0.94x | - |
| complex app | 2 | 78.98s | 87.03s | +10.2% | 87.03s | - | 0.91x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 96.87s | 105.65s | +9.1% | 88.10s | 92.62s | 2.88s | 3.10s | 3.29s | 3.51s | +6.6% | 105.65s | - | 0.92x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28692562549)

