<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `7d2914b` against base `c93ec98`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.85s | 29.55s | -1.0% | 19.80s | 19.72s | -0.4% | 4.05s | 4.09s | +1.1% | 3.39s | 3.21s | -5.3% | 1.01x |
| Large app | 1 | 13.96s | 13.82s | -1.0% | 8.50s | 8.38s | -1.4% | 2.05s | 2.02s | -1.1% | 1.83s | 1.80s | -1.6% | 1.01x |
| Standard fixtures | 6 | 15.88s | 15.73s | -1.0% | 11.31s | 11.35s | +0.3% | 2.00s | 2.07s | +3.4% | 1.56s | 1.41s | -9.7% | 1.01x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.99s | 8.90s | -1.0% | 9.00s | 9.34s | 1.01x | 1529 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.22s | 4.32s | +2.3% | 4.34s | 4.50s | 0.98x | 633 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.75s | 5.60s | -2.6% | 5.62s | 5.86s | 1.03x | 793 MB |
| `synthetic-256-sourcemaps` | 10 | 2.20s | 2.18s | -1.0% | 2.19s | 2.37s | 1.01x | 442 MB |
| `synthetic-256-ssr-esm` | 10 | 2.06s | 2.07s | +0.6% | 2.08s | 2.25s | 0.99x | 407 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.48s | 2.47s | -0.5% | 2.49s | 2.64s | 1.01x | 444 MB |
| `synthetic-48-ssr-esm` | 10 | 1.37s | 1.38s | +0.4% | 1.41s | 1.65s | 1.00x | 313 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.96s | 13.82s | -1.0% | 8.50s | 8.38s | 2.05s | 2.02s | 1.83s | 1.80s | -1.6% | 14.03s | 14.96s | 1.01x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.61s | 4.66s | +1.2% | 3.29s | 3.41s | 0.59s | 0.56s | 0.50s | 0.48s | -5.0% | 4.75s | 5.16s | 0.99x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.75s | 4.64s | -2.3% | 3.26s | 3.31s | 0.54s | 0.62s | 0.53s | 0.48s | -9.4% | 4.71s | 4.99s | 1.02x | - |
| `synthetic-256-sourcemaps` | 10 | 2.00s | 2.00s | +0.0% | 1.49s | 1.50s | 0.25s | 0.26s | 0.15s | 0.15s | -0.3% | 2.01s | 2.07s | 1.00x | - |
| `synthetic-256-ssr-esm` | 10 | 1.79s | 1.74s | -2.4% | 1.29s | 1.25s | 0.24s | 0.26s | 0.15s | 0.13s | -17.7% | 1.75s | 1.81s | 1.02x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.80s | 1.77s | -1.5% | 1.30s | 1.24s | 0.24s | 0.25s | 0.15s | 0.13s | -16.5% | 1.76s | 1.83s | 1.02x | - |
| `synthetic-48-ssr-esm` | 10 | 0.94s | 0.90s | -3.6% | 0.67s | 0.63s | 0.13s | 0.13s | 0.08s | 0.05s | -32.3% | 0.89s | 0.91s | 1.04x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1784.3ms | 1794.0ms | +0.5% | 1794.0ms | 13.2ms | 10 |
| node | `route:module` | 1785 | 908.0ms | 931.2ms | +2.6% | 931.2ms | 12.8ms | 10 |
| web | `route:client-entry` | 1785 | 400.4ms | 371.7ms | -7.2% | 371.7ms | 5.7ms | 10 |
| node | `manifest:transform` | 5 | 102.9ms | 177.3ms | +72.3% | 177.3ms | 43.7ms | 5 |
| web | `manifest:stage` | 10 | 14.2ms | 14.4ms | +1.4% | 14.4ms | 1.9ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2051.4ms | 2080.8ms | +1.4% | 2080.8ms | 16.7ms | 10 |
| node | `route:module` | 5130 | 943.1ms | 968.8ms | +2.7% | 968.8ms | 6.8ms | 10 |
| web | `route:client-entry` | 5130 | 612.2ms | 611.7ms | -0.1% | 611.7ms | 7.2ms | 10 |
| node | `manifest:transform` | 5 | 245.2ms | 263.9ms | +7.6% | 263.9ms | 69.7ms | 5 |
| node | `module:client-only-stub` | 5 | 69.5ms | 211.3ms | +204.0% | 211.3ms | 87.2ms | 5 |
| web | `manifest:stage` | 10 | 47.8ms | 51.6ms | +7.9% | 51.6ms | 10.0ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2036.3ms | 2059.0ms | +1.1% | 2059.0ms | 20.2ms | 10 |
| node | `route:module` | 5130 | 909.9ms | 936.7ms | +2.9% | 936.7ms | 6.0ms | 10 |
| web | `route:client-entry` | 5130 | 637.8ms | 646.5ms | +1.4% | 646.5ms | 6.3ms | 10 |
| node | `manifest:transform` | 5 | 213.8ms | 214.5ms | +0.3% | 214.5ms | 45.7ms | 5 |
| node | `module:client-only-stub` | 5 | 119.9ms | 84.6ms | -29.4% | 84.6ms | 23.3ms | 5 |
| web | `manifest:stage` | 10 | 70.6ms | 51.3ms | -27.3% | 51.3ms | 6.9ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1424.8ms | 1418.6ms | -0.4% | 1418.6ms | 19.0ms | 20 |
| node | `route:module` | 2580 | 589.1ms | 636.0ms | +8.0% | 636.0ms | 4.5ms | 20 |
| web | `route:client-entry` | 2580 | 405.9ms | 411.4ms | +1.4% | 411.4ms | 5.3ms | 20 |
| node | `manifest:transform` | 10 | 174.4ms | 169.6ms | -2.8% | 169.6ms | 26.0ms | 10 |
| node | `module:client-only-stub` | 10 | 103.5ms | 164.1ms | +58.6% | 164.1ms | 43.8ms | 10 |
| web | `manifest:stage` | 20 | 20.9ms | 20.8ms | -0.5% | 20.8ms | 1.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1360.6ms | 1433.0ms | +5.3% | 1433.0ms | 19.9ms | 21 |
| node | `route:module` | 2580 | 556.6ms | 555.3ms | -0.2% | 555.3ms | 4.8ms | 20 |
| web | `route:client-entry` | 2581 | 383.8ms | 388.4ms | +1.2% | 388.4ms | 5.7ms | 21 |
| node | `manifest:transform` | 10 | 180.0ms | 166.1ms | -7.7% | 166.1ms | 26.7ms | 10 |
| node | `module:client-only-stub` | 10 | 141.6ms | 44.7ms | -68.4% | 44.7ms | 17.5ms | 10 |
| web | `manifest:stage` | 21 | 22.2ms | 21.4ms | -3.6% | 21.4ms | 1.4ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2583 | 1348.2ms | 1427.4ms | +5.9% | 1427.4ms | 21.5ms | 23 |
| node | `route:module` | 2580 | 569.8ms | 586.8ms | +3.0% | 586.8ms | 8.1ms | 20 |
| web | `route:client-entry` | 2583 | 382.6ms | 376.8ms | -1.5% | 376.8ms | 5.1ms | 23 |
| node | `manifest:transform` | 10 | 169.8ms | 137.5ms | -19.0% | 137.5ms | 17.6ms | 10 |
| node | `module:client-only-stub` | 10 | 159.4ms | 195.9ms | +22.9% | 195.9ms | 71.1ms | 10 |
| web | `manifest:stage` | 23 | 21.3ms | 23.2ms | +8.9% | 23.2ms | 1.8ms | 23 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 482.0ms | 412.6ms | -14.4% | 412.6ms | 11.2ms | 20 |
| node | `route:module` | 500 | 167.2ms | 163.9ms | -2.0% | 163.9ms | 3.9ms | 20 |
| web | `route:client-entry` | 500 | 105.6ms | 112.7ms | +6.7% | 112.7ms | 3.4ms | 20 |
| node | `module:client-only-stub` | 10 | 95.8ms | 100.7ms | +5.1% | 100.7ms | 14.0ms | 10 |
| node | `manifest:transform` | 10 | 52.8ms | 50.9ms | -3.6% | 50.9ms | 6.5ms | 10 |
| web | `manifest:stage` | 20 | 5.7ms | 5.9ms | +3.5% | 5.9ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 115.46s | 112.33s | -2.7% | 112.33s | - | 1.03x | - |
| complex app | 2 | 78.95s | 79.04s | +0.1% | 79.04s | - | 1.00x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 95.71s | 96.21s | +0.5% | 86.95s | 87.57s | 2.89s | 2.85s | 3.31s | 3.27s | -1.2% | 96.21s | - | 0.99x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28684196099)

