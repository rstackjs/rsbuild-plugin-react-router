<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `4b81cb9` against base `fde856e`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 30.59s | 30.07s | -1.7% | 20.36s | 19.99s | -1.8% | 4.17s | 4.19s | +0.5% | 3.46s | 3.36s | -2.9% | 1.02x |
| Large app | 1 | 14.22s | 14.17s | -0.3% | 8.61s | 8.61s | +0.0% | 2.08s | 2.07s | -0.2% | 1.85s | 1.90s | +2.8% | 1.00x |
| Standard fixtures | 6 | 16.37s | 15.90s | -2.9% | 11.75s | 11.39s | -3.1% | 2.09s | 2.12s | +1.2% | 1.62s | 1.46s | -9.4% | 1.03x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 9.15s | 9.33s | +1.9% | 9.30s | 9.55s | 0.98x | 1498 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.35s | 4.37s | +0.4% | 4.44s | 4.59s | 1.00x | 622 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.74s | 5.91s | +2.9% | 5.96s | 6.12s | 0.97x | 812 MB |
| `synthetic-256-sourcemaps` | 10 | 2.24s | 2.27s | +1.5% | 2.29s | 2.49s | 0.98x | 433 MB |
| `synthetic-256-ssr-esm` | 10 | 2.08s | 2.09s | +0.3% | 2.11s | 2.30s | 1.00x | 404 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.51s | 2.57s | +2.4% | 2.58s | 2.76s | 0.98x | 435 MB |
| `synthetic-48-ssr-esm` | 10 | 1.40s | 1.40s | -0.4% | 1.42s | 1.63s | 1.00x | 312 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.22s | 14.17s | -0.3% | 8.61s | 8.61s | 2.08s | 2.07s | 1.85s | 1.90s | +2.8% | 14.45s | 15.56s | 1.00x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.83s | 4.72s | -2.3% | 3.45s | 3.36s | 0.59s | 0.60s | 0.55s | 0.50s | -9.1% | 4.76s | 5.03s | 1.02x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.78s | 4.73s | -0.9% | 3.40s | 3.38s | 0.59s | 0.62s | 0.53s | 0.50s | -5.3% | 4.80s | 5.06s | 1.01x | - |
| `synthetic-256-sourcemaps` | 10 | 2.10s | 2.01s | -4.2% | 1.55s | 1.49s | 0.27s | 0.24s | 0.15s | 0.15s | -0.1% | 2.00s | 2.07s | 1.04x | - |
| `synthetic-256-ssr-esm` | 10 | 1.87s | 1.76s | -5.8% | 1.34s | 1.26s | 0.26s | 0.26s | 0.15s | 0.13s | -16.2% | 1.78s | 1.97s | 1.06x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.85s | 1.78s | -3.7% | 1.33s | 1.28s | 0.26s | 0.26s | 0.15s | 0.13s | -15.7% | 1.78s | 1.84s | 1.04x | - |
| `synthetic-48-ssr-esm` | 10 | 0.95s | 0.90s | -5.2% | 0.68s | 0.63s | 0.13s | 0.13s | 0.08s | 0.05s | -32.5% | 0.90s | 0.92s | 1.05x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1744.1ms | 1780.3ms | +2.1% | 1780.3ms | 21.3ms | 10 |
| node | `route:module` | 1785 | 975.0ms | 909.5ms | -6.7% | 909.5ms | 6.1ms | 10 |
| web | `route:client-entry` | 1785 | 398.2ms | 380.6ms | -4.4% | 380.6ms | 6.3ms | 10 |
| node | `manifest:transform` | 5 | 138.8ms | 181.9ms | +31.1% | 181.9ms | 62.6ms | 5 |
| web | `manifest:stage` | 10 | 14.7ms | 14.8ms | +0.7% | 14.8ms | 2.1ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2162.5ms | 2083.5ms | -3.7% | 2083.5ms | 13.3ms | 10 |
| node | `route:module` | 5130 | 980.0ms | 945.5ms | -3.5% | 945.5ms | 9.2ms | 10 |
| web | `route:client-entry` | 5130 | 646.1ms | 648.8ms | +0.4% | 648.8ms | 6.3ms | 10 |
| node | `manifest:transform` | 5 | 223.1ms | 198.7ms | -10.9% | 198.7ms | 43.1ms | 5 |
| node | `module:client-only-stub` | 5 | 138.7ms | 93.9ms | -32.3% | 93.9ms | 55.1ms | 5 |
| web | `manifest:stage` | 10 | 66.7ms | 55.8ms | -16.3% | 55.8ms | 7.1ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2051.6ms | 2133.6ms | +4.0% | 2133.6ms | 20.1ms | 10 |
| node | `route:module` | 5130 | 972.4ms | 959.5ms | -1.3% | 959.5ms | 9.2ms | 10 |
| web | `route:client-entry` | 5130 | 633.5ms | 639.5ms | +0.9% | 639.5ms | 6.4ms | 10 |
| node | `manifest:transform` | 5 | 209.3ms | 208.5ms | -0.4% | 208.5ms | 48.2ms | 5 |
| node | `module:client-only-stub` | 5 | 83.5ms | 611.8ms | +632.7% | 611.8ms | 516.4ms | 5 |
| web | `manifest:stage` | 10 | 61.7ms | 51.6ms | -16.4% | 51.6ms | 8.5ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1424.9ms | 1391.0ms | -2.4% | 1391.0ms | 14.1ms | 21 |
| node | `route:module` | 2580 | 612.3ms | 630.1ms | +2.9% | 630.1ms | 5.0ms | 20 |
| web | `route:client-entry` | 2581 | 409.7ms | 419.9ms | +2.5% | 419.9ms | 6.2ms | 21 |
| node | `module:client-only-stub` | 10 | 246.1ms | 223.3ms | -9.3% | 223.3ms | 35.6ms | 10 |
| node | `manifest:transform` | 10 | 161.2ms | 158.3ms | -1.8% | 158.3ms | 23.8ms | 10 |
| web | `manifest:stage` | 21 | 23.1ms | 22.0ms | -4.8% | 22.0ms | 1.4ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1425.8ms | 1434.1ms | +0.6% | 1434.1ms | 16.6ms | 22 |
| node | `route:module` | 2580 | 584.2ms | 577.9ms | -1.1% | 577.9ms | 5.6ms | 20 |
| web | `route:client-entry` | 2582 | 384.5ms | 381.3ms | -0.8% | 381.3ms | 5.7ms | 22 |
| node | `manifest:transform` | 10 | 160.3ms | 155.3ms | -3.1% | 155.3ms | 24.9ms | 10 |
| node | `module:client-only-stub` | 10 | 136.6ms | 173.9ms | +27.3% | 173.9ms | 132.4ms | 10 |
| web | `manifest:stage` | 22 | 24.7ms | 22.7ms | -8.1% | 22.7ms | 1.4ms | 22 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1351.6ms | 1427.5ms | +5.6% | 1427.5ms | 15.7ms | 21 |
| node | `route:module` | 2580 | 575.8ms | 568.1ms | -1.3% | 568.1ms | 7.1ms | 20 |
| web | `route:client-entry` | 2581 | 382.7ms | 392.5ms | +2.6% | 392.5ms | 5.5ms | 21 |
| node | `manifest:transform` | 10 | 158.6ms | 172.6ms | +8.8% | 172.6ms | 22.8ms | 10 |
| node | `module:client-only-stub` | 10 | 117.3ms | 113.9ms | -2.9% | 113.9ms | 49.6ms | 10 |
| web | `manifest:stage` | 21 | 22.4ms | 22.2ms | -0.9% | 22.2ms | 1.4ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 465.8ms | 425.0ms | -8.8% | 425.0ms | 10.2ms | 20 |
| node | `route:module` | 500 | 173.8ms | 174.1ms | +0.2% | 174.1ms | 6.4ms | 20 |
| web | `route:client-entry` | 500 | 105.8ms | 112.1ms | +6.0% | 112.1ms | 3.5ms | 20 |
| node | `module:client-only-stub` | 10 | 83.9ms | 112.1ms | +33.6% | 112.1ms | 32.5ms | 10 |
| node | `manifest:transform` | 10 | 56.9ms | 56.4ms | -0.9% | 56.4ms | 13.0ms | 10 |
| web | `manifest:stage` | 20 | 5.8ms | 5.8ms | 0.0% | 5.8ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.1ms | 1.0ms | -9.1% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 125.27s | 130.56s | +4.2% | 130.56s | - | 0.96x | - |
| complex app | 2 | 89.98s | 94.84s | +5.4% | 94.84s | - | 0.95x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 103.17s | 106.68s | +3.4% | 94.03s | 97.31s | 2.98s | 3.06s | 3.52s | 3.64s | +3.3% | 106.68s | - | 0.97x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28681991739)

