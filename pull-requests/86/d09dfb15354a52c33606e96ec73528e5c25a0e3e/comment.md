<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `d09dfb1` against base `9018ef6`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.54s | 30.53s | +3.4% | 19.68s | 20.92s | +6.3% | 3.98s | 4.08s | +2.6% | 3.31s | 2.97s | -10.1% | 0.97x |
| Large app | 1 | 13.76s | 13.66s | -0.7% | 8.35s | 8.39s | +0.5% | 1.99s | 2.04s | +2.7% | 1.79s | 1.59s | -11.3% | 1.01x |
| Standard fixtures | 6 | 15.78s | 16.87s | +6.9% | 11.34s | 12.53s | +10.5% | 1.99s | 2.04s | +2.5% | 1.52s | 1.39s | -8.7% | 0.94x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.84s | 9.14s | +3.4% | 9.19s | 9.47s | 0.97x | 1549 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.26s | 5.07s | +19.1% | 5.12s | 5.38s | 0.84x | 744 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.76s | 6.53s | +13.5% | 6.47s | 6.68s | 0.88x | 860 MB |
| `synthetic-256-sourcemaps` | 10 | 2.22s | 2.36s | +6.6% | 2.38s | 2.54s | 0.94x | 493 MB |
| `synthetic-256-ssr-esm` | 10 | 2.11s | 2.31s | +9.6% | 2.33s | 2.53s | 0.91x | 465 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.51s | 2.75s | +9.8% | 2.77s | 3.02s | 0.91x | 498 MB |
| `synthetic-48-ssr-esm` | 10 | 1.38s | 1.36s | -1.5% | 1.38s | 1.62s | 1.02x | 346 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.76s | 13.66s | -0.7% | 8.35s | 8.39s | 1.99s | 2.04s | 1.79s | 1.59s | -11.3% | 13.68s | 13.79s | 1.01x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.53s | 5.02s | +10.9% | 3.24s | 3.74s | 0.56s | 0.58s | 0.48s | 0.48s | -0.6% | 5.03s | 5.15s | 0.90x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.76s | 4.99s | +4.8% | 3.37s | 3.69s | 0.56s | 0.58s | 0.53s | 0.48s | -9.8% | 5.01s | 5.09s | 0.95x | - |
| `synthetic-256-sourcemaps` | 10 | 2.03s | 2.05s | +0.9% | 1.51s | 1.55s | 0.25s | 0.25s | 0.15s | 0.13s | -16.8% | 2.07s | 2.16s | 0.99x | - |
| `synthetic-256-ssr-esm` | 10 | 1.76s | 1.96s | +11.7% | 1.27s | 1.47s | 0.24s | 0.25s | 0.15s | 0.13s | -16.9% | 1.98s | 2.06s | 0.89x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.79s | 1.95s | +8.6% | 1.30s | 1.45s | 0.25s | 0.25s | 0.15s | 0.13s | -17.0% | 1.95s | 2.01s | 0.92x | - |
| `synthetic-48-ssr-esm` | 10 | 0.91s | 0.89s | -1.4% | 0.65s | 0.63s | 0.13s | 0.13s | 0.05s | 0.05s | -0.6% | 0.88s | 0.90s | 1.01x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1727.6ms | - | - | - | - | 10 |
| node | `route:module` | 1785 | 949.9ms | - | - | - | - | 10 |
| web | `route:client-entry` | 1785 | 389.1ms | 370.2ms | -4.9% | 370.2ms | 5.5ms | 10 |
| node | `manifest:transform` | 5 | 159.2ms | 103.8ms | -34.8% | 103.8ms | 24.6ms | 5 |
| web | `manifest:stage` | 10 | 14.2ms | 14.3ms | +0.7% | 14.3ms | 1.9ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2040.3ms | - | - | - | - | 10 |
| node | `route:module` | 5130 | 983.2ms | - | - | - | - | 10 |
| node | `module:client-only-stub` | 5 | 749.7ms | 42.0ms | -94.4% | 42.0ms | 19.9ms | 5 |
| web | `route:client-entry` | 5130 | 649.7ms | 629.9ms | -3.0% | 629.9ms | 6.7ms | 10 |
| node | `manifest:transform` | 5 | 211.0ms | 215.7ms | +2.2% | 215.7ms | 48.2ms | 5 |
| web | `manifest:stage` | 10 | 52.0ms | 46.1ms | -11.3% | 46.1ms | 6.7ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2085.3ms | - | - | - | - | 10 |
| node | `route:module` | 5130 | 943.6ms | - | - | - | - | 10 |
| web | `route:client-entry` | 5130 | 644.5ms | 636.1ms | -1.3% | 636.1ms | 7.3ms | 10 |
| node | `manifest:transform` | 5 | 206.2ms | 199.4ms | -3.3% | 199.4ms | 40.4ms | 5 |
| node | `module:client-only-stub` | 5 | 128.8ms | 32.8ms | -74.5% | 32.8ms | 10.9ms | 5 |
| web | `manifest:stage` | 10 | 51.9ms | 55.8ms | +7.5% | 55.8ms | 8.2ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1462.1ms | - | - | - | - | 21 |
| node | `route:module` | 2580 | 601.3ms | - | - | - | - | 20 |
| web | `route:client-entry` | 2580 | 394.6ms | 401.2ms | +1.7% | 401.2ms | 5.2ms | 20 |
| node | `manifest:transform` | 10 | 170.5ms | 169.1ms | -0.8% | 169.1ms | 25.7ms | 10 |
| node | `module:client-only-stub` | 10 | 163.1ms | 119.5ms | -26.7% | 119.5ms | 69.9ms | 10 |
| web | `manifest:stage` | 20 | 21.5ms | 23.1ms | +7.4% | 23.1ms | 4.6ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1357.6ms | - | - | - | - | 21 |
| node | `route:module` | 2580 | 541.9ms | - | - | - | - | 20 |
| web | `route:client-entry` | 2582 | 390.6ms | 399.1ms | +2.2% | 399.1ms | 5.2ms | 22 |
| node | `manifest:transform` | 10 | 175.9ms | 153.7ms | -12.6% | 153.7ms | 21.7ms | 10 |
| node | `module:client-only-stub` | 10 | 162.1ms | 76.3ms | -52.9% | 76.3ms | 14.7ms | 10 |
| web | `manifest:stage` | 22 | 21.4ms | 21.4ms | +0.0% | 21.4ms | 1.3ms | 22 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1346.4ms | - | - | - | - | 21 |
| node | `route:module` | 2580 | 559.9ms | - | - | - | - | 20 |
| web | `route:client-entry` | 2582 | 396.6ms | 410.9ms | +3.6% | 410.9ms | 5.7ms | 22 |
| node | `manifest:transform` | 10 | 165.7ms | 151.1ms | -8.8% | 151.1ms | 21.0ms | 10 |
| node | `module:client-only-stub` | 10 | 142.7ms | 70.6ms | -50.5% | 70.6ms | 9.8ms | 10 |
| web | `manifest:stage` | 22 | 21.6ms | 21.3ms | -1.4% | 21.3ms | 1.4ms | 22 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 505.1ms | - | - | - | - | 20 |
| node | `route:module` | 500 | 167.7ms | - | - | - | - | 20 |
| web | `route:client-entry` | 500 | 107.0ms | 102.0ms | -4.7% | 102.0ms | 3.3ms | 20 |
| node | `module:client-only-stub` | 10 | 73.4ms | 66.5ms | -9.4% | 66.5ms | 10.8ms | 10 |
| node | `manifest:transform` | 10 | 57.0ms | 56.9ms | -0.2% | 56.9ms | 9.7ms | 10 |
| web | `manifest:stage` | 20 | 5.4ms | 5.6ms | +3.7% | 5.6ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 114.11s | 119.56s | +4.8% | 119.56s | - | 0.95x | - |
| complex app | 2 | 84.16s | 79.17s | -5.9% | 79.17s | - | 1.06x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 100.41s | 96.84s | -3.5% | 91.44s | 88.42s | 3.02s | 3.14s | 3.36s | 2.45s | -27.2% | 96.84s | - | 1.04x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28974753846)

