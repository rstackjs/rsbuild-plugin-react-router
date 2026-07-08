<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `bf38749` against base `9e95ea0`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.37s | 28.36s | -3.4% | 19.51s | 19.02s | -2.5% | 4.11s | 3.85s | -6.2% | 3.29s | 3.10s | -5.6% | 1.04x |
| Large app | 1 | 13.84s | 13.28s | -4.1% | 8.41s | 8.11s | -3.6% | 2.08s | 1.93s | -7.2% | 1.80s | 1.69s | -6.0% | 1.04x |
| Standard fixtures | 6 | 15.53s | 15.09s | -2.8% | 11.11s | 10.91s | -1.8% | 2.03s | 1.93s | -5.2% | 1.49s | 1.41s | -5.1% | 1.03x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.59s | 8.45s | -1.6% | 8.48s | 8.62s | 1.02x | 1518 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.34s | 4.13s | -4.9% | 4.14s | 4.25s | 1.05x | 660 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.66s | 5.50s | -2.9% | 5.51s | 5.66s | 1.03x | 821 MB |
| `synthetic-256-sourcemaps` | 10 | 2.19s | 2.16s | -1.2% | 2.17s | 2.34s | 1.01x | 448 MB |
| `synthetic-256-ssr-esm` | 10 | 2.07s | 2.04s | -1.6% | 2.04s | 2.22s | 1.02x | 425 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.49s | 2.46s | -1.3% | 2.46s | 2.62s | 1.01x | 461 MB |
| `synthetic-48-ssr-esm` | 10 | 1.38s | 1.36s | -1.6% | 1.41s | 1.62s | 1.02x | 320 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.84s | 13.28s | -4.1% | 8.41s | 8.11s | 2.08s | 1.93s | 1.80s | 1.69s | -6.0% | 13.46s | 14.17s | 1.04x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.53s | 4.40s | -2.9% | 3.22s | 3.15s | 0.56s | 0.56s | 0.50s | 0.48s | -5.3% | 4.43s | 4.52s | 1.03x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.55s | 4.48s | -1.6% | 3.23s | 3.24s | 0.59s | 0.54s | 0.48s | 0.48s | +0.3% | 4.48s | 4.58s | 1.02x | - |
| `synthetic-256-sourcemaps` | 10 | 2.01s | 1.93s | -4.1% | 1.49s | 1.45s | 0.26s | 0.22s | 0.15s | 0.15s | +0.1% | 1.93s | 1.99s | 1.04x | - |
| `synthetic-256-ssr-esm` | 10 | 1.75s | 1.68s | -3.9% | 1.25s | 1.22s | 0.25s | 0.24s | 0.15s | 0.13s | -16.6% | 1.67s | 1.71s | 1.04x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.77s | 1.73s | -2.5% | 1.26s | 1.25s | 0.24s | 0.24s | 0.15s | 0.13s | -16.9% | 1.72s | 1.82s | 1.03x | - |
| `synthetic-48-ssr-esm` | 10 | 0.92s | 0.87s | -5.1% | 0.66s | 0.61s | 0.13s | 0.13s | 0.05s | 0.05s | +0.1% | 0.87s | 0.91s | 1.05x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1717.2ms | 1653.4ms | -3.7% | 1653.4ms | 25.7ms | 10 |
| node | `route:module` | 1785 | 891.4ms | 932.8ms | +4.6% | 932.8ms | 11.0ms | 10 |
| web | `route:client-entry` | 1785 | 382.8ms | 354.1ms | -7.5% | 354.1ms | 5.4ms | 10 |
| node | `manifest:transform` | 5 | 99.2ms | 139.8ms | +40.9% | 139.8ms | 42.2ms | 5 |
| web | `manifest:stage` | 10 | 14.9ms | 13.5ms | -9.4% | 13.5ms | 1.8ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2011.5ms | 1986.8ms | -1.2% | 1986.8ms | 14.8ms | 10 |
| node | `route:module` | 5130 | 957.1ms | 930.5ms | -2.8% | 930.5ms | 9.6ms | 10 |
| node | `module:client-only-stub` | 5 | 675.5ms | 146.1ms | -78.4% | 146.1ms | 66.7ms | 5 |
| web | `route:client-entry` | 5130 | 618.8ms | 644.6ms | +4.2% | 644.6ms | 7.1ms | 10 |
| node | `manifest:transform` | 5 | 219.6ms | 190.2ms | -13.4% | 190.2ms | 40.5ms | 5 |
| web | `manifest:stage` | 10 | 52.5ms | 51.7ms | -1.5% | 51.7ms | 7.8ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2029.7ms | 2077.9ms | +2.4% | 2077.9ms | 17.3ms | 10 |
| node | `route:module` | 5130 | 930.6ms | 929.4ms | -0.1% | 929.4ms | 6.0ms | 10 |
| web | `route:client-entry` | 5130 | 621.0ms | 627.2ms | +1.0% | 627.2ms | 8.2ms | 10 |
| node | `manifest:transform` | 5 | 219.9ms | 202.9ms | -7.7% | 202.9ms | 42.7ms | 5 |
| node | `module:client-only-stub` | 5 | 156.2ms | 271.6ms | +73.9% | 271.6ms | 149.6ms | 5 |
| web | `manifest:stage` | 10 | 52.9ms | 50.9ms | -3.8% | 50.9ms | 7.8ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2583 | 1408.5ms | 1401.3ms | -0.5% | 1401.3ms | 20.9ms | 23 |
| node | `route:module` | 2580 | 593.5ms | 634.0ms | +6.8% | 634.0ms | 6.3ms | 20 |
| web | `route:client-entry` | 2583 | 412.2ms | 395.7ms | -4.0% | 395.7ms | 4.8ms | 23 |
| node | `manifest:transform` | 10 | 142.4ms | 149.6ms | +5.1% | 149.6ms | 19.4ms | 10 |
| node | `module:client-only-stub` | 10 | 121.1ms | 114.6ms | -5.4% | 114.6ms | 53.1ms | 10 |
| web | `manifest:stage` | 23 | 21.5ms | 21.7ms | +0.9% | 21.7ms | 1.3ms | 23 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1344.2ms | 1426.1ms | +6.1% | 1426.1ms | 19.4ms | 20 |
| node | `route:module` | 2580 | 539.8ms | 529.1ms | -2.0% | 529.1ms | 7.7ms | 20 |
| web | `route:client-entry` | 2580 | 382.0ms | 386.5ms | +1.2% | 386.5ms | 4.8ms | 20 |
| node | `manifest:transform` | 10 | 164.8ms | 161.0ms | -2.3% | 161.0ms | 20.7ms | 10 |
| node | `module:client-only-stub` | 10 | 131.3ms | 165.3ms | +25.9% | 165.3ms | 69.0ms | 10 |
| web | `manifest:stage` | 20 | 21.2ms | 19.4ms | -8.5% | 19.4ms | 1.3ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2584 | 1360.7ms | 1380.1ms | +1.4% | 1380.1ms | 12.5ms | 24 |
| node | `route:module` | 2580 | 550.6ms | 541.3ms | -1.7% | 541.3ms | 4.4ms | 20 |
| web | `route:client-entry` | 2584 | 383.0ms | 381.9ms | -0.3% | 381.9ms | 4.8ms | 24 |
| node | `module:client-only-stub` | 10 | 213.0ms | 267.2ms | +25.4% | 267.2ms | 95.5ms | 10 |
| node | `manifest:transform` | 10 | 165.7ms | 165.3ms | -0.2% | 165.3ms | 20.0ms | 10 |
| web | `manifest:stage` | 24 | 22.5ms | 22.6ms | +0.4% | 22.6ms | 1.3ms | 24 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 504.2ms | 424.4ms | -15.8% | 424.4ms | 9.9ms | 20 |
| node | `route:module` | 500 | 172.6ms | 154.5ms | -10.5% | 154.5ms | 5.5ms | 20 |
| web | `route:client-entry` | 500 | 104.0ms | 109.6ms | +5.4% | 109.6ms | 3.6ms | 20 |
| node | `module:client-only-stub` | 10 | 91.2ms | 103.3ms | +13.3% | 103.3ms | 17.9ms | 10 |
| node | `manifest:transform` | 10 | 58.2ms | 52.0ms | -10.7% | 52.0ms | 6.4ms | 10 |
| web | `manifest:stage` | 20 | 5.1ms | 5.6ms | +9.8% | 5.6ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 117.02s | 108.24s | -7.5% | 108.24s | - | 1.08x | - |
| complex app | 2 | 79.10s | 75.49s | -4.6% | 75.49s | - | 1.05x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 96.40s | 93.78s | -2.7% | 87.82s | 85.24s | 2.83s | 2.80s | 3.23s | 3.25s | +0.8% | 93.78s | - | 1.03x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28914270491)

