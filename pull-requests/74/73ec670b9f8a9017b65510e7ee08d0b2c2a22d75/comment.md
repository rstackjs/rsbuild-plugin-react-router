<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `73ec670` against base `602a929`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.24s | 38.97s | +33.3% | 19.44s | 23.09s | +18.8% | 3.99s | 3.70s | -7.4% | 3.21s | 2.78s | -13.3% | 0.75x |
| Large app | 1 | 13.59s | 19.13s | +40.7% | 8.29s | 10.34s | +24.7% | 1.98s | 1.85s | -6.2% | 1.74s | 1.77s | +1.5% | 0.71x |
| Standard fixtures | 6 | 15.64s | 19.84s | +26.8% | 11.15s | 12.74s | +14.3% | 2.02s | 1.85s | -8.5% | 1.46s | 1.01s | -30.9% | 0.79x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.80s | 10.26s | +16.6% | 10.25s | 10.30s | 0.86x | 1590 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.16s | 4.32s | +4.0% | 4.37s | 4.66s | 0.96x | 656 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.55s | 6.24s | +12.3% | 6.25s | 6.39s | 0.89x | 871 MB |
| `synthetic-256-sourcemaps` | 10 | 2.19s | 2.24s | +2.0% | 2.25s | 2.40s | 0.98x | 470 MB |
| `synthetic-256-ssr-esm` | 10 | 2.07s | 2.10s | +1.6% | 2.11s | 2.24s | 0.98x | 437 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.47s | 2.63s | +6.4% | 2.63s | 2.89s | 0.94x | 491 MB |
| `synthetic-48-ssr-esm` | 10 | 1.35s | 1.35s | +0.5% | 1.38s | 1.61s | 0.99x | 324 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.59s | 19.13s | +40.7% | 8.29s | 10.34s | 1.98s | 1.85s | 1.74s | 1.77s | +1.5% | 19.12s | 19.20s | 0.71x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.66s | 6.06s | +30.1% | 3.21s | 3.85s | 0.58s | 0.53s | 0.48s | 0.33s | -31.8% | 6.05s | 6.14s | 0.77x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.62s | 5.97s | +29.4% | 3.31s | 3.78s | 0.59s | 0.52s | 0.50s | 0.30s | -39.5% | 5.98s | 6.05s | 0.77x | - |
| `synthetic-256-sourcemaps` | 10 | 2.02s | 2.56s | +27.1% | 1.49s | 1.64s | 0.25s | 0.22s | 0.15s | 0.13s | -16.3% | 2.56s | 2.62s | 0.79x | - |
| `synthetic-256-ssr-esm` | 10 | 1.72s | 2.13s | +24.1% | 1.24s | 1.41s | 0.23s | 0.22s | 0.15s | 0.10s | -33.8% | 2.14s | 2.20s | 0.81x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.74s | 2.12s | +21.3% | 1.26s | 1.40s | 0.24s | 0.22s | 0.13s | 0.10s | -19.4% | 2.12s | 2.22s | 0.82x | - |
| `synthetic-48-ssr-esm` | 10 | 0.89s | 1.00s | +12.0% | 0.64s | 0.66s | 0.12s | 0.13s | 0.05s | 0.05s | +1.2% | 1.00s | 1.02s | 0.89x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1776.3ms | 1523.5ms | -14.2% | 1523.5ms | 13.1ms | 10 |
| node | `route:module` | 1785 | 908.5ms | 769.1ms | -15.3% | 769.1ms | 15.6ms | 10 |
| web | `route:client-entry` | 1785 | 393.9ms | 433.0ms | +9.9% | 433.0ms | 9.6ms | 10 |
| node | `manifest:transform` | 5 | 124.6ms | 104.1ms | -16.5% | 104.1ms | 27.4ms | 5 |
| web | `manifest:stage` | 15 | 14.5ms | 19.5ms | +34.5% | 19.5ms | 1.9ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 160.6ms | - | 160.6ms | 39.7ms | 10 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2030.9ms | 1790.3ms | -11.8% | 1790.3ms | 7.6ms | 10 |
| node | `route:module` | 5130 | 932.7ms | 913.6ms | -2.0% | 913.6ms | 16.7ms | 10 |
| web | `route:client-entry` | 5130 | 632.4ms | 628.3ms | -0.6% | 628.3ms | 6.5ms | 10 |
| node | `module:client-only-stub` | 5 | 504.0ms | 91.8ms | -81.8% | 91.8ms | 38.4ms | 5 |
| node | `manifest:transform` | 5 | 219.1ms | 205.0ms | -6.4% | 205.0ms | 46.7ms | 5 |
| web | `manifest:stage` | 15 | 58.2ms | 57.4ms | -1.4% | 57.4ms | 6.5ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.1ms | - | 2.1ms | 0.4ms | 10 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2057.7ms | 1739.9ms | -15.4% | 1739.9ms | 7.5ms | 10 |
| node | `route:module` | 5130 | 920.3ms | 845.0ms | -8.2% | 845.0ms | 4.8ms | 10 |
| web | `route:client-entry` | 5130 | 646.1ms | 610.4ms | -5.5% | 610.4ms | 7.3ms | 10 |
| node | `manifest:transform` | 5 | 205.1ms | 218.1ms | +6.3% | 218.1ms | 62.9ms | 5 |
| node | `module:client-only-stub` | 5 | 90.0ms | 91.3ms | +1.4% | 91.3ms | 33.7ms | 5 |
| web | `manifest:stage` | 15 | 49.7ms | 57.3ms | +15.3% | 57.3ms | 6.5ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.0ms | - | 2.0ms | 0.3ms | 10 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1449.1ms | 1281.9ms | -11.5% | 1281.9ms | 10.8ms | 21 |
| node | `route:module` | 2580 | 588.1ms | 606.2ms | +3.1% | 606.2ms | 5.0ms | 20 |
| web | `route:client-entry` | 2581 | 396.0ms | 380.3ms | -4.0% | 380.3ms | 5.0ms | 21 |
| node | `manifest:transform` | 10 | 152.3ms | 152.8ms | +0.3% | 152.8ms | 21.6ms | 10 |
| node | `module:client-only-stub` | 10 | 85.9ms | 27.2ms | -68.3% | 27.2ms | 6.6ms | 10 |
| web | `manifest:stage` | 31 | 24.6ms | 26.5ms | +7.7% | 26.5ms | 1.7ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 5.2ms | - | 5.2ms | 0.4ms | 21 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1307.4ms | 1223.0ms | -6.5% | 1223.0ms | 14.3ms | 21 |
| node | `route:module` | 2580 | 528.8ms | 606.4ms | +14.7% | 606.4ms | 7.5ms | 20 |
| web | `route:client-entry` | 2581 | 378.2ms | 422.8ms | +11.8% | 422.8ms | 5.1ms | 21 |
| node | `manifest:transform` | 10 | 153.1ms | 178.9ms | +16.9% | 178.9ms | 22.6ms | 10 |
| node | `module:client-only-stub` | 10 | 83.4ms | 22.9ms | -72.5% | 22.9ms | 5.0ms | 10 |
| web | `manifest:stage` | 31 | 21.1ms | 28.6ms | +35.5% | 28.6ms | 2.7ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 4.4ms | - | 4.4ms | 0.4ms | 21 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2583 | 1344.4ms | 1239.7ms | -7.8% | 1239.7ms | 10.2ms | 23 |
| node | `route:module` | 2580 | 565.6ms | 603.1ms | +6.6% | 603.1ms | 7.7ms | 20 |
| web | `route:client-entry` | 2583 | 390.0ms | 386.4ms | -0.9% | 386.4ms | 5.1ms | 23 |
| node | `manifest:transform` | 10 | 170.5ms | 179.1ms | +5.0% | 179.1ms | 22.9ms | 10 |
| node | `module:client-only-stub` | 10 | 163.7ms | 22.2ms | -86.4% | 22.2ms | 3.0ms | 10 |
| web | `manifest:stage` | 33 | 20.8ms | 31.7ms | +52.4% | 31.7ms | 2.9ms | 33 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 23 | - | 4.5ms | - | 4.5ms | 0.3ms | 23 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 467.6ms | 349.5ms | -25.3% | 349.5ms | 8.4ms | 20 |
| node | `route:module` | 500 | 153.2ms | 136.0ms | -11.2% | 136.0ms | 0.8ms | 20 |
| web | `route:client-entry` | 500 | 106.0ms | 85.8ms | -19.1% | 85.8ms | 1.8ms | 20 |
| node | `module:client-only-stub` | 10 | 97.3ms | 73.2ms | -24.8% | 73.2ms | 15.4ms | 10 |
| node | `manifest:transform` | 10 | 54.4ms | 49.7ms | -8.6% | 49.7ms | 7.1ms | 10 |
| web | `manifest:stage` | 30 | 5.4ms | 7.7ms | +42.6% | 7.7ms | 0.4ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 4.3ms | - | 4.3ms | 0.4ms | 20 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 110.69s | 114.82s | +3.7% | 114.82s | - | 0.96x | - |
| complex app | 2 | 80.55s | 84.77s | +5.2% | 84.77s | - | 0.95x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 95.80s | 100.02s | +4.4% | 87.18s | 87.96s | 2.83s | 2.98s | 3.21s | 3.18s | -0.9% | 100.02s | - | 0.96x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29055733696)

