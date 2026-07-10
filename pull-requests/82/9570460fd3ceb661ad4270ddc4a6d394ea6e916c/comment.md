<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `9570460` against base `b072c88`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 44.65s | 38.96s | -12.7% | 24.29s | 24.12s | -0.7% | 3.92s | 4.03s | +2.9% | 3.29s | 2.89s | -12.1% | 1.15x |
| Large app | 1 | 20.10s | 20.59s | +2.5% | 10.82s | 11.00s | +1.7% | 1.96s | 2.04s | +4.2% | 1.80s | 1.90s | +5.6% | 0.98x |
| Standard fixtures | 6 | 24.56s | 18.37s | -25.2% | 13.48s | 13.13s | -2.6% | 1.95s | 1.99s | +1.7% | 1.49s | 0.99s | -33.5% | 1.34x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 10.73s | 10.45s | -2.5% | 10.48s | 10.64s | 1.03x | 1593 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.30s | 4.55s | +5.6% | 4.55s | 4.73s | 0.95x | 659 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 6.60s | 6.41s | -2.8% | 6.47s | 6.73s | 1.03x | 854 MB |
| `synthetic-256-sourcemaps` | 10 | 2.36s | 2.29s | -2.9% | 2.31s | 2.51s | 1.03x | 468 MB |
| `synthetic-256-ssr-esm` | 10 | 2.17s | 2.17s | +0.2% | 2.17s | 2.35s | 1.00x | 438 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.73s | 2.75s | +0.6% | 2.72s | 2.85s | 0.99x | 490 MB |
| `synthetic-48-ssr-esm` | 10 | 1.43s | 1.40s | -1.8% | 1.43s | 1.69s | 1.02x | 320 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 20.10s | 20.59s | +2.5% | 10.82s | 11.00s | 1.96s | 2.04s | 1.80s | 1.90s | +5.6% | 20.58s | 20.86s | 0.98x | - |
| `synthetic-1024-ssr-esm` | 5 | 7.74s | 5.47s | -29.4% | 4.04s | 3.91s | 0.55s | 0.57s | 0.53s | 0.30s | -42.8% | 5.47s | 5.56s | 1.42x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 7.74s | 5.58s | -28.0% | 4.06s | 3.96s | 0.55s | 0.58s | 0.53s | 0.30s | -42.3% | 5.55s | 5.60s | 1.39x | - |
| `synthetic-256-sourcemaps` | 10 | 3.10s | 2.35s | -24.3% | 1.74s | 1.70s | 0.23s | 0.25s | 0.13s | 0.13s | +0.8% | 2.33s | 2.37s | 1.32x | - |
| `synthetic-256-ssr-esm` | 10 | 2.45s | 1.98s | -19.3% | 1.48s | 1.42s | 0.25s | 0.23s | 0.13s | 0.10s | -19.6% | 1.99s | 2.08s | 1.24x | - |
| `synthetic-256-ssr-esm-split` | 10 | 2.45s | 2.04s | -16.7% | 1.47s | 1.47s | 0.25s | 0.24s | 0.13s | 0.10s | -19.7% | 2.04s | 2.08s | 1.20x | - |
| `synthetic-48-ssr-esm` | 10 | 1.07s | 0.96s | -10.0% | 0.69s | 0.67s | 0.13s | 0.13s | 0.05s | 0.05s | +0.3% | 0.97s | 1.01s | 1.11x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1515.0ms | 1665.9ms | +10.0% | 1665.9ms | 26.4ms | 10 |
| node | `route:module` | 1785 | 761.4ms | 809.6ms | +6.3% | 809.6ms | 12.3ms | 10 |
| web | `route:client-entry` | 1785 | 482.2ms | 454.6ms | -5.7% | 454.6ms | 9.2ms | 10 |
| node | `assets:relocate-ssr-only` | 10 | 138.3ms | 139.9ms | +1.2% | 139.9ms | 15.2ms | 10 |
| node | `manifest:transform` | 5 | 114.3ms | 111.7ms | -2.3% | 111.7ms | 31.6ms | 5 |
| web | `manifest:stage` | 15 | 20.0ms | 20.8ms | +4.0% | 20.8ms | 2.0ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 1795.8ms | 1846.3ms | +2.8% | 1846.3ms | 7.3ms | 10 |
| node | `route:module` | 5130 | 937.8ms | 927.3ms | -1.1% | 927.3ms | 15.9ms | 10 |
| web | `route:client-entry` | 5130 | 623.0ms | 583.5ms | -6.3% | 583.5ms | 7.2ms | 10 |
| node | `manifest:transform` | 5 | 198.2ms | 202.3ms | +2.1% | 202.3ms | 44.2ms | 5 |
| node | `module:client-only-stub` | 5 | 107.6ms | 259.8ms | +141.4% | 259.8ms | 71.7ms | 5 |
| web | `manifest:stage` | 15 | 58.1ms | 58.8ms | +1.2% | 58.8ms | 6.5ms | 15 |
| node | `assets:relocate-ssr-only` | 10 | 2.5ms | 2.2ms | -12.0% | 2.2ms | 0.4ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5131 | 1800.3ms | 1883.9ms | +4.6% | 1883.9ms | 9.6ms | 11 |
| node | `route:module` | 5130 | 968.5ms | 948.6ms | -2.1% | 948.6ms | 16.5ms | 10 |
| web | `route:client-entry` | 5131 | 641.7ms | 601.0ms | -6.3% | 601.0ms | 8.0ms | 11 |
| node | `module:client-only-stub` | 5 | 279.1ms | 206.5ms | -26.0% | 206.5ms | 76.9ms | 5 |
| node | `manifest:transform` | 5 | 203.7ms | 207.1ms | +1.7% | 207.1ms | 50.0ms | 5 |
| web | `manifest:stage` | 16 | 58.2ms | 62.3ms | +7.0% | 62.3ms | 6.8ms | 16 |
| node | `assets:relocate-ssr-only` | 11 | 2.4ms | 2.4ms | 0.0% | 2.4ms | 0.4ms | 11 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2583 | 1383.4ms | 1354.6ms | -2.1% | 1354.6ms | 19.0ms | 23 |
| node | `route:module` | 2580 | 561.3ms | 639.5ms | +13.9% | 639.5ms | 4.8ms | 20 |
| web | `route:client-entry` | 2583 | 431.7ms | 387.6ms | -10.2% | 387.6ms | 5.4ms | 23 |
| node | `manifest:transform` | 10 | 147.7ms | 172.7ms | +16.9% | 172.7ms | 25.7ms | 10 |
| web | `manifest:stage` | 33 | 26.8ms | 29.0ms | +8.2% | 29.0ms | 1.3ms | 33 |
| node | `module:client-only-stub` | 10 | 19.9ms | 22.3ms | +12.1% | 22.3ms | 2.8ms | 10 |
| node | `assets:relocate-ssr-only` | 24 | 6.0ms | 6.8ms | +13.3% | 6.8ms | 0.4ms | 24 |
| web | `manifest:transform` | 10 | 1.0ms | 1.1ms | +10.0% | 1.1ms | 0.2ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1273.7ms | 1266.9ms | -0.5% | 1266.9ms | 16.9ms | 21 |
| node | `route:module` | 2580 | 565.3ms | 534.0ms | -5.5% | 534.0ms | 4.5ms | 20 |
| web | `route:client-entry` | 2581 | 441.4ms | 376.4ms | -14.7% | 376.4ms | 5.7ms | 21 |
| node | `manifest:transform` | 10 | 167.4ms | 143.1ms | -14.5% | 143.1ms | 21.0ms | 10 |
| node | `module:client-only-stub` | 10 | 30.0ms | 32.0ms | +6.7% | 32.0ms | 5.0ms | 10 |
| web | `manifest:stage` | 31 | 27.8ms | 27.4ms | -1.4% | 27.4ms | 1.4ms | 31 |
| node | `assets:relocate-ssr-only` | 21 | 4.9ms | 4.4ms | -10.2% | 4.4ms | 0.4ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1265.7ms | 1330.3ms | +5.1% | 1330.3ms | 14.8ms | 22 |
| node | `route:module` | 2580 | 537.6ms | 551.7ms | +2.6% | 551.7ms | 5.8ms | 20 |
| web | `route:client-entry` | 2582 | 476.9ms | 386.7ms | -18.9% | 386.7ms | 5.9ms | 22 |
| node | `manifest:transform` | 10 | 144.3ms | 193.1ms | +33.8% | 193.1ms | 26.0ms | 10 |
| web | `manifest:stage` | 32 | 27.5ms | 31.2ms | +13.5% | 31.2ms | 4.2ms | 32 |
| node | `module:client-only-stub` | 10 | 20.8ms | 34.5ms | +65.9% | 34.5ms | 10.6ms | 10 |
| node | `assets:relocate-ssr-only` | 22 | 4.3ms | 4.7ms | +9.3% | 4.7ms | 0.4ms | 22 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 367.1ms | 356.6ms | -2.9% | 356.6ms | 7.6ms | 20 |
| node | `route:module` | 500 | 133.9ms | 139.2ms | +4.0% | 139.2ms | 0.7ms | 20 |
| web | `route:client-entry` | 500 | 98.8ms | 87.4ms | -11.5% | 87.4ms | 2.0ms | 20 |
| node | `module:client-only-stub` | 10 | 72.4ms | 82.0ms | +13.3% | 82.0ms | 12.2ms | 10 |
| node | `manifest:transform` | 10 | 45.4ms | 46.6ms | +2.6% | 46.6ms | 6.4ms | 10 |
| web | `manifest:stage` | 30 | 8.0ms | 7.9ms | -1.2% | 7.9ms | 0.4ms | 30 |
| node | `assets:relocate-ssr-only` | 20 | 4.8ms | 4.8ms | 0.0% | 4.8ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 125.09s | 122.89s | -1.8% | 122.89s | - | 1.02x | - |
| complex app | 2 | 87.83s | 94.23s | +7.3% | 94.23s | - | 0.93x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 105.97s | 105.84s | -0.1% | 93.08s | 93.21s | 3.04s | 3.00s | 3.50s | 3.38s | -3.3% | 105.84s | - | 1.00x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29089006223)

