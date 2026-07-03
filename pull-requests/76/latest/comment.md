<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `b3fce8d` against base `7d2914b`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.98s | 29.38s | -2.0% | 19.87s | 19.52s | -1.8% | 4.08s | 4.06s | -0.4% | 3.30s | 3.21s | -2.5% | 1.02x |
| Large app | 1 | 14.10s | 13.92s | -1.3% | 8.44s | 8.45s | +0.1% | 2.02s | 2.00s | -0.8% | 1.80s | 1.79s | -0.3% | 1.01x |
| Standard fixtures | 6 | 15.88s | 15.46s | -2.7% | 11.43s | 11.07s | -3.2% | 2.06s | 2.06s | -0.1% | 1.49s | 1.42s | -5.2% | 1.03x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.77s | 8.68s | -1.0% | 8.74s | 9.01s | 1.01x | 1521 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.20s | 4.15s | -1.4% | 4.19s | 4.49s | 1.01x | 629 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.63s | 5.62s | -0.3% | 5.65s | 5.86s | 1.00x | 820 MB |
| `synthetic-256-sourcemaps` | 10 | 2.17s | 2.15s | -0.9% | 2.16s | 2.28s | 1.01x | 438 MB |
| `synthetic-256-ssr-esm` | 10 | 2.05s | 2.04s | -0.3% | 2.06s | 2.24s | 1.00x | 419 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.47s | 2.48s | +0.3% | 2.49s | 2.61s | 1.00x | 440 MB |
| `synthetic-48-ssr-esm` | 10 | 1.36s | 1.35s | -1.3% | 1.37s | 1.55s | 1.01x | 312 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.10s | 13.92s | -1.3% | 8.44s | 8.45s | 2.02s | 2.00s | 1.80s | 1.79s | -0.3% | 14.12s | 15.28s | 1.01x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.65s | 4.52s | -2.7% | 3.34s | 3.21s | 0.60s | 0.59s | 0.48s | 0.48s | -0.4% | 4.51s | 4.57s | 1.03x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.70s | 4.55s | -3.2% | 3.39s | 3.25s | 0.61s | 0.59s | 0.51s | 0.48s | -5.3% | 4.58s | 4.69s | 1.03x | - |
| `synthetic-256-sourcemaps` | 10 | 2.03s | 2.00s | -1.6% | 1.51s | 1.49s | 0.25s | 0.25s | 0.15s | 0.15s | +0.2% | 1.99s | 2.07s | 1.02x | - |
| `synthetic-256-ssr-esm` | 10 | 1.82s | 1.75s | -3.8% | 1.27s | 1.24s | 0.23s | 0.25s | 0.15s | 0.13s | -17.0% | 1.74s | 1.78s | 1.04x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.78s | 1.76s | -1.0% | 1.27s | 1.25s | 0.24s | 0.25s | 0.15s | 0.13s | -15.5% | 1.76s | 1.82s | 1.01x | - |
| `synthetic-48-ssr-esm` | 10 | 0.92s | 0.89s | -3.0% | 0.66s | 0.64s | 0.13s | 0.13s | 0.05s | 0.05s | +0.2% | 0.89s | 0.92s | 1.03x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1786 | 1693.0ms | 1800.7ms | +6.4% | 1800.7ms | 12.8ms | 11 |
| node | `route:module` | 1785 | 891.5ms | 890.1ms | -0.2% | 890.1ms | 6.0ms | 10 |
| web | `route:client-entry` | 1786 | 362.7ms | 346.3ms | -4.5% | 346.3ms | 5.3ms | 11 |
| node | `manifest:transform` | 5 | 122.3ms | 161.9ms | +32.4% | 161.9ms | 55.9ms | 5 |
| web | `manifest:stage` | 11 | 14.4ms | 15.9ms | +10.4% | 15.9ms | 1.9ms | 11 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2096.7ms | 2024.5ms | -3.4% | 2024.5ms | 16.5ms | 10 |
| node | `route:module` | 5130 | 962.2ms | 939.4ms | -2.4% | 939.4ms | 6.9ms | 10 |
| web | `route:client-entry` | 5130 | 614.5ms | 584.4ms | -4.9% | 584.4ms | 5.9ms | 10 |
| node | `manifest:transform` | 5 | 215.0ms | 241.8ms | +12.5% | 241.8ms | 73.7ms | 5 |
| node | `module:client-only-stub` | 5 | 112.8ms | 117.1ms | +3.8% | 117.1ms | 41.8ms | 5 |
| web | `manifest:stage` | 10 | 54.3ms | 51.1ms | -5.9% | 51.1ms | 7.1ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2072.6ms | 2031.8ms | -2.0% | 2031.8ms | 18.2ms | 10 |
| node | `route:module` | 5130 | 956.6ms | 924.8ms | -3.3% | 924.8ms | 5.2ms | 10 |
| web | `route:client-entry` | 5130 | 632.0ms | 658.2ms | +4.1% | 658.2ms | 7.1ms | 10 |
| node | `manifest:transform` | 5 | 195.8ms | 216.2ms | +10.4% | 216.2ms | 47.9ms | 5 |
| node | `module:client-only-stub` | 5 | 82.6ms | 338.5ms | +309.8% | 338.5ms | 194.3ms | 5 |
| web | `manifest:stage` | 10 | 54.8ms | 51.4ms | -6.2% | 51.4ms | 8.2ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1433.2ms | 1451.3ms | +1.3% | 1451.3ms | 21.0ms | 21 |
| node | `route:module` | 2580 | 600.7ms | 614.5ms | +2.3% | 614.5ms | 4.6ms | 20 |
| web | `route:client-entry` | 2581 | 404.3ms | 406.3ms | +0.5% | 406.3ms | 5.8ms | 21 |
| node | `module:client-only-stub` | 10 | 229.9ms | 153.4ms | -33.3% | 153.4ms | 41.5ms | 10 |
| node | `manifest:transform` | 10 | 160.4ms | 160.1ms | -0.2% | 160.1ms | 20.9ms | 10 |
| web | `manifest:stage` | 21 | 21.9ms | 21.3ms | -2.7% | 21.3ms | 1.4ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1349.3ms | 1418.8ms | +5.2% | 1418.8ms | 17.9ms | 21 |
| node | `route:module` | 2580 | 578.6ms | 548.0ms | -5.3% | 548.0ms | 4.3ms | 20 |
| web | `route:client-entry` | 2581 | 382.9ms | 421.6ms | +10.1% | 421.6ms | 5.7ms | 21 |
| node | `manifest:transform` | 10 | 150.4ms | 153.3ms | +1.9% | 153.3ms | 20.2ms | 10 |
| node | `module:client-only-stub` | 10 | 66.1ms | 147.4ms | +123.0% | 147.4ms | 66.0ms | 10 |
| web | `manifest:stage` | 21 | 23.0ms | 21.5ms | -6.5% | 21.5ms | 1.4ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2584 | 1349.5ms | 1445.3ms | +7.1% | 1445.3ms | 22.7ms | 24 |
| node | `route:module` | 2580 | 550.8ms | 565.2ms | +2.6% | 565.2ms | 4.5ms | 20 |
| web | `route:client-entry` | 2584 | 378.2ms | 397.7ms | +5.2% | 397.7ms | 6.5ms | 24 |
| node | `module:client-only-stub` | 10 | 238.4ms | 237.7ms | -0.3% | 237.7ms | 95.9ms | 10 |
| node | `manifest:transform` | 10 | 179.9ms | 180.0ms | +0.1% | 180.0ms | 24.9ms | 10 |
| web | `manifest:stage` | 24 | 22.3ms | 23.8ms | +6.7% | 23.8ms | 1.4ms | 24 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 501.7ms | 436.6ms | -13.0% | 436.6ms | 9.0ms | 20 |
| node | `route:module` | 500 | 168.7ms | 160.2ms | -5.0% | 160.2ms | 4.4ms | 20 |
| web | `route:client-entry` | 500 | 104.3ms | 118.1ms | +13.2% | 118.1ms | 3.4ms | 20 |
| node | `module:client-only-stub` | 10 | 76.0ms | 86.0ms | +13.2% | 86.0ms | 12.6ms | 10 |
| node | `manifest:transform` | 10 | 58.1ms | 59.8ms | +2.9% | 59.8ms | 6.8ms | 10 |
| web | `manifest:stage` | 20 | 5.2ms | 5.5ms | +5.8% | 5.5ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 113.82s | 119.49s | +5.0% | 119.49s | - | 0.95x | - |
| complex app | 2 | 78.83s | 83.24s | +5.6% | 83.24s | - | 0.95x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 100.09s | 103.78s | +3.7% | 91.02s | 94.65s | 3.00s | 2.97s | 3.38s | 3.51s | +3.7% | 103.78s | - | 0.96x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28684404770)

