<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `bd106b9` against base `9018ef6`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.54s | 30.70s | +3.9% | 19.68s | 21.18s | +7.6% | 3.98s | 4.02s | +0.9% | 3.31s | 2.93s | -11.5% | 0.96x |
| Large app | 1 | 13.76s | 13.67s | -0.6% | 8.35s | 8.46s | +1.3% | 1.99s | 2.00s | +0.7% | 1.79s | 1.54s | -14.0% | 1.01x |
| Standard fixtures | 6 | 15.78s | 17.03s | +7.9% | 11.34s | 12.72s | +12.2% | 1.99s | 2.01s | +1.1% | 1.52s | 1.39s | -8.6% | 0.93x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.84s | 8.75s | -1.1% | 8.74s | 8.84s | 1.01x | 1440 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.26s | 4.52s | +6.0% | 4.48s | 4.72s | 0.94x | 545 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.76s | 5.73s | -0.5% | 5.76s | 6.00s | 1.00x | 681 MB |
| `synthetic-256-sourcemaps` | 10 | 2.22s | 2.21s | -0.3% | 2.20s | 2.33s | 1.00x | 412 MB |
| `synthetic-256-ssr-esm` | 10 | 2.11s | 2.06s | -2.5% | 2.07s | 2.19s | 1.03x | 383 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.51s | 2.46s | -2.1% | 2.46s | 2.60s | 1.02x | 381 MB |
| `synthetic-48-ssr-esm` | 10 | 1.38s | 1.34s | -2.9% | 1.37s | 1.59s | 1.03x | 315 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.76s | 13.67s | -0.6% | 8.35s | 8.46s | 1.99s | 2.00s | 1.79s | 1.54s | -14.0% | 13.64s | 13.81s | 1.01x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.53s | 5.01s | +10.7% | 3.24s | 3.71s | 0.56s | 0.57s | 0.48s | 0.48s | -0.4% | 5.05s | 5.20s | 0.90x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.76s | 5.09s | +6.8% | 3.37s | 3.82s | 0.56s | 0.57s | 0.53s | 0.48s | -9.9% | 5.11s | 5.23s | 0.94x | - |
| `synthetic-256-sourcemaps` | 10 | 2.03s | 2.09s | +2.7% | 1.51s | 1.59s | 0.25s | 0.25s | 0.15s | 0.13s | -16.8% | 2.09s | 2.16s | 0.97x | - |
| `synthetic-256-ssr-esm` | 10 | 1.76s | 1.98s | +12.5% | 1.27s | 1.47s | 0.24s | 0.25s | 0.15s | 0.13s | -16.6% | 1.98s | 2.04s | 0.89x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.79s | 1.98s | +10.5% | 1.30s | 1.50s | 0.25s | 0.25s | 0.15s | 0.13s | -16.7% | 2.01s | 2.14s | 0.91x | - |
| `synthetic-48-ssr-esm` | 10 | 0.91s | 0.89s | -2.3% | 0.65s | 0.64s | 0.13s | 0.13s | 0.05s | 0.05s | -0.7% | 0.88s | 0.94s | 1.02x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1727.6ms | 5306.8ms | +207.2% | 5306.8ms | 39.9ms | 32 |
| node | `route:module` | 1785 | 949.9ms | 1730.6ms | +82.2% | 1730.6ms | 10.1ms | 59 |
| web | `route:client-entry` | 1785 | 389.1ms | 383.6ms | -1.4% | 383.6ms | 5.9ms | 10 |
| node | `manifest:transform` | 5 | 159.2ms | 91.9ms | -42.3% | 91.9ms | 21.4ms | 5 |
| web | `manifest:stage` | 10 | 14.2ms | 14.1ms | -0.7% | 14.1ms | 1.8ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2040.3ms | 3680.3ms | +80.4% | 3680.3ms | 13.8ms | 38 |
| node | `route:module` | 5130 | 983.2ms | 1708.7ms | +73.8% | 1708.7ms | 4.3ms | 38 |
| node | `module:client-only-stub` | 5 | 749.7ms | 48.7ms | -93.5% | 48.7ms | 13.4ms | 5 |
| web | `route:client-entry` | 5130 | 649.7ms | 681.1ms | +4.8% | 681.1ms | 8.0ms | 10 |
| node | `manifest:transform` | 5 | 211.0ms | 208.1ms | -1.4% | 208.1ms | 45.0ms | 5 |
| web | `manifest:stage` | 10 | 52.0ms | 55.9ms | +7.5% | 55.9ms | 6.8ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2085.3ms | 3725.6ms | +78.7% | 3725.6ms | 16.6ms | 35 |
| node | `route:module` | 5130 | 943.6ms | 1760.5ms | +86.6% | 1760.5ms | 4.5ms | 45 |
| web | `route:client-entry` | 5130 | 644.5ms | 671.3ms | +4.2% | 671.3ms | 7.1ms | 10 |
| node | `manifest:transform` | 5 | 206.2ms | 216.2ms | +4.8% | 216.2ms | 44.9ms | 5 |
| node | `module:client-only-stub` | 5 | 128.8ms | 93.5ms | -27.4% | 93.5ms | 57.0ms | 5 |
| web | `manifest:stage` | 10 | 51.9ms | 50.0ms | -3.7% | 50.0ms | 6.7ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1462.1ms | 3076.6ms | +110.4% | 3076.6ms | 27.3ms | 42 |
| node | `route:module` | 2580 | 601.3ms | 1165.6ms | +93.8% | 1165.6ms | 5.1ms | 70 |
| web | `route:client-entry` | 2581 | 394.6ms | 408.3ms | +3.5% | 408.3ms | 5.0ms | 21 |
| node | `manifest:transform` | 10 | 170.5ms | 163.4ms | -4.2% | 163.4ms | 21.0ms | 10 |
| node | `module:client-only-stub` | 10 | 163.1ms | 63.7ms | -60.9% | 63.7ms | 9.3ms | 10 |
| web | `manifest:stage` | 21 | 21.5ms | 24.8ms | +15.3% | 24.8ms | 4.1ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2584 | 1357.6ms | 2948.2ms | +117.2% | 2948.2ms | 20.1ms | 44 |
| node | `route:module` | 2580 | 541.9ms | 1076.5ms | +98.7% | 1076.5ms | 4.7ms | 70 |
| web | `route:client-entry` | 2584 | 390.6ms | 409.5ms | +4.8% | 409.5ms | 5.3ms | 24 |
| node | `manifest:transform` | 10 | 175.9ms | 158.6ms | -9.8% | 158.6ms | 17.4ms | 10 |
| node | `module:client-only-stub` | 10 | 162.1ms | 80.4ms | -50.4% | 80.4ms | 23.2ms | 10 |
| web | `manifest:stage` | 24 | 21.4ms | 22.6ms | +5.6% | 22.6ms | 1.4ms | 24 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2583 | 1346.4ms | 2950.1ms | +119.1% | 2950.1ms | 31.8ms | 43 |
| node | `route:module` | 2580 | 559.9ms | 1098.3ms | +96.2% | 1098.3ms | 6.1ms | 70 |
| web | `route:client-entry` | 2582 | 396.6ms | 405.0ms | +2.1% | 405.0ms | 5.6ms | 22 |
| node | `manifest:transform` | 10 | 165.7ms | 150.3ms | -9.3% | 150.3ms | 21.2ms | 10 |
| node | `module:client-only-stub` | 10 | 142.7ms | 51.9ms | -63.6% | 51.9ms | 7.5ms | 10 |
| web | `manifest:stage` | 22 | 21.6ms | 21.7ms | +0.5% | 21.7ms | 1.4ms | 22 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 505.1ms | 390.8ms | -22.6% | 390.8ms | 6.2ms | 20 |
| node | `route:module` | 500 | 167.7ms | 160.0ms | -4.6% | 160.0ms | 0.8ms | 20 |
| web | `route:client-entry` | 500 | 107.0ms | 102.8ms | -3.9% | 102.8ms | 3.2ms | 20 |
| node | `module:client-only-stub` | 10 | 73.4ms | 89.9ms | +22.5% | 89.9ms | 14.7ms | 10 |
| node | `manifest:transform` | 10 | 57.0ms | 54.5ms | -4.4% | 54.5ms | 6.5ms | 10 |
| web | `manifest:stage` | 20 | 5.4ms | 5.1ms | -5.6% | 5.1ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 114.11s | 113.98s | -0.1% | 113.98s | - | 1.00x | - |
| complex app | 2 | 84.16s | 80.47s | -4.4% | 80.47s | - | 1.05x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 100.41s | 97.33s | -3.1% | 91.44s | 89.12s | 3.02s | 3.11s | 3.36s | 2.34s | -30.5% | 97.33s | - | 1.03x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28985459779)

