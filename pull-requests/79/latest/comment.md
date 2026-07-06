<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `c239dcc` against base `c93ec98`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 28.82s | 28.81s | -0.0% | 19.30s | 19.22s | -0.4% | 3.92s | 4.01s | +2.3% | 3.21s | 3.15s | -1.8% | 1.00x |
| Large app | 1 | 13.49s | 13.75s | +1.9% | 8.28s | 8.41s | +1.6% | 1.98s | 2.00s | +0.9% | 1.72s | 1.74s | +1.2% | 0.98x |
| Standard fixtures | 6 | 15.33s | 15.05s | -1.8% | 11.02s | 10.81s | -1.9% | 1.94s | 2.01s | +3.7% | 1.49s | 1.41s | -5.3% | 1.02x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.61s | 8.59s | -0.3% | 8.61s | 8.79s | 1.00x | 1536 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.12s | 4.21s | +2.3% | 4.19s | 4.38s | 0.98x | 632 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.47s | 5.58s | +2.1% | 5.58s | 5.83s | 0.98x | 804 MB |
| `synthetic-256-sourcemaps` | 10 | 2.20s | 2.11s | -4.1% | 2.13s | 2.36s | 1.04x | 452 MB |
| `synthetic-256-ssr-esm` | 10 | 2.02s | 2.00s | -1.1% | 2.01s | 2.18s | 1.01x | 407 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.43s | 2.44s | +0.5% | 2.45s | 2.66s | 1.00x | 449 MB |
| `synthetic-48-ssr-esm` | 10 | 1.34s | 1.34s | -0.3% | 1.36s | 1.56s | 1.00x | 320 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.49s | 13.75s | +1.9% | 8.28s | 8.41s | 1.98s | 2.00s | 1.72s | 1.74s | +1.2% | 13.75s | 13.82s | 0.98x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.46s | 4.41s | -1.1% | 3.18s | 3.13s | 0.53s | 0.58s | 0.53s | 0.48s | -9.5% | 4.45s | 4.58s | 1.01x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.57s | 4.44s | -2.9% | 3.27s | 3.16s | 0.57s | 0.58s | 0.48s | 0.48s | -0.3% | 4.47s | 4.58s | 1.03x | - |
| `synthetic-256-sourcemaps` | 10 | 1.95s | 1.95s | +0.0% | 1.46s | 1.47s | 0.25s | 0.24s | 0.15s | 0.15s | +0.3% | 1.94s | 1.98s | 1.00x | - |
| `synthetic-256-ssr-esm` | 10 | 1.71s | 1.70s | -0.7% | 1.24s | 1.22s | 0.23s | 0.25s | 0.15s | 0.13s | -16.5% | 1.70s | 1.77s | 1.01x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.74s | 1.70s | -2.6% | 1.23s | 1.23s | 0.24s | 0.25s | 0.13s | 0.13s | -1.3% | 1.73s | 1.81s | 1.03x | - |
| `synthetic-48-ssr-esm` | 10 | 0.89s | 0.86s | -3.6% | 0.65s | 0.61s | 0.12s | 0.13s | 0.05s | 0.05s | -0.8% | 0.87s | 0.89s | 1.04x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1668.4ms | 1766.0ms | +5.8% | 1766.0ms | 35.6ms | 10 |
| node | `route:module` | 1785 | 932.9ms | 857.3ms | -8.1% | 857.3ms | 10.1ms | 10 |
| web | `route:client-entry` | 1785 | 397.8ms | 357.6ms | -10.1% | 357.6ms | 5.3ms | 10 |
| node | `manifest:transform` | 5 | 154.8ms | 121.6ms | -21.4% | 121.6ms | 30.8ms | 5 |
| web | `manifest:stage` | 10 | 14.3ms | 17.9ms | +25.2% | 17.9ms | 5.2ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2089.5ms | 1982.0ms | -5.1% | 1982.0ms | 17.4ms | 10 |
| node | `route:module` | 5130 | 934.4ms | 955.8ms | +2.3% | 955.8ms | 8.8ms | 10 |
| web | `route:client-entry` | 5130 | 624.9ms | 633.9ms | +1.4% | 633.9ms | 6.0ms | 10 |
| node | `manifest:transform` | 5 | 204.5ms | 246.3ms | +20.4% | 246.3ms | 78.8ms | 5 |
| node | `module:client-only-stub` | 5 | 105.8ms | 406.4ms | +284.1% | 406.4ms | 350.7ms | 5 |
| web | `manifest:stage` | 10 | 65.1ms | 46.5ms | -28.6% | 46.5ms | 6.7ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2022.3ms | 2020.1ms | -0.1% | 2020.1ms | 28.5ms | 10 |
| node | `route:module` | 5130 | 924.5ms | 931.1ms | +0.7% | 931.1ms | 6.4ms | 10 |
| web | `route:client-entry` | 5130 | 637.5ms | 655.8ms | +2.9% | 655.8ms | 9.1ms | 10 |
| node | `manifest:transform` | 5 | 197.4ms | 206.4ms | +4.6% | 206.4ms | 47.0ms | 5 |
| node | `module:client-only-stub` | 5 | 118.0ms | 587.1ms | +397.5% | 587.1ms | 400.9ms | 5 |
| web | `manifest:stage` | 10 | 56.2ms | 51.8ms | -7.8% | 51.8ms | 8.1ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1417.8ms | 1377.5ms | -2.8% | 1377.5ms | 21.8ms | 20 |
| node | `route:module` | 2580 | 574.5ms | 615.5ms | +7.1% | 615.5ms | 4.5ms | 20 |
| web | `route:client-entry` | 2580 | 388.7ms | 409.5ms | +5.4% | 409.5ms | 5.3ms | 20 |
| node | `manifest:transform` | 10 | 142.7ms | 152.5ms | +6.9% | 152.5ms | 22.0ms | 10 |
| node | `module:client-only-stub` | 10 | 120.3ms | 186.0ms | +54.6% | 186.0ms | 99.8ms | 10 |
| web | `manifest:stage` | 20 | 20.3ms | 20.3ms | 0.0% | 20.3ms | 1.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2583 | 1341.7ms | 1412.0ms | +5.2% | 1412.0ms | 20.2ms | 23 |
| node | `route:module` | 2580 | 534.2ms | 544.4ms | +1.9% | 544.4ms | 8.9ms | 20 |
| web | `route:client-entry` | 2583 | 388.7ms | 374.8ms | -3.6% | 374.8ms | 5.2ms | 23 |
| node | `module:client-only-stub` | 10 | 237.9ms | 113.4ms | -52.3% | 113.4ms | 65.1ms | 10 |
| node | `manifest:transform` | 10 | 156.6ms | 144.7ms | -7.6% | 144.7ms | 21.6ms | 10 |
| web | `manifest:stage` | 23 | 20.9ms | 22.0ms | +5.3% | 22.0ms | 1.3ms | 23 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2584 | 1323.3ms | 1407.8ms | +6.4% | 1407.8ms | 18.2ms | 24 |
| node | `route:module` | 2580 | 545.6ms | 520.3ms | -4.6% | 520.3ms | 4.5ms | 20 |
| web | `route:client-entry` | 2584 | 373.3ms | 391.6ms | +4.9% | 391.6ms | 4.8ms | 24 |
| node | `manifest:transform` | 10 | 171.8ms | 159.7ms | -7.0% | 159.7ms | 21.0ms | 10 |
| node | `module:client-only-stub` | 10 | 96.6ms | 47.1ms | -51.2% | 47.1ms | 14.4ms | 10 |
| web | `manifest:stage` | 24 | 22.2ms | 23.3ms | +5.0% | 23.3ms | 1.4ms | 24 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 495.3ms | 426.5ms | -13.9% | 426.5ms | 12.8ms | 20 |
| node | `route:module` | 500 | 162.9ms | 153.1ms | -6.0% | 153.1ms | 4.1ms | 20 |
| web | `route:client-entry` | 500 | 103.6ms | 107.5ms | +3.8% | 107.5ms | 3.3ms | 20 |
| node | `module:client-only-stub` | 10 | 84.8ms | 119.9ms | +41.4% | 119.9ms | 33.0ms | 10 |
| node | `manifest:transform` | 10 | 55.1ms | 64.0ms | +16.2% | 64.0ms | 8.3ms | 10 |
| web | `manifest:stage` | 20 | 5.3ms | 5.8ms | +9.4% | 5.8ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 117.60s | 115.66s | -1.7% | 115.66s | - | 1.02x | - |
| complex app | 2 | 78.80s | 78.72s | -0.1% | 78.72s | - | 1.00x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 98.48s | 97.06s | -1.4% | 89.71s | 88.41s | 2.88s | 2.84s | 3.29s | 3.22s | -2.0% | 97.06s | - | 1.01x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28828438076)

