<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `4efaa78` against base `fde856e`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.82s | 29.79s | -0.1% | 20.00s | 20.25s | +1.3% | 4.05s | 4.04s | -0.2% | 3.34s | 2.92s | -12.7% | 1.00x |
| Large app | 1 | 14.10s | 13.98s | -0.8% | 8.63s | 8.54s | -1.0% | 2.03s | 2.03s | -0.0% | 1.82s | 1.78s | -2.6% | 1.01x |
| Standard fixtures | 6 | 15.72s | 15.80s | +0.5% | 11.38s | 11.72s | +3.0% | 2.01s | 2.00s | -0.3% | 1.52s | 1.14s | -24.9% | 1.00x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.71s | 8.52s | -2.2% | 8.60s | 8.92s | 1.02x | 1524 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.36s | 4.06s | -7.0% | 4.13s | 4.36s | 1.08x | 646 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.90s | 5.58s | -5.3% | 5.58s | 5.69s | 1.06x | 826 MB |
| `synthetic-256-sourcemaps` | 10 | 2.18s | 2.15s | -1.8% | 2.16s | 2.34s | 1.02x | 465 MB |
| `synthetic-256-ssr-esm` | 10 | 2.13s | 2.02s | -5.5% | 2.03s | 2.23s | 1.06x | 425 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.60s | 2.42s | -7.0% | 2.43s | 2.57s | 1.08x | 456 MB |
| `synthetic-48-ssr-esm` | 10 | 1.45s | 1.36s | -6.1% | 1.38s | 1.62s | 1.06x | 315 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.10s | 13.98s | -0.8% | 8.63s | 8.54s | 2.03s | 2.03s | 1.82s | 1.78s | -2.6% | 13.99s | 14.19s | 1.01x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.57s | 4.65s | +1.7% | 3.27s | 3.44s | 0.58s | 0.56s | 0.50s | 0.38s | -24.7% | 4.67s | 4.84s | 0.98x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.73s | 4.57s | -3.4% | 3.43s | 3.39s | 0.59s | 0.56s | 0.51s | 0.38s | -25.5% | 4.55s | 4.63s | 1.04x | - |
| `synthetic-256-sourcemaps` | 10 | 2.01s | 2.06s | +2.4% | 1.50s | 1.58s | 0.26s | 0.25s | 0.15s | 0.13s | -16.8% | 2.05s | 2.08s | 0.98x | - |
| `synthetic-256-ssr-esm` | 10 | 1.73s | 1.82s | +4.7% | 1.25s | 1.33s | 0.23s | 0.25s | 0.15s | 0.10s | -32.8% | 1.81s | 1.87s | 0.96x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.77s | 1.78s | +0.5% | 1.28s | 1.32s | 0.23s | 0.24s | 0.15s | 0.10s | -32.5% | 1.77s | 1.80s | 0.99x | - |
| `synthetic-48-ssr-esm` | 10 | 0.91s | 0.93s | +2.2% | 0.66s | 0.66s | 0.12s | 0.14s | 0.05s | 0.05s | +0.9% | 0.92s | 0.94s | 0.98x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1745.0ms | 1569.5ms | -10.1% | 1569.5ms | 20.9ms | 10 |
| node | `route:module` | 1785 | 943.0ms | 817.2ms | -13.3% | 817.2ms | 5.8ms | 10 |
| web | `route:client-entry` | 1785 | 380.1ms | 431.2ms | +13.4% | 431.2ms | 8.7ms | 10 |
| node | `manifest:transform` | 5 | 108.9ms | 116.9ms | +7.3% | 116.9ms | 38.3ms | 5 |
| web | `manifest:stage` | 10 | 14.7ms | 14.6ms | -0.7% | 14.6ms | 2.0ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2078.1ms | 1821.4ms | -12.4% | 1821.4ms | 31.5ms | 10 |
| node | `route:module` | 5130 | 962.4ms | 814.0ms | -15.4% | 814.0ms | 6.9ms | 10 |
| web | `route:client-entry` | 5130 | 627.7ms | 544.6ms | -13.2% | 544.6ms | 7.9ms | 10 |
| node | `module:client-only-stub` | 5 | 355.9ms | 64.9ms | -81.8% | 64.9ms | 21.0ms | 5 |
| node | `manifest:transform` | 5 | 205.3ms | 218.5ms | +6.4% | 218.5ms | 57.3ms | 5 |
| web | `manifest:stage` | 10 | 48.8ms | 48.1ms | -1.4% | 48.1ms | 8.1ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2095.9ms | 1784.5ms | -14.9% | 1784.5ms | 17.7ms | 10 |
| node | `route:module` | 5130 | 961.9ms | 874.1ms | -9.1% | 874.1ms | 10.0ms | 10 |
| web | `route:client-entry` | 5130 | 621.7ms | 562.5ms | -9.5% | 562.5ms | 7.0ms | 10 |
| node | `manifest:transform` | 5 | 204.5ms | 247.8ms | +21.2% | 247.8ms | 77.5ms | 5 |
| node | `module:client-only-stub` | 5 | 69.4ms | 1354.4ms | +1851.6% | 1354.4ms | 617.0ms | 5 |
| web | `manifest:stage` | 10 | 57.0ms | 46.5ms | -18.4% | 46.5ms | 6.7ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1365.7ms | 1377.0ms | +0.8% | 1377.0ms | 22.5ms | 20 |
| node | `route:module` | 2580 | 594.9ms | 588.8ms | -1.0% | 588.8ms | 7.0ms | 20 |
| web | `route:client-entry` | 2580 | 400.6ms | 361.2ms | -9.8% | 361.2ms | 5.6ms | 20 |
| node | `module:client-only-stub` | 10 | 187.3ms | 215.9ms | +15.3% | 215.9ms | 67.0ms | 10 |
| node | `manifest:transform` | 10 | 142.7ms | 153.6ms | +7.6% | 153.6ms | 24.1ms | 10 |
| web | `manifest:stage` | 20 | 21.5ms | 21.0ms | -2.3% | 21.0ms | 1.5ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2584 | 1355.4ms | 1291.3ms | -4.7% | 1291.3ms | 19.7ms | 24 |
| node | `route:module` | 2580 | 538.3ms | 516.4ms | -4.1% | 516.4ms | 5.8ms | 20 |
| web | `route:client-entry` | 2584 | 388.4ms | 374.2ms | -3.7% | 374.2ms | 8.0ms | 24 |
| node | `manifest:transform` | 10 | 167.8ms | 180.6ms | +7.6% | 180.6ms | 23.3ms | 10 |
| node | `module:client-only-stub` | 10 | 165.9ms | 290.4ms | +75.0% | 290.4ms | 84.1ms | 10 |
| web | `manifest:stage` | 24 | 20.5ms | 24.7ms | +20.5% | 24.7ms | 1.5ms | 24 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1330.7ms | 1223.9ms | -8.0% | 1223.9ms | 16.5ms | 20 |
| node | `route:module` | 2580 | 559.5ms | 549.4ms | -1.8% | 549.4ms | 9.5ms | 20 |
| web | `route:client-entry` | 2580 | 379.2ms | 349.1ms | -7.9% | 349.1ms | 6.6ms | 20 |
| node | `manifest:transform` | 10 | 155.2ms | 174.5ms | +12.4% | 174.5ms | 25.3ms | 10 |
| node | `module:client-only-stub` | 10 | 106.4ms | 239.1ms | +124.7% | 239.1ms | 75.6ms | 10 |
| web | `manifest:stage` | 20 | 20.6ms | 21.0ms | +1.9% | 21.0ms | 1.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 501 | 471.9ms | 463.8ms | -1.7% | 463.8ms | 15.2ms | 21 |
| node | `route:module` | 500 | 163.5ms | 132.0ms | -19.3% | 132.0ms | 3.7ms | 20 |
| node | `module:client-only-stub` | 10 | 109.1ms | 98.1ms | -10.1% | 98.1ms | 28.4ms | 10 |
| web | `route:client-entry` | 501 | 105.9ms | 80.9ms | -23.6% | 80.9ms | 2.4ms | 21 |
| node | `manifest:transform` | 10 | 55.4ms | 50.9ms | -8.1% | 50.9ms | 8.3ms | 10 |
| web | `manifest:stage` | 21 | 5.1ms | 6.6ms | +29.4% | 6.6ms | 0.6ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 116.58s | 111.19s | -4.6% | 111.19s | - | 1.05x | - |
| complex app | 2 | 78.20s | 79.18s | +1.3% | 79.18s | - | 0.99x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 94.02s | 98.34s | +4.6% | 85.49s | 89.37s | 2.82s | 2.99s | 3.23s | 3.42s | +5.7% | 98.34s | - | 0.96x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28630786946)

