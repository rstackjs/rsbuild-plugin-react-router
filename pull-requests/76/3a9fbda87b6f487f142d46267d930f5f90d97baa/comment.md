<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `3a9fbda` against base `479565b`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 27.59s | 27.25s | -1.3% | 18.40s | 18.17s | -1.3% | 3.73s | 3.78s | +1.5% | 3.16s | 3.08s | -2.5% | 1.01x |
| Large app | 1 | 12.94s | 12.85s | -0.7% | 7.90s | 7.85s | -0.6% | 1.88s | 1.85s | -1.3% | 1.67s | 1.67s | +0.0% | 1.01x |
| Standard fixtures | 6 | 14.66s | 14.40s | -1.7% | 10.50s | 10.32s | -1.8% | 1.85s | 1.93s | +4.4% | 1.49s | 1.41s | -5.4% | 1.02x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.27s | 8.28s | +0.1% | 8.32s | 8.51s | 1.00x | 1521 MB |
| `synthetic-1024-ssr-esm` | 5 | 3.88s | 3.78s | -2.5% | 3.84s | 4.02s | 1.03x | 614 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.23s | 5.14s | -1.8% | 5.17s | 5.43s | 1.02x | 819 MB |
| `synthetic-256-sourcemaps` | 10 | 2.07s | 2.03s | -1.7% | 2.04s | 2.19s | 1.02x | 445 MB |
| `synthetic-256-ssr-esm` | 10 | 1.92s | 1.88s | -1.7% | 1.90s | 2.05s | 1.02x | 398 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.30s | 2.28s | -0.8% | 2.28s | 2.40s | 1.01x | 443 MB |
| `synthetic-48-ssr-esm` | 10 | 1.29s | 1.29s | -0.3% | 1.31s | 1.53s | 1.00x | 314 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 12.94s | 12.85s | -0.7% | 7.90s | 7.85s | 1.88s | 1.85s | 1.67s | 1.67s | +0.0% | 12.82s | 12.93s | 1.01x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.28s | 4.28s | -0.0% | 3.04s | 3.04s | 0.52s | 0.56s | 0.50s | 0.48s | -5.4% | 4.27s | 4.38s | 1.00x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.32s | 4.19s | -3.1% | 3.07s | 2.97s | 0.52s | 0.56s | 0.51s | 0.48s | -5.2% | 4.23s | 4.32s | 1.03x | - |
| `synthetic-256-sourcemaps` | 10 | 1.89s | 1.84s | -2.3% | 1.41s | 1.39s | 0.24s | 0.22s | 0.15s | 0.15s | -0.3% | 1.85s | 1.94s | 1.02x | - |
| `synthetic-256-ssr-esm` | 10 | 1.65s | 1.62s | -1.8% | 1.18s | 1.17s | 0.24s | 0.23s | 0.13s | 0.13s | -0.7% | 1.61s | 1.63s | 1.02x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.64s | 1.62s | -1.5% | 1.18s | 1.15s | 0.22s | 0.23s | 0.15s | 0.13s | -16.8% | 1.63s | 1.69s | 1.01x | - |
| `synthetic-48-ssr-esm` | 10 | 0.87s | 0.85s | -2.5% | 0.63s | 0.61s | 0.12s | 0.12s | 0.05s | 0.05s | +0.7% | 0.84s | 0.87s | 1.03x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1712.6ms | 1741.7ms | +1.7% | 1741.7ms | 14.3ms | 10 |
| node | `route:module` | 1785 | 840.9ms | 864.1ms | +2.8% | 864.1ms | 7.6ms | 10 |
| web | `route:client-entry` | 1785 | 366.0ms | 341.7ms | -6.6% | 341.7ms | 5.5ms | 10 |
| node | `manifest:transform` | 5 | 107.8ms | 115.4ms | +7.1% | 115.4ms | 30.2ms | 5 |
| web | `manifest:stage` | 10 | 14.4ms | 14.6ms | +1.4% | 14.6ms | 2.0ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 1981.0ms | 1986.2ms | +0.3% | 1986.2ms | 15.6ms | 10 |
| node | `route:module` | 5130 | 948.3ms | 963.7ms | +1.6% | 963.7ms | 7.3ms | 10 |
| web | `route:client-entry` | 5130 | 615.9ms | 605.1ms | -1.8% | 605.1ms | 7.3ms | 10 |
| node | `module:client-only-stub` | 5 | 317.8ms | 494.1ms | +55.5% | 494.1ms | 369.3ms | 5 |
| node | `manifest:transform` | 5 | 207.2ms | 227.2ms | +9.7% | 227.2ms | 79.7ms | 5 |
| web | `manifest:stage` | 10 | 59.0ms | 50.3ms | -14.7% | 50.3ms | 8.6ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2041.2ms | 1943.9ms | -4.8% | 1943.9ms | 16.9ms | 10 |
| node | `route:module` | 5130 | 904.1ms | 929.5ms | +2.8% | 929.5ms | 5.5ms | 10 |
| web | `route:client-entry` | 5130 | 603.3ms | 595.7ms | -1.3% | 595.7ms | 7.3ms | 10 |
| node | `manifest:transform` | 5 | 205.8ms | 212.7ms | +3.4% | 212.7ms | 50.1ms | 5 |
| node | `module:client-only-stub` | 5 | 120.4ms | 489.1ms | +306.2% | 489.1ms | 412.0ms | 5 |
| web | `manifest:stage` | 10 | 69.2ms | 55.0ms | -20.5% | 55.0ms | 8.7ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1368.5ms | 1383.0ms | +1.1% | 1383.0ms | 17.9ms | 20 |
| node | `route:module` | 2580 | 570.9ms | 597.6ms | +4.7% | 597.6ms | 7.6ms | 20 |
| web | `route:client-entry` | 2580 | 392.5ms | 401.0ms | +2.2% | 401.0ms | 5.2ms | 20 |
| node | `manifest:transform` | 10 | 145.5ms | 148.1ms | +1.8% | 148.1ms | 20.8ms | 10 |
| node | `module:client-only-stub` | 10 | 108.4ms | 237.0ms | +118.6% | 237.0ms | 120.9ms | 10 |
| web | `manifest:stage` | 20 | 21.0ms | 20.8ms | -1.0% | 20.8ms | 1.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1276.2ms | 1379.3ms | +8.1% | 1379.3ms | 17.8ms | 20 |
| node | `route:module` | 2580 | 532.1ms | 549.6ms | +3.3% | 549.6ms | 4.4ms | 20 |
| web | `route:client-entry` | 2580 | 380.8ms | 399.0ms | +4.8% | 399.0ms | 5.2ms | 20 |
| node | `module:client-only-stub` | 10 | 187.4ms | 215.4ms | +14.9% | 215.4ms | 111.0ms | 10 |
| node | `manifest:transform` | 10 | 141.5ms | 151.6ms | +7.1% | 151.6ms | 19.5ms | 10 |
| web | `manifest:stage` | 20 | 20.3ms | 20.9ms | +3.0% | 20.9ms | 1.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1296.0ms | 1344.4ms | +3.7% | 1344.4ms | 19.4ms | 21 |
| node | `route:module` | 2580 | 549.3ms | 548.9ms | -0.1% | 548.9ms | 5.4ms | 20 |
| web | `route:client-entry` | 2581 | 374.8ms | 389.6ms | +3.9% | 389.6ms | 5.1ms | 21 |
| node | `manifest:transform` | 10 | 144.4ms | 137.9ms | -4.5% | 137.9ms | 17.6ms | 10 |
| node | `module:client-only-stub` | 10 | 111.6ms | 249.3ms | +123.4% | 249.3ms | 116.5ms | 10 |
| web | `manifest:stage` | 21 | 20.9ms | 21.1ms | +1.0% | 21.1ms | 1.4ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 454.9ms | 384.9ms | -15.4% | 384.9ms | 8.4ms | 20 |
| node | `route:module` | 500 | 154.7ms | 147.7ms | -4.5% | 147.7ms | 0.8ms | 20 |
| web | `route:client-entry` | 500 | 103.4ms | 108.6ms | +5.0% | 108.6ms | 3.3ms | 20 |
| node | `module:client-only-stub` | 10 | 66.5ms | 94.6ms | +42.3% | 94.6ms | 15.4ms | 10 |
| node | `manifest:transform` | 10 | 51.9ms | 57.3ms | +10.4% | 57.3ms | 8.1ms | 10 |
| web | `manifest:stage` | 20 | 5.2ms | 5.7ms | +9.6% | 5.7ms | 0.5ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 109.27s | 109.08s | -0.2% | 109.08s | - | 1.00x | - |
| complex app | 2 | 75.89s | 76.64s | +1.0% | 76.64s | - | 0.99x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 91.63s | 92.27s | +0.7% | 83.41s | 84.04s | 2.60s | 2.64s | 3.28s | 3.16s | -3.5% | 92.27s | - | 0.99x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28834169741)

