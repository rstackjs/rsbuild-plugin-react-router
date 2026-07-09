<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `93fd0c3` against base `9018ef6`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 30.46s | 46.14s | +51.5% | 20.22s | 24.76s | +22.5% | 4.17s | 4.10s | -1.7% | 3.49s | 3.47s | -0.7% | 0.66x |
| Large app | 1 | 14.31s | 21.00s | +46.7% | 8.66s | 11.17s | +28.9% | 2.10s | 2.07s | -1.2% | 1.90s | 1.98s | +4.0% | 0.68x |
| Standard fixtures | 6 | 16.14s | 25.14s | +55.8% | 11.55s | 13.59s | +17.6% | 2.07s | 2.03s | -2.2% | 1.59s | 1.49s | -6.3% | 0.64x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.89s | 10.64s | +19.6% | 10.66s | 10.86s | 0.84x | 1581 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.21s | 4.56s | +8.4% | 4.62s | 4.90s | 0.92x | 666 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.68s | 6.53s | +14.9% | 6.57s | 6.84s | 0.87x | 868 MB |
| `synthetic-256-sourcemaps` | 10 | 2.24s | 2.31s | +3.1% | 2.32s | 2.46s | 0.97x | 466 MB |
| `synthetic-256-ssr-esm` | 10 | 2.09s | 2.20s | +5.5% | 2.20s | 2.30s | 0.95x | 421 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.48s | 2.69s | +8.7% | 2.71s | 2.88s | 0.92x | 489 MB |
| `synthetic-48-ssr-esm` | 10 | 1.36s | 1.42s | +4.1% | 1.44s | 1.64s | 0.96x | 316 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.31s | 21.00s | +46.7% | 8.66s | 11.17s | 2.10s | 2.07s | 1.90s | 1.98s | +4.0% | 21.04s | 21.17s | 0.68x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.76s | 7.91s | +66.1% | 3.36s | 4.05s | 0.60s | 0.57s | 0.50s | 0.53s | +5.1% | 7.89s | 7.93s | 0.60x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.81s | 7.92s | +64.6% | 3.40s | 4.07s | 0.59s | 0.58s | 0.56s | 0.53s | -5.0% | 7.92s | 7.99s | 0.61x | - |
| `synthetic-256-sourcemaps` | 10 | 2.08s | 3.20s | +53.5% | 1.55s | 1.76s | 0.27s | 0.25s | 0.15s | 0.13s | -16.7% | 3.17s | 3.29s | 0.65x | - |
| `synthetic-256-ssr-esm` | 10 | 1.76s | 2.50s | +42.3% | 1.27s | 1.51s | 0.24s | 0.25s | 0.15s | 0.13s | -16.5% | 2.51s | 2.61s | 0.70x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.80s | 2.52s | +39.5% | 1.30s | 1.51s | 0.25s | 0.25s | 0.15s | 0.13s | -15.8% | 2.50s | 2.59s | 0.72x | - |
| `synthetic-48-ssr-esm` | 10 | 0.92s | 1.10s | +18.8% | 0.67s | 0.70s | 0.13s | 0.13s | 0.08s | 0.05s | -32.2% | 1.09s | 1.15s | 0.84x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1810.3ms | 1592.1ms | -12.1% | 1592.1ms | 14.0ms | 10 |
| node | `route:module` | 1785 | 949.3ms | 801.4ms | -15.6% | 801.4ms | 13.2ms | 10 |
| web | `route:client-entry` | 1785 | 410.5ms | 465.1ms | +13.3% | 465.1ms | 11.5ms | 10 |
| node | `manifest:transform` | 5 | 118.3ms | 105.3ms | -11.0% | 105.3ms | 26.1ms | 5 |
| web | `manifest:stage` | 15 | 18.6ms | 21.3ms | +14.5% | 21.3ms | 2.0ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 142.5ms | - | 142.5ms | 15.0ms | 10 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2119.2ms | 1827.1ms | -13.8% | 1827.1ms | 7.9ms | 10 |
| node | `route:module` | 5130 | 971.4ms | 959.3ms | -1.2% | 959.3ms | 13.5ms | 10 |
| web | `route:client-entry` | 5130 | 620.8ms | 635.9ms | +2.4% | 635.9ms | 7.3ms | 10 |
| node | `manifest:transform` | 5 | 225.0ms | 204.3ms | -9.2% | 204.3ms | 43.9ms | 5 |
| node | `module:client-only-stub` | 5 | 60.3ms | 128.6ms | +113.3% | 128.6ms | 47.6ms | 5 |
| web | `manifest:stage` | 15 | 60.0ms | 59.2ms | -1.3% | 59.2ms | 6.7ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.3ms | - | 2.3ms | 0.4ms | 10 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2124.8ms | 1837.1ms | -13.5% | 1837.1ms | 6.5ms | 10 |
| node | `route:module` | 5130 | 973.0ms | 949.4ms | -2.4% | 949.4ms | 6.3ms | 10 |
| web | `route:client-entry` | 5130 | 638.2ms | 640.5ms | +0.4% | 640.5ms | 8.1ms | 10 |
| node | `manifest:transform` | 5 | 219.5ms | 199.4ms | -9.2% | 199.4ms | 42.8ms | 5 |
| node | `module:client-only-stub` | 5 | 124.7ms | 190.1ms | +52.4% | 190.1ms | 71.5ms | 5 |
| web | `manifest:stage` | 15 | 67.6ms | 60.1ms | -11.1% | 60.1ms | 6.8ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.1ms | - | 2.1ms | 0.4ms | 10 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1450.3ms | 1361.2ms | -6.1% | 1361.2ms | 11.4ms | 21 |
| node | `route:module` | 2580 | 609.4ms | 659.6ms | +8.2% | 659.6ms | 9.7ms | 20 |
| web | `route:client-entry` | 2581 | 410.2ms | 412.3ms | +0.5% | 412.3ms | 5.8ms | 21 |
| node | `module:client-only-stub` | 10 | 193.8ms | 26.0ms | -86.6% | 26.0ms | 3.8ms | 10 |
| node | `manifest:transform` | 10 | 171.7ms | 171.0ms | -0.4% | 171.0ms | 22.7ms | 10 |
| web | `manifest:stage` | 31 | 24.3ms | 29.9ms | +23.0% | 29.9ms | 3.6ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 6.2ms | - | 6.2ms | 0.4ms | 21 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1351.2ms | 1315.8ms | -2.6% | 1315.8ms | 15.7ms | 21 |
| node | `route:module` | 2580 | 539.8ms | 652.7ms | +20.9% | 652.7ms | 7.9ms | 20 |
| web | `route:client-entry` | 2581 | 395.6ms | 404.0ms | +2.1% | 404.0ms | 5.6ms | 21 |
| node | `manifest:transform` | 10 | 166.0ms | 178.9ms | +7.8% | 178.9ms | 22.0ms | 10 |
| node | `module:client-only-stub` | 10 | 96.2ms | 37.4ms | -61.1% | 37.4ms | 11.5ms | 10 |
| web | `manifest:stage` | 31 | 20.2ms | 28.9ms | +43.1% | 28.9ms | 1.7ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 4.7ms | - | 4.7ms | 0.4ms | 21 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2583 | 1414.3ms | 1275.2ms | -9.8% | 1275.2ms | 11.2ms | 23 |
| node | `route:module` | 2580 | 564.9ms | 624.9ms | +10.6% | 624.9ms | 8.6ms | 20 |
| web | `route:client-entry` | 2583 | 401.9ms | 415.2ms | +3.3% | 415.2ms | 5.9ms | 23 |
| node | `manifest:transform` | 10 | 162.1ms | 167.3ms | +3.2% | 167.3ms | 24.6ms | 10 |
| node | `module:client-only-stub` | 10 | 88.4ms | 33.2ms | -62.4% | 33.2ms | 6.0ms | 10 |
| web | `manifest:stage` | 33 | 21.4ms | 30.0ms | +40.2% | 30.0ms | 1.5ms | 33 |
| web | `manifest:transform` | 10 | 1.1ms | 1.0ms | -9.1% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 23 | - | 4.9ms | - | 4.9ms | 0.4ms | 23 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 501 | 502.3ms | 375.3ms | -25.3% | 375.3ms | 9.5ms | 21 |
| node | `route:module` | 500 | 165.2ms | 142.4ms | -13.8% | 142.4ms | 0.6ms | 20 |
| web | `route:client-entry` | 501 | 108.5ms | 89.5ms | -17.5% | 89.5ms | 2.0ms | 21 |
| node | `module:client-only-stub` | 10 | 83.4ms | 105.6ms | +26.6% | 105.6ms | 17.8ms | 10 |
| node | `manifest:transform` | 10 | 63.9ms | 45.5ms | -28.8% | 45.5ms | 6.1ms | 10 |
| web | `manifest:stage` | 31 | 5.3ms | 8.4ms | +58.5% | 8.4ms | 0.5ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 5.0ms | - | 5.0ms | 0.4ms | 21 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 123.07s | 125.56s | +2.0% | 125.56s | - | 0.98x | - |
| complex app | 2 | 80.49s | 93.44s | +16.1% | 93.44s | - | 0.86x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 98.57s | 106.61s | +8.2% | 89.60s | 93.65s | 3.04s | 3.09s | 3.37s | 3.45s | +2.4% | 106.61s | - | 0.92x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29006656778)

