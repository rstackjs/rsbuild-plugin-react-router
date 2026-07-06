<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `e4e4554` against base `c93ec98`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 28.98s | 37.31s | +28.7% | 19.35s | 19.49s | +0.7% | 3.90s | 3.83s | -2.0% | 3.24s | 3.16s | -2.4% | 0.78x |
| Large app | 1 | 13.57s | 15.51s | +14.4% | 8.28s | 8.37s | +1.1% | 1.95s | 1.96s | +0.6% | 1.77s | 1.70s | -4.0% | 0.87x |
| Standard fixtures | 6 | 15.41s | 21.80s | +41.4% | 11.07s | 11.11s | +0.4% | 1.95s | 1.86s | -4.6% | 1.47s | 1.46s | -0.6% | 0.71x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.58s | 8.57s | -0.0% | 8.63s | 8.85s | 1.00x | 1536 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.16s | 3.89s | -6.6% | 3.93s | 4.20s | 1.07x | 628 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.62s | 5.39s | -4.1% | 5.39s | 5.47s | 1.04x | 803 MB |
| `synthetic-256-sourcemaps` | 10 | 2.15s | 2.09s | -2.6% | 2.09s | 2.21s | 1.03x | 446 MB |
| `synthetic-256-ssr-esm` | 10 | 2.00s | 1.97s | -1.9% | 1.97s | 2.11s | 1.02x | 414 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.41s | 2.37s | -1.4% | 2.39s | 2.59s | 1.01x | 463 MB |
| `synthetic-48-ssr-esm` | 10 | 1.35s | 1.33s | -1.6% | 1.35s | 1.61s | 1.02x | 319 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.57s | 15.51s | +14.4% | 8.28s | 8.37s | 1.95s | 1.96s | 1.77s | 1.70s | -4.0% | 15.55s | 15.64s | 0.87x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.51s | 6.82s | +51.1% | 3.21s | 3.22s | 0.53s | 0.53s | 0.51s | 0.53s | +3.7% | 6.79s | 6.89s | 0.66x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.55s | 6.87s | +51.1% | 3.25s | 3.28s | 0.58s | 0.53s | 0.48s | 0.50s | +5.3% | 6.83s | 6.89s | 0.66x | - |
| `synthetic-256-sourcemaps` | 10 | 1.97s | 2.80s | +42.7% | 1.47s | 1.50s | 0.25s | 0.22s | 0.15s | 0.13s | -16.4% | 2.77s | 2.85s | 0.70x | - |
| `synthetic-256-ssr-esm` | 10 | 1.74s | 2.17s | +24.3% | 1.26s | 1.25s | 0.24s | 0.23s | 0.13s | 0.13s | -1.2% | 2.14s | 2.18s | 0.80x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.75s | 2.14s | +22.3% | 1.24s | 1.24s | 0.23s | 0.22s | 0.15s | 0.13s | -17.1% | 2.13s | 2.16s | 0.82x | - |
| `synthetic-48-ssr-esm` | 10 | 0.89s | 0.99s | +10.6% | 0.64s | 0.62s | 0.12s | 0.13s | 0.05s | 0.05s | -0.7% | 0.99s | 1.04s | 0.90x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1697.7ms | 1698.6ms | +0.1% | 1698.6ms | 24.7ms | 10 |
| node | `route:module` | 1785 | 852.4ms | 891.2ms | +4.6% | 891.2ms | 12.1ms | 10 |
| web | `route:client-entry` | 1785 | 380.9ms | 423.3ms | +11.1% | 423.3ms | 10.2ms | 10 |
| node | `manifest:transform` | 5 | 109.0ms | 138.2ms | +26.8% | 138.2ms | 39.4ms | 5 |
| web | `manifest:stage` | 15 | 14.0ms | 19.2ms | +37.1% | 19.2ms | 1.8ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 139.6ms | - | 139.6ms | 16.1ms | 10 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2072.6ms | 1947.8ms | -6.0% | 1947.8ms | 11.9ms | 10 |
| node | `route:module` | 5130 | 942.6ms | 981.3ms | +4.1% | 981.3ms | 14.4ms | 10 |
| web | `route:client-entry` | 5130 | 637.7ms | 587.5ms | -7.9% | 587.5ms | 8.4ms | 10 |
| node | `module:client-only-stub` | 5 | 273.0ms | 157.5ms | -42.3% | 157.5ms | 54.3ms | 5 |
| node | `manifest:transform` | 5 | 217.2ms | 194.5ms | -10.5% | 194.5ms | 43.4ms | 5 |
| web | `manifest:stage` | 15 | 61.3ms | 59.5ms | -2.9% | 59.5ms | 7.7ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.0ms | - | 2.0ms | 0.3ms | 10 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2048.7ms | 1997.4ms | -2.5% | 1997.4ms | 9.0ms | 10 |
| node | `route:module` | 5130 | 910.1ms | 962.6ms | +5.8% | 962.6ms | 12.5ms | 10 |
| web | `route:client-entry` | 5130 | 623.2ms | 603.2ms | -3.2% | 603.2ms | 8.0ms | 10 |
| node | `manifest:transform` | 5 | 205.0ms | 195.3ms | -4.7% | 195.3ms | 41.8ms | 5 |
| node | `module:client-only-stub` | 5 | 84.7ms | 377.7ms | +345.9% | 377.7ms | 294.4ms | 5 |
| web | `manifest:stage` | 15 | 52.2ms | 59.3ms | +13.6% | 59.3ms | 7.6ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.0ms | - | 2.0ms | 0.3ms | 10 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1360.0ms | 1366.5ms | +0.5% | 1366.5ms | 22.5ms | 21 |
| node | `route:module` | 2580 | 577.7ms | 642.0ms | +11.1% | 642.0ms | 7.2ms | 20 |
| web | `route:client-entry` | 2581 | 387.6ms | 367.7ms | -5.1% | 367.7ms | 6.4ms | 21 |
| node | `manifest:transform` | 10 | 148.2ms | 162.2ms | +9.4% | 162.2ms | 20.1ms | 10 |
| node | `module:client-only-stub` | 10 | 122.5ms | 60.8ms | -50.4% | 60.8ms | 26.1ms | 10 |
| web | `manifest:stage` | 32 | 19.9ms | 27.7ms | +39.2% | 27.7ms | 1.4ms | 32 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 22 | - | 5.3ms | - | 5.3ms | 0.4ms | 22 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1309.6ms | 1358.6ms | +3.7% | 1358.6ms | 11.7ms | 22 |
| node | `route:module` | 2580 | 567.0ms | 585.0ms | +3.2% | 585.0ms | 5.6ms | 20 |
| web | `route:client-entry` | 2582 | 381.8ms | 361.2ms | -5.4% | 361.2ms | 5.5ms | 22 |
| node | `module:client-only-stub` | 10 | 209.9ms | 91.1ms | -56.6% | 91.1ms | 21.9ms | 10 |
| node | `manifest:transform` | 10 | 165.0ms | 169.7ms | +2.8% | 169.7ms | 23.4ms | 10 |
| web | `manifest:stage` | 32 | 20.9ms | 27.1ms | +29.7% | 27.1ms | 1.3ms | 32 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 22 | - | 4.3ms | - | 4.3ms | 0.3ms | 22 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1301.6ms | 1322.3ms | +1.6% | 1322.3ms | 20.4ms | 22 |
| node | `route:module` | 2580 | 536.0ms | 585.5ms | +9.2% | 585.5ms | 7.9ms | 20 |
| web | `route:client-entry` | 2582 | 376.6ms | 372.2ms | -1.2% | 372.2ms | 5.7ms | 22 |
| node | `module:client-only-stub` | 10 | 203.2ms | 105.1ms | -48.3% | 105.1ms | 35.3ms | 10 |
| node | `manifest:transform` | 10 | 159.4ms | 150.7ms | -5.5% | 150.7ms | 19.9ms | 10 |
| web | `manifest:stage` | 32 | 22.4ms | 30.1ms | +34.4% | 30.1ms | 4.2ms | 32 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 22 | - | 4.2ms | - | 4.2ms | 0.3ms | 22 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 512.4ms | 444.7ms | -13.2% | 444.7ms | 10.6ms | 20 |
| node | `route:module` | 500 | 175.5ms | 140.2ms | -20.1% | 140.2ms | 1.8ms | 20 |
| web | `route:client-entry` | 500 | 102.2ms | 89.3ms | -12.6% | 89.3ms | 2.1ms | 20 |
| node | `module:client-only-stub` | 10 | 69.3ms | 66.7ms | -3.8% | 66.7ms | 11.1ms | 10 |
| node | `manifest:transform` | 10 | 52.5ms | 50.8ms | -3.2% | 50.8ms | 6.5ms | 10 |
| web | `manifest:stage` | 30 | 5.2ms | 7.7ms | +48.1% | 7.7ms | 0.4ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 4.2ms | - | 4.2ms | 0.4ms | 20 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 112.74s | 113.18s | +0.4% | 113.18s | - | 1.00x | - |
| complex app | 2 | 78.16s | 79.69s | +2.0% | 79.69s | - | 0.98x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 95.50s | 99.65s | +4.3% | 86.76s | 87.25s | 2.87s | 2.95s | 3.34s | 3.29s | -1.6% | 99.65s | - | 0.96x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28822367630)

