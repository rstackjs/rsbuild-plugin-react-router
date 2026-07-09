<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `c6d6f21` against base `9018ef6`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 31.73s | 39.88s | +25.7% | 21.13s | 21.34s | +1.0% | 4.36s | 3.59s | -17.7% | 3.62s | 3.11s | -14.1% | 0.80x |
| Large app | 1 | 14.88s | 18.00s | +20.9% | 9.01s | 9.43s | +4.7% | 2.21s | 1.79s | -19.0% | 2.00s | 1.68s | -16.4% | 0.83x |
| Standard fixtures | 6 | 16.85s | 21.88s | +29.9% | 12.12s | 11.91s | -1.7% | 2.16s | 1.81s | -16.3% | 1.62s | 1.44s | -11.2% | 0.77x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 9.17s | 9.31s | +1.5% | 9.35s | 9.55s | 0.99x | 1603 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.27s | 3.93s | -8.0% | 3.96s | 4.16s | 1.09x | 656 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.85s | 5.68s | -2.8% | 5.74s | 6.02s | 1.03x | 871 MB |
| `synthetic-256-sourcemaps` | 10 | 2.33s | 2.13s | -8.6% | 2.14s | 2.30s | 1.09x | 468 MB |
| `synthetic-256-ssr-esm` | 10 | 2.13s | 2.01s | -5.8% | 2.01s | 2.19s | 1.06x | 429 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.54s | 2.50s | -1.8% | 2.51s | 2.68s | 1.02x | 487 MB |
| `synthetic-48-ssr-esm` | 10 | 1.41s | 1.34s | -5.0% | 1.36s | 1.59s | 1.05x | 340 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.88s | 18.00s | +20.9% | 9.01s | 9.43s | 2.21s | 1.79s | 2.00s | 1.68s | -16.4% | 17.99s | 18.11s | 0.83x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.91s | 6.90s | +40.5% | 3.51s | 3.51s | 0.59s | 0.51s | 0.56s | 0.50s | -9.6% | 6.89s | 6.95s | 0.71x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 5.00s | 6.90s | +37.8% | 3.58s | 3.56s | 0.64s | 0.52s | 0.53s | 0.50s | -4.7% | 6.87s | 6.93s | 0.73x | - |
| `synthetic-256-sourcemaps` | 10 | 2.17s | 2.75s | +27.0% | 1.60s | 1.58s | 0.27s | 0.22s | 0.15s | 0.13s | -16.6% | 2.73s | 2.85s | 0.79x | - |
| `synthetic-256-ssr-esm` | 10 | 1.89s | 2.18s | +15.8% | 1.36s | 1.31s | 0.26s | 0.22s | 0.15s | 0.13s | -17.8% | 2.18s | 2.21s | 0.86x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.89s | 2.17s | +14.6% | 1.36s | 1.32s | 0.26s | 0.22s | 0.15s | 0.13s | -16.9% | 2.17s | 2.20s | 0.87x | - |
| `synthetic-48-ssr-esm` | 10 | 0.99s | 0.99s | -0.3% | 0.70s | 0.63s | 0.14s | 0.13s | 0.08s | 0.05s | -33.0% | 0.98s | 1.01s | 1.00x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1852.9ms | 1571.2ms | -15.2% | 1571.2ms | 14.0ms | 10 |
| node | `route:module` | 1785 | 925.0ms | 767.0ms | -17.1% | 767.0ms | 15.0ms | 10 |
| web | `route:client-entry` | 1785 | 407.5ms | 447.7ms | +9.9% | 447.7ms | 10.0ms | 10 |
| node | `manifest:transform` | 5 | 98.4ms | 108.9ms | +10.7% | 108.9ms | 28.1ms | 5 |
| web | `manifest:stage` | 15 | 15.3ms | 19.9ms | +30.1% | 19.9ms | 2.0ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 132.4ms | - | 132.4ms | 14.0ms | 10 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2201.9ms | 1735.7ms | -21.2% | 1735.7ms | 8.7ms | 10 |
| node | `route:module` | 5130 | 962.8ms | 907.1ms | -5.8% | 907.1ms | 12.5ms | 10 |
| web | `route:client-entry` | 5130 | 650.3ms | 554.7ms | -14.7% | 554.7ms | 6.8ms | 10 |
| node | `manifest:transform` | 5 | 228.1ms | 193.4ms | -15.2% | 193.4ms | 42.1ms | 5 |
| node | `module:client-only-stub` | 5 | 74.3ms | 132.8ms | +78.7% | 132.8ms | 49.6ms | 5 |
| web | `manifest:stage` | 15 | 70.4ms | 59.7ms | -15.2% | 59.7ms | 7.0ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.1ms | - | 2.1ms | 0.4ms | 10 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2130.9ms | 1841.4ms | -13.6% | 1841.4ms | 10.4ms | 10 |
| node | `route:module` | 5130 | 962.2ms | 889.9ms | -7.5% | 889.9ms | 6.8ms | 10 |
| web | `route:client-entry` | 5130 | 641.5ms | 598.4ms | -6.7% | 598.4ms | 8.6ms | 10 |
| node | `manifest:transform` | 5 | 223.2ms | 184.4ms | -17.4% | 184.4ms | 39.2ms | 5 |
| node | `module:client-only-stub` | 5 | 64.6ms | 120.8ms | +87.0% | 120.8ms | 51.3ms | 5 |
| web | `manifest:stage` | 15 | 53.3ms | 60.6ms | +13.7% | 60.6ms | 7.1ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.1ms | - | 2.1ms | 0.4ms | 10 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1482.8ms | 1314.7ms | -11.3% | 1314.7ms | 17.6ms | 22 |
| node | `route:module` | 2580 | 609.1ms | 585.2ms | -3.9% | 585.2ms | 5.2ms | 20 |
| web | `route:client-entry` | 2582 | 426.9ms | 405.0ms | -5.1% | 405.0ms | 5.6ms | 22 |
| node | `manifest:transform` | 10 | 165.1ms | 160.1ms | -3.0% | 160.1ms | 27.1ms | 10 |
| node | `module:client-only-stub` | 10 | 65.4ms | 31.3ms | -52.1% | 31.3ms | 8.5ms | 10 |
| web | `manifest:stage` | 32 | 26.9ms | 26.5ms | -1.5% | 26.5ms | 1.4ms | 32 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 22 | - | 5.5ms | - | 5.5ms | 0.4ms | 22 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1413.0ms | 1222.5ms | -13.5% | 1222.5ms | 13.6ms | 20 |
| node | `route:module` | 2580 | 589.9ms | 575.1ms | -2.5% | 575.1ms | 6.1ms | 20 |
| web | `route:client-entry` | 2580 | 416.4ms | 368.9ms | -11.4% | 368.9ms | 5.7ms | 20 |
| node | `manifest:transform` | 10 | 164.9ms | 146.7ms | -11.0% | 146.7ms | 18.3ms | 10 |
| node | `module:client-only-stub` | 10 | 131.8ms | 21.6ms | -83.6% | 21.6ms | 2.6ms | 10 |
| web | `manifest:stage` | 31 | 23.7ms | 26.4ms | +11.4% | 26.4ms | 1.4ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 4.5ms | - | 4.5ms | 0.4ms | 21 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1443.8ms | 1191.3ms | -17.5% | 1191.3ms | 10.0ms | 21 |
| node | `route:module` | 2580 | 608.8ms | 559.5ms | -8.1% | 559.5ms | 7.7ms | 20 |
| node | `module:client-only-stub` | 10 | 426.3ms | 35.7ms | -91.6% | 35.7ms | 14.9ms | 10 |
| web | `route:client-entry` | 2581 | 409.7ms | 373.4ms | -8.9% | 373.4ms | 5.5ms | 21 |
| node | `manifest:transform` | 10 | 182.4ms | 176.0ms | -3.5% | 176.0ms | 20.9ms | 10 |
| web | `manifest:stage` | 31 | 22.5ms | 26.7ms | +18.7% | 26.7ms | 1.5ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 4.2ms | - | 4.2ms | 0.3ms | 21 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 520.5ms | 340.3ms | -34.6% | 340.3ms | 8.6ms | 20 |
| node | `route:module` | 500 | 176.4ms | 132.0ms | -25.2% | 132.0ms | 0.6ms | 20 |
| web | `route:client-entry` | 500 | 114.0ms | 87.4ms | -23.3% | 87.4ms | 2.1ms | 20 |
| node | `module:client-only-stub` | 10 | 102.9ms | 77.5ms | -24.7% | 77.5ms | 12.7ms | 10 |
| node | `manifest:transform` | 10 | 54.6ms | 42.3ms | -22.5% | 42.3ms | 5.6ms | 10 |
| web | `manifest:stage` | 30 | 5.9ms | 8.2ms | +39.0% | 8.2ms | 0.4ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 4.6ms | - | 4.6ms | 0.5ms | 20 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 121.57s | 118.66s | -2.4% | 118.66s | - | 1.02x | - |
| complex app | 2 | 85.52s | 85.83s | +0.4% | 85.83s | - | 1.00x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 105.15s | 98.98s | -5.9% | 95.75s | 87.16s | 3.02s | 2.77s | 3.69s | 3.18s | -13.7% | 98.98s | - | 1.06x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28994304134)

