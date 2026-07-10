<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `cac27ea` against base `608f2f7`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 34.99s | 34.84s | -0.4% | 23.17s | 23.09s | -0.3% | 3.85s | 3.80s | -1.3% | 2.76s | 2.74s | -0.9% | 1.00x |
| Large app | 1 | 17.79s | 17.72s | -0.4% | 10.51s | 10.43s | -0.8% | 1.93s | 1.92s | -0.6% | 1.77s | 1.75s | -1.5% | 1.00x |
| Standard fixtures | 6 | 17.20s | 17.12s | -0.5% | 12.66s | 12.66s | +0.0% | 1.92s | 1.88s | -2.0% | 0.99s | 0.99s | +0.3% | 1.00x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 10.39s | 10.26s | -1.3% | 10.28s | 10.55s | 1.01x | 1589 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.39s | 4.33s | -1.4% | 4.37s | 4.67s | 1.01x | 663 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 6.35s | 6.24s | -1.7% | 6.29s | 6.52s | 1.02x | 858 MB |
| `synthetic-256-sourcemaps` | 10 | 2.25s | 2.25s | -0.1% | 2.26s | 2.42s | 1.00x | 464 MB |
| `synthetic-256-ssr-esm` | 10 | 2.14s | 2.11s | -1.3% | 2.13s | 2.34s | 1.01x | 439 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.68s | 2.65s | -1.1% | 2.66s | 2.86s | 1.01x | 490 MB |
| `synthetic-48-ssr-esm` | 10 | 1.40s | 1.36s | -2.7% | 1.38s | 1.59s | 1.03x | 316 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 17.79s | 17.72s | -0.4% | 10.51s | 10.43s | 1.93s | 1.92s | 1.77s | 1.75s | -1.5% | 17.73s | 17.89s | 1.00x | - |
| `synthetic-1024-ssr-esm` | 5 | 5.08s | 5.11s | +0.4% | 3.76s | 3.80s | 0.54s | 0.54s | 0.30s | 0.30s | +0.8% | 5.16s | 5.34s | 1.00x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 5.11s | 5.06s | -0.9% | 3.78s | 3.77s | 0.53s | 0.54s | 0.30s | 0.30s | -0.3% | 5.07s | 5.12s | 1.01x | - |
| `synthetic-256-sourcemaps` | 10 | 2.20s | 2.16s | -1.6% | 1.63s | 1.62s | 0.23s | 0.23s | 0.13s | 0.13s | -0.1% | 2.18s | 2.34s | 1.02x | - |
| `synthetic-256-ssr-esm` | 10 | 1.93s | 1.94s | +0.8% | 1.41s | 1.41s | 0.24s | 0.23s | 0.10s | 0.10s | +1.2% | 1.95s | 2.03s | 0.99x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.93s | 1.90s | -1.8% | 1.41s | 1.40s | 0.24s | 0.23s | 0.10s | 0.10s | -0.1% | 1.91s | 2.01s | 1.02x | - |
| `synthetic-48-ssr-esm` | 10 | 0.94s | 0.94s | -0.1% | 0.67s | 0.65s | 0.13s | 0.13s | 0.05s | 0.05s | +0.2% | 0.94s | 0.96s | 1.00x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1541.9ms | 1577.0ms | +2.3% | 1577.0ms | 25.3ms | 10 |
| node | `route:module` | 1785 | 766.0ms | 784.2ms | +2.4% | 784.2ms | 13.8ms | 10 |
| web | `route:client-entry` | 1785 | 394.2ms | 436.8ms | +10.8% | 436.8ms | 9.5ms | 10 |
| node | `assets:relocate-ssr-only` | 10 | 136.5ms | 136.7ms | +0.1% | 136.7ms | 14.5ms | 10 |
| node | `manifest:transform` | 5 | 106.1ms | 105.9ms | -0.2% | 105.9ms | 26.6ms | 5 |
| web | `manifest:stage` | 15 | 20.1ms | 21.1ms | +5.0% | 21.1ms | 3.3ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 1761.2ms | 1788.2ms | +1.5% | 1788.2ms | 10.6ms | 10 |
| node | `route:module` | 5130 | 876.8ms | 940.1ms | +7.2% | 940.1ms | 16.5ms | 10 |
| web | `route:client-entry` | 5130 | 593.6ms | 604.4ms | +1.8% | 604.4ms | 7.4ms | 10 |
| node | `module:client-only-stub` | 5 | 263.7ms | 216.9ms | -17.7% | 216.9ms | 69.9ms | 5 |
| node | `manifest:transform` | 5 | 194.8ms | 198.3ms | +1.8% | 198.3ms | 43.2ms | 5 |
| web | `manifest:stage` | 15 | 58.7ms | 58.2ms | -0.9% | 58.2ms | 6.8ms | 15 |
| node | `assets:relocate-ssr-only` | 10 | 2.2ms | 2.2ms | 0.0% | 2.2ms | 0.4ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 1747.6ms | 1769.6ms | +1.3% | 1769.6ms | 8.1ms | 10 |
| node | `route:module` | 5130 | 856.3ms | 897.9ms | +4.9% | 897.9ms | 16.1ms | 10 |
| web | `route:client-entry` | 5130 | 572.8ms | 585.6ms | +2.2% | 585.6ms | 6.7ms | 10 |
| node | `module:client-only-stub` | 5 | 255.7ms | 164.3ms | -35.7% | 164.3ms | 61.5ms | 5 |
| node | `manifest:transform` | 5 | 197.5ms | 203.1ms | +2.8% | 203.1ms | 44.2ms | 5 |
| web | `manifest:stage` | 15 | 60.2ms | 59.2ms | -1.7% | 59.2ms | 6.4ms | 15 |
| node | `assets:relocate-ssr-only` | 10 | 2.4ms | 2.5ms | +4.2% | 2.5ms | 0.4ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1334.4ms | 1310.3ms | -1.8% | 1310.3ms | 11.4ms | 22 |
| node | `route:module` | 2580 | 581.0ms | 632.1ms | +8.8% | 632.1ms | 4.8ms | 20 |
| web | `route:client-entry` | 2582 | 390.9ms | 374.9ms | -4.1% | 374.9ms | 5.3ms | 22 |
| node | `manifest:transform` | 10 | 136.5ms | 145.8ms | +6.8% | 145.8ms | 24.1ms | 10 |
| node | `module:client-only-stub` | 10 | 34.7ms | 25.0ms | -28.0% | 25.0ms | 5.5ms | 10 |
| web | `manifest:stage` | 33 | 25.8ms | 27.2ms | +5.4% | 27.2ms | 1.3ms | 33 |
| node | `assets:relocate-ssr-only` | 23 | 5.9ms | 5.9ms | -0.0% | 5.9ms | 0.4ms | 23 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2583 | 1230.4ms | 1228.7ms | -0.1% | 1228.7ms | 12.8ms | 23 |
| node | `route:module` | 2580 | 529.1ms | 536.6ms | +1.4% | 536.6ms | 6.7ms | 20 |
| web | `route:client-entry` | 2583 | 408.9ms | 374.4ms | -8.4% | 374.4ms | 5.3ms | 23 |
| node | `manifest:transform` | 10 | 151.9ms | 165.5ms | +9.0% | 165.5ms | 24.2ms | 10 |
| web | `manifest:stage` | 33 | 27.5ms | 27.9ms | +1.5% | 27.9ms | 1.3ms | 33 |
| node | `module:client-only-stub` | 10 | 26.1ms | 29.6ms | +13.4% | 29.6ms | 5.8ms | 10 |
| node | `assets:relocate-ssr-only` | 23 | 5.1ms | 4.4ms | -13.7% | 4.4ms | 0.4ms | 23 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1219.0ms | 1286.1ms | +5.5% | 1286.1ms | 15.8ms | 21 |
| node | `route:module` | 2580 | 522.3ms | 546.7ms | +4.7% | 546.7ms | 9.3ms | 20 |
| web | `route:client-entry` | 2581 | 417.1ms | 363.1ms | -12.9% | 363.1ms | 5.4ms | 21 |
| node | `manifest:transform` | 10 | 178.9ms | 170.5ms | -4.7% | 170.5ms | 20.4ms | 10 |
| node | `module:client-only-stub` | 10 | 29.0ms | 40.1ms | +38.3% | 40.1ms | 18.1ms | 10 |
| web | `manifest:stage` | 31 | 26.0ms | 26.3ms | +1.2% | 26.3ms | 1.3ms | 31 |
| node | `assets:relocate-ssr-only` | 21 | 4.3ms | 4.1ms | -4.7% | 4.1ms | 0.3ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 501 | 355.4ms | 346.6ms | -2.5% | 346.6ms | 7.7ms | 21 |
| node | `route:module` | 500 | 119.1ms | 136.2ms | +14.4% | 136.2ms | 2.6ms | 20 |
| web | `route:client-entry` | 501 | 83.8ms | 88.6ms | +5.7% | 88.6ms | 1.9ms | 21 |
| node | `module:client-only-stub` | 10 | 48.1ms | 73.0ms | +51.8% | 73.0ms | 11.6ms | 10 |
| node | `manifest:transform` | 10 | 45.8ms | 47.2ms | +3.1% | 47.2ms | 5.9ms | 10 |
| web | `manifest:stage` | 31 | 7.6ms | 8.0ms | +5.3% | 8.0ms | 0.4ms | 31 |
| node | `assets:relocate-ssr-only` | 21 | 4.6ms | 4.6ms | +0.0% | 4.6ms | 0.4ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 117.04s | 117.26s | +0.2% | 117.26s | - | 1.00x | - |
| complex app | 2 | 84.81s | 85.86s | +1.2% | 85.86s | - | 0.99x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 101.09s | 102.56s | +1.4% | 90.30s | 90.71s | 2.96s | 3.01s | 3.29s | 3.32s | +1.0% | 102.56s | - | 0.99x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29091448950)

