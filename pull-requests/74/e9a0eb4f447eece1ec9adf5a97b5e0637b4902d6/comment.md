<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `e9a0eb4` against base `9018ef6`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 30.46s | 41.49s | +36.2% | 20.22s | 24.44s | +20.9% | 4.17s | 3.98s | -4.6% | 3.49s | 2.93s | -16.0% | 0.73x |
| Large app | 1 | 14.31s | 20.68s | +44.5% | 8.66s | 11.09s | +28.0% | 2.10s | 2.03s | -3.3% | 1.90s | 1.90s | -0.2% | 0.69x |
| Standard fixtures | 6 | 16.14s | 20.82s | +29.0% | 11.55s | 13.35s | +15.6% | 2.07s | 1.95s | -5.9% | 1.59s | 1.04s | -34.8% | 0.78x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.89s | 10.49s | +17.9% | 10.44s | 10.53s | 0.85x | 1616 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.21s | 4.44s | +5.3% | 4.44s | 4.59s | 0.95x | 648 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.68s | 6.42s | +13.0% | 6.45s | 6.61s | 0.89x | 879 MB |
| `synthetic-256-sourcemaps` | 10 | 2.24s | 2.30s | +2.5% | 2.30s | 2.45s | 0.98x | 467 MB |
| `synthetic-256-ssr-esm` | 10 | 2.09s | 2.16s | +3.4% | 2.16s | 2.32s | 0.97x | 451 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.48s | 2.69s | +8.5% | 2.70s | 2.92s | 0.92x | 498 MB |
| `synthetic-48-ssr-esm` | 10 | 1.36s | 1.39s | +2.3% | 1.41s | 1.66s | 0.98x | 320 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.31s | 20.68s | +44.5% | 8.66s | 11.09s | 2.10s | 2.03s | 1.90s | 1.90s | -0.2% | 20.73s | 21.21s | 0.69x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.76s | 6.27s | +31.7% | 3.36s | 3.96s | 0.60s | 0.55s | 0.50s | 0.33s | -35.1% | 6.26s | 6.31s | 0.76x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.81s | 6.36s | +32.1% | 3.40s | 4.03s | 0.59s | 0.56s | 0.56s | 0.33s | -40.9% | 6.35s | 6.46s | 0.76x | - |
| `synthetic-256-sourcemaps` | 10 | 2.08s | 2.75s | +32.1% | 1.55s | 1.77s | 0.27s | 0.25s | 0.15s | 0.13s | -16.6% | 2.75s | 2.86s | 0.76x | - |
| `synthetic-256-ssr-esm` | 10 | 1.76s | 2.21s | +25.3% | 1.27s | 1.46s | 0.24s | 0.23s | 0.15s | 0.10s | -33.1% | 2.20s | 2.24s | 0.80x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.80s | 2.22s | +23.0% | 1.30s | 1.47s | 0.25s | 0.24s | 0.15s | 0.10s | -32.9% | 2.20s | 2.24s | 0.81x | - |
| `synthetic-48-ssr-esm` | 10 | 0.92s | 1.02s | +10.0% | 0.67s | 0.66s | 0.13s | 0.13s | 0.08s | 0.05s | -32.5% | 1.01s | 1.04s | 0.91x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1810.3ms | 1607.1ms | -11.2% | 1607.1ms | 13.3ms | 10 |
| node | `route:module` | 1785 | 949.3ms | 765.3ms | -19.4% | 765.3ms | 6.2ms | 10 |
| web | `route:client-entry` | 1785 | 410.5ms | 490.1ms | +19.4% | 490.1ms | 10.4ms | 10 |
| node | `manifest:transform` | 5 | 118.3ms | 115.0ms | -2.8% | 115.0ms | 28.6ms | 5 |
| web | `manifest:stage` | 15 | 18.6ms | 20.9ms | +12.4% | 20.9ms | 2.1ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 142.1ms | - | 142.1ms | 17.2ms | 10 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2119.2ms | 1820.1ms | -14.1% | 1820.1ms | 6.7ms | 10 |
| node | `route:module` | 5130 | 971.4ms | 964.5ms | -0.7% | 964.5ms | 18.2ms | 10 |
| web | `route:client-entry` | 5130 | 620.8ms | 636.6ms | +2.5% | 636.6ms | 7.7ms | 10 |
| node | `manifest:transform` | 5 | 225.0ms | 206.5ms | -8.2% | 206.5ms | 45.9ms | 5 |
| node | `module:client-only-stub` | 5 | 60.3ms | 153.2ms | +154.1% | 153.2ms | 63.5ms | 5 |
| web | `manifest:stage` | 15 | 60.0ms | 57.8ms | -3.7% | 57.8ms | 6.5ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.1ms | - | 2.1ms | 0.4ms | 10 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2124.8ms | 1812.1ms | -14.7% | 1812.1ms | 8.3ms | 10 |
| node | `route:module` | 5130 | 973.0ms | 950.7ms | -2.3% | 950.7ms | 14.9ms | 10 |
| web | `route:client-entry` | 5130 | 638.2ms | 627.5ms | -1.7% | 627.5ms | 7.8ms | 10 |
| node | `manifest:transform` | 5 | 219.5ms | 199.1ms | -9.3% | 199.1ms | 44.7ms | 5 |
| node | `module:client-only-stub` | 5 | 124.7ms | 188.9ms | +51.5% | 188.9ms | 74.2ms | 5 |
| web | `manifest:stage` | 15 | 67.6ms | 58.4ms | -13.6% | 58.4ms | 6.5ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.2ms | - | 2.2ms | 0.4ms | 10 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1450.3ms | 1388.8ms | -4.2% | 1388.8ms | 17.5ms | 21 |
| node | `route:module` | 2580 | 609.4ms | 631.8ms | +3.7% | 631.8ms | 7.7ms | 20 |
| web | `route:client-entry` | 2581 | 410.2ms | 413.3ms | +0.8% | 413.3ms | 5.8ms | 21 |
| node | `module:client-only-stub` | 10 | 193.8ms | 28.4ms | -85.3% | 28.4ms | 5.3ms | 10 |
| node | `manifest:transform` | 10 | 171.7ms | 143.4ms | -16.5% | 143.4ms | 20.3ms | 10 |
| web | `manifest:stage` | 32 | 24.3ms | 28.5ms | +17.3% | 28.5ms | 2.0ms | 32 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 22 | - | 6.4ms | - | 6.4ms | 0.4ms | 22 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1351.2ms | 1229.7ms | -9.0% | 1229.7ms | 14.4ms | 22 |
| node | `route:module` | 2580 | 539.8ms | 614.5ms | +13.8% | 614.5ms | 7.3ms | 20 |
| web | `route:client-entry` | 2582 | 395.6ms | 424.9ms | +7.4% | 424.9ms | 5.9ms | 22 |
| node | `manifest:transform` | 10 | 166.0ms | 176.7ms | +6.4% | 176.7ms | 23.4ms | 10 |
| node | `module:client-only-stub` | 10 | 96.2ms | 22.8ms | -76.3% | 22.8ms | 3.2ms | 10 |
| web | `manifest:stage` | 32 | 20.2ms | 31.9ms | +57.9% | 31.9ms | 3.9ms | 32 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 22 | - | 4.6ms | - | 4.6ms | 0.4ms | 22 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1414.3ms | 1257.2ms | -11.1% | 1257.2ms | 10.7ms | 20 |
| node | `route:module` | 2580 | 564.9ms | 608.7ms | +7.8% | 608.7ms | 9.2ms | 20 |
| web | `route:client-entry` | 2580 | 401.9ms | 406.1ms | +1.0% | 406.1ms | 5.8ms | 20 |
| node | `manifest:transform` | 10 | 162.1ms | 157.0ms | -3.1% | 157.0ms | 23.7ms | 10 |
| node | `module:client-only-stub` | 10 | 88.4ms | 30.8ms | -65.2% | 30.8ms | 9.0ms | 10 |
| web | `manifest:stage` | 30 | 21.4ms | 26.2ms | +22.4% | 26.2ms | 1.4ms | 30 |
| web | `manifest:transform` | 10 | 1.1ms | 1.0ms | -9.1% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 4.4ms | - | 4.4ms | 0.4ms | 20 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 502.3ms | 374.9ms | -25.4% | 374.9ms | 9.0ms | 20 |
| node | `route:module` | 500 | 165.2ms | 134.2ms | -18.8% | 134.2ms | 0.7ms | 20 |
| web | `route:client-entry` | 500 | 108.5ms | 89.0ms | -18.0% | 89.0ms | 2.0ms | 20 |
| node | `module:client-only-stub` | 10 | 83.4ms | 74.1ms | -11.2% | 74.1ms | 10.3ms | 10 |
| node | `manifest:transform` | 10 | 63.9ms | 47.3ms | -26.0% | 47.3ms | 7.1ms | 10 |
| web | `manifest:stage` | 30 | 5.3ms | 7.4ms | +39.6% | 7.4ms | 0.4ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 4.6ms | - | 4.6ms | 0.4ms | 20 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 123.07s | 133.25s | +8.3% | 133.25s | - | 0.92x | - |
| complex app | 2 | 80.49s | 95.99s | +19.3% | 95.99s | - | 0.84x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 98.57s | 106.66s | +8.2% | 89.60s | 94.05s | 3.04s | 3.00s | 3.37s | 3.41s | +1.2% | 106.66s | - | 0.92x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29033326358)

