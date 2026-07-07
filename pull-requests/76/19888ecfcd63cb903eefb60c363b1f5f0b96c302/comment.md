<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `19888ec` against base `1f0c95f`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.85s | 29.66s | -0.6% | 19.92s | 19.71s | -1.1% | 4.06s | 4.16s | +2.4% | 3.31s | 3.24s | -2.0% | 1.01x |
| Large app | 1 | 13.92s | 13.80s | -0.9% | 8.47s | 8.38s | -1.0% | 2.04s | 2.02s | -1.0% | 1.75s | 1.80s | +3.2% | 1.01x |
| Standard fixtures | 6 | 15.93s | 15.86s | -0.4% | 11.45s | 11.33s | -1.1% | 2.02s | 2.14s | +5.8% | 1.57s | 1.44s | -7.9% | 1.00x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.91s | 8.90s | -0.2% | 8.97s | 9.29s | 1.00x | 1516 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.30s | 4.35s | +1.1% | 4.35s | 4.49s | 0.99x | 631 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.72s | 5.66s | -1.1% | 5.70s | 5.88s | 1.01x | 798 MB |
| `synthetic-256-sourcemaps` | 10 | 2.20s | 2.16s | -1.7% | 2.18s | 2.39s | 1.02x | 439 MB |
| `synthetic-256-ssr-esm` | 10 | 2.06s | 2.04s | -0.8% | 2.05s | 2.21s | 1.01x | 396 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.47s | 2.47s | -0.1% | 2.49s | 2.65s | 1.00x | 458 MB |
| `synthetic-48-ssr-esm` | 10 | 1.39s | 1.37s | -1.1% | 1.38s | 1.60s | 1.01x | 315 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.92s | 13.80s | -0.9% | 8.47s | 8.38s | 2.04s | 2.02s | 1.75s | 1.80s | +3.2% | 13.78s | 13.97s | 1.01x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.74s | 4.67s | -1.5% | 3.39s | 3.33s | 0.60s | 0.62s | 0.50s | 0.48s | -4.8% | 4.68s | 4.76s | 1.02x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.66s | 4.73s | +1.6% | 3.31s | 3.31s | 0.57s | 0.62s | 0.53s | 0.50s | -5.0% | 4.79s | 5.09s | 0.98x | - |
| `synthetic-256-sourcemaps` | 10 | 2.03s | 2.00s | -1.2% | 1.50s | 1.50s | 0.25s | 0.25s | 0.15s | 0.15s | -0.3% | 2.01s | 2.14s | 1.01x | - |
| `synthetic-256-ssr-esm` | 10 | 1.79s | 1.80s | +0.3% | 1.29s | 1.29s | 0.24s | 0.26s | 0.15s | 0.13s | -15.6% | 1.82s | 1.90s | 1.00x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.76s | 1.75s | -0.7% | 1.28s | 1.26s | 0.24s | 0.26s | 0.15s | 0.13s | -16.5% | 1.75s | 1.83s | 1.01x | - |
| `synthetic-48-ssr-esm` | 10 | 0.95s | 0.91s | -4.2% | 0.69s | 0.64s | 0.13s | 0.14s | 0.08s | 0.05s | -31.5% | 0.91s | 0.93s | 1.04x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1695.8ms | 1797.1ms | +6.0% | 1797.1ms | 29.8ms | 10 |
| node | `route:module` | 1785 | 925.2ms | 918.6ms | -0.7% | 918.6ms | 10.1ms | 10 |
| web | `route:client-entry` | 1785 | 416.1ms | 367.8ms | -11.6% | 367.8ms | 5.3ms | 10 |
| node | `manifest:transform` | 5 | 133.7ms | 207.8ms | +55.4% | 207.8ms | 55.0ms | 5 |
| web | `manifest:stage` | 10 | 14.4ms | 14.6ms | +1.4% | 14.6ms | 2.0ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2075.2ms | 2044.3ms | -1.5% | 2044.3ms | 10.7ms | 10 |
| node | `route:module` | 5130 | 947.3ms | 940.1ms | -0.8% | 940.1ms | 5.5ms | 10 |
| web | `route:client-entry` | 5130 | 636.8ms | 626.7ms | -1.6% | 626.7ms | 7.0ms | 10 |
| node | `manifest:transform` | 5 | 209.8ms | 206.6ms | -1.5% | 206.6ms | 43.6ms | 5 |
| node | `module:client-only-stub` | 5 | 93.8ms | 201.8ms | +115.1% | 201.8ms | 138.8ms | 5 |
| web | `manifest:stage` | 10 | 54.9ms | 48.8ms | -11.1% | 48.8ms | 8.2ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2108.5ms | 2083.1ms | -1.2% | 2083.1ms | 15.9ms | 10 |
| node | `route:module` | 5130 | 947.3ms | 968.6ms | +2.2% | 968.6ms | 13.5ms | 10 |
| web | `route:client-entry` | 5130 | 636.3ms | 652.8ms | +2.6% | 652.8ms | 8.3ms | 10 |
| node | `module:client-only-stub` | 5 | 228.0ms | 138.3ms | -39.3% | 138.3ms | 74.0ms | 5 |
| node | `manifest:transform` | 5 | 222.5ms | 214.7ms | -3.5% | 214.7ms | 47.7ms | 5 |
| web | `manifest:stage` | 10 | 53.9ms | 51.0ms | -5.4% | 51.0ms | 6.7ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1399.4ms | 1465.7ms | +4.7% | 1465.7ms | 21.5ms | 20 |
| node | `route:module` | 2580 | 596.5ms | 633.7ms | +6.2% | 633.7ms | 6.3ms | 20 |
| web | `route:client-entry` | 2580 | 407.0ms | 409.2ms | +0.5% | 409.2ms | 5.4ms | 20 |
| node | `manifest:transform` | 10 | 142.1ms | 150.3ms | +5.8% | 150.3ms | 25.0ms | 10 |
| node | `module:client-only-stub` | 10 | 137.9ms | 240.7ms | +74.5% | 240.7ms | 79.6ms | 10 |
| web | `manifest:stage` | 20 | 21.1ms | 21.1ms | 0.0% | 21.1ms | 1.5ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2583 | 1357.8ms | 1471.4ms | +8.4% | 1471.4ms | 17.5ms | 23 |
| node | `route:module` | 2580 | 569.8ms | 565.3ms | -0.8% | 565.3ms | 5.1ms | 20 |
| web | `route:client-entry` | 2583 | 389.2ms | 398.8ms | +2.5% | 398.8ms | 5.9ms | 23 |
| node | `module:client-only-stub` | 10 | 178.3ms | 58.9ms | -67.0% | 58.9ms | 22.1ms | 10 |
| node | `manifest:transform` | 10 | 166.9ms | 181.7ms | +8.9% | 181.7ms | 28.9ms | 10 |
| web | `manifest:stage` | 23 | 22.5ms | 23.8ms | +5.8% | 23.8ms | 1.4ms | 23 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1338.3ms | 1424.0ms | +6.4% | 1424.0ms | 20.5ms | 20 |
| node | `route:module` | 2580 | 564.5ms | 560.6ms | -0.7% | 560.6ms | 5.0ms | 20 |
| web | `route:client-entry` | 2580 | 391.6ms | 402.7ms | +2.8% | 402.7ms | 5.3ms | 20 |
| node | `manifest:transform` | 10 | 164.7ms | 181.6ms | +10.3% | 181.6ms | 21.5ms | 10 |
| node | `module:client-only-stub` | 10 | 110.3ms | 78.0ms | -29.3% | 78.0ms | 23.0ms | 10 |
| web | `manifest:stage` | 20 | 21.7ms | 21.0ms | -3.2% | 21.0ms | 1.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 488.6ms | 420.0ms | -14.0% | 420.0ms | 11.1ms | 20 |
| node | `route:module` | 500 | 176.9ms | 165.3ms | -6.6% | 165.3ms | 6.7ms | 20 |
| web | `route:client-entry` | 500 | 105.7ms | 116.4ms | +10.1% | 116.4ms | 3.5ms | 20 |
| node | `module:client-only-stub` | 10 | 80.8ms | 105.0ms | +30.0% | 105.0ms | 17.8ms | 10 |
| node | `manifest:transform` | 10 | 55.2ms | 50.4ms | -8.7% | 50.4ms | 6.1ms | 10 |
| web | `manifest:stage` | 20 | 5.4ms | 6.0ms | +11.1% | 6.0ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 112.87s | 112.28s | -0.5% | 112.28s | - | 1.01x | - |
| complex app | 2 | 77.83s | 81.57s | +4.8% | 81.57s | - | 0.95x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 96.70s | 100.38s | +3.8% | 87.85s | 91.46s | 2.91s | 2.94s | 3.41s | 3.37s | -1.1% | 100.38s | - | 0.96x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28832293797)

