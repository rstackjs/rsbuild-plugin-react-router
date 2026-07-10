<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `ef7814c` against base `96ed301`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 25.90s | 24.99s | -3.5% | 17.21s | 16.66s | -3.2% | 3.18s | 3.24s | +2.1% | 3.19s | 3.13s | -1.7% | 1.04x |
| Large app | 1 | 12.02s | 12.05s | +0.2% | 7.25s | 7.56s | +4.2% | 1.57s | 1.59s | +1.5% | 1.74s | 1.84s | +5.6% | 1.00x |
| Standard fixtures | 6 | 13.88s | 12.94s | -6.8% | 9.95s | 9.10s | -8.6% | 1.61s | 1.65s | +2.7% | 1.44s | 1.29s | -10.5% | 1.07x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 | Head client JS gzip | Client JS gzip delta | Head total gzip |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.06s | 7.92s | -1.7% | 8.00s | 8.41s | 1.02x | 1534 MB | 5.0 MB | +0.2% | 14.8 MB |
| `synthetic-1024-ssr-esm` | 5 | 3.26s | 3.15s | -3.4% | 3.20s | 3.48s | 1.03x | 642 MB | 626.1 kB | -4.1% | 1.4 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 4.30s | 4.39s | +2.1% | 4.44s | 4.58s | 0.98x | 846 MB | 927.8 kB | -2.5% | 1.7 MB |
| `synthetic-256-sourcemaps` | 10 | 1.73s | 1.72s | -0.4% | 1.72s | 1.87s | 1.00x | 461 MB | 228.7 kB | -2.9% | 1.4 MB |
| `synthetic-256-ssr-esm` | 10 | 1.59s | 1.59s | +0.1% | 1.59s | 1.67s | 1.00x | 420 MB | 228.7 kB | -2.9% | 918.8 kB |
| `synthetic-256-ssr-esm-split` | 10 | 1.89s | 1.90s | +0.6% | 1.91s | 2.05s | 0.99x | 476 MB | 305.6 kB | -1.9% | 998.3 kB |
| `synthetic-48-ssr-esm` | 10 | 1.04s | 1.07s | +2.8% | 1.08s | 1.27s | 0.97x | 314 MB | 121.9 kB | -1.1% | 763.9 kB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 12.02s | 12.05s | +0.2% | 7.25s | 7.56s | 1.57s | 1.59s | 1.74s | 1.84s | +5.6% | 12.13s | 12.30s | 1.00x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.27s | 3.62s | -15.2% | 3.02s | 2.55s | 0.47s | 0.47s | 0.45s | 0.40s | -11.1% | 3.68s | 3.99s | 1.18x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 3.96s | 3.96s | +0.0% | 2.92s | 2.83s | 0.47s | 0.48s | 0.40s | 0.43s | +6.0% | 4.01s | 4.34s | 1.00x | - |
| `synthetic-256-sourcemaps` | 10 | 1.81s | 1.83s | +1.1% | 1.33s | 1.27s | 0.20s | 0.20s | 0.20s | 0.18s | -13.3% | 1.78s | 1.93s | 0.99x | - |
| `synthetic-256-ssr-esm` | 10 | 1.59s | 1.39s | -12.8% | 1.15s | 0.98s | 0.19s | 0.20s | 0.15s | 0.10s | -31.6% | 1.41s | 1.56s | 1.15x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.49s | 1.45s | -2.9% | 1.01s | 0.98s | 0.19s | 0.20s | 0.18s | 0.13s | -27.7% | 1.44s | 1.54s | 1.03x | - |
| `synthetic-48-ssr-esm` | 10 | 0.76s | 0.69s | -8.7% | 0.52s | 0.48s | 0.10s | 0.10s | 0.05s | 0.05s | -3.5% | 0.71s | 0.90s | 1.10x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1328.3ms | 1424.5ms | +7.2% | 1424.5ms | 20.8ms | 10 |
| node | `route:module` | 1785 | 675.3ms | 664.0ms | -1.7% | 664.0ms | 9.1ms | 10 |
| web | `route:client-entry` | 1785 | 314.8ms | 294.6ms | -6.4% | 294.6ms | 5.4ms | 10 |
| node | `manifest:transform` | 5 | 97.5ms | 124.5ms | +27.7% | 124.5ms | 34.4ms | 5 |
| web | `manifest:stage` | 10 | 12.1ms | 12.3ms | +1.7% | 12.3ms | 1.7ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 1571.8ms | 1585.3ms | +0.9% | 1585.3ms | 15.5ms | 10 |
| node | `route:module` | 5130 | 762.1ms | 714.6ms | -6.2% | 714.6ms | 5.3ms | 10 |
| web | `route:client-entry` | 5130 | 509.6ms | 489.4ms | -4.0% | 489.4ms | 6.4ms | 10 |
| node | `manifest:transform` | 5 | 163.4ms | 161.4ms | -1.2% | 161.4ms | 39.0ms | 5 |
| node | `module:client-only-stub` | 5 | 60.8ms | 75.6ms | +24.3% | 75.6ms | 26.1ms | 5 |
| web | `manifest:stage` | 10 | 40.7ms | 41.5ms | +2.0% | 41.5ms | 7.0ms | 10 |
| web | `manifest:transform` | 5 | 0.4ms | 0.4ms | 0.0% | 0.4ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 1639.6ms | 1635.5ms | -0.3% | 1635.5ms | 14.8ms | 10 |
| node | `route:module` | 5130 | 752.6ms | 748.4ms | -0.6% | 748.4ms | 8.0ms | 10 |
| web | `route:client-entry` | 5130 | 484.0ms | 485.0ms | +0.2% | 485.0ms | 6.9ms | 10 |
| node | `manifest:transform` | 5 | 159.8ms | 169.2ms | +5.9% | 169.2ms | 39.9ms | 5 |
| node | `module:client-only-stub` | 5 | 83.8ms | 130.5ms | +55.7% | 130.5ms | 67.9ms | 5 |
| web | `manifest:stage` | 10 | 49.9ms | 44.6ms | -10.6% | 44.6ms | 6.8ms | 10 |
| web | `manifest:transform` | 5 | 0.4ms | 0.4ms | 0.0% | 0.4ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1089.2ms | 1126.4ms | +3.4% | 1126.4ms | 15.0ms | 20 |
| node | `route:module` | 2580 | 457.5ms | 513.3ms | +12.2% | 513.3ms | 4.8ms | 20 |
| web | `route:client-entry` | 2580 | 310.4ms | 326.4ms | +5.2% | 326.4ms | 4.8ms | 20 |
| node | `manifest:transform` | 10 | 105.3ms | 122.9ms | +16.7% | 122.9ms | 16.5ms | 10 |
| node | `module:client-only-stub` | 10 | 29.8ms | 89.5ms | +200.3% | 89.5ms | 38.2ms | 10 |
| web | `manifest:stage` | 20 | 17.0ms | 17.5ms | +2.9% | 17.5ms | 1.3ms | 20 |
| web | `manifest:transform` | 10 | 0.7ms | 0.8ms | +14.3% | 0.8ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1069.6ms | 1106.9ms | +3.5% | 1106.9ms | 13.9ms | 21 |
| node | `route:module` | 2580 | 433.9ms | 424.0ms | -2.3% | 424.0ms | 4.6ms | 20 |
| web | `route:client-entry` | 2581 | 304.1ms | 314.3ms | +3.4% | 314.3ms | 4.7ms | 21 |
| node | `manifest:transform` | 10 | 135.1ms | 120.7ms | -10.7% | 120.7ms | 16.4ms | 10 |
| node | `module:client-only-stub` | 10 | 67.9ms | 292.9ms | +331.4% | 292.9ms | 113.0ms | 10 |
| web | `manifest:stage` | 21 | 17.4ms | 17.8ms | +2.3% | 17.8ms | 1.2ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 0.7ms | -30.0% | 0.7ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1055.6ms | 1139.2ms | +7.9% | 1139.2ms | 13.7ms | 21 |
| node | `route:module` | 2580 | 426.0ms | 432.9ms | +1.6% | 432.9ms | 4.6ms | 20 |
| web | `route:client-entry` | 2581 | 298.2ms | 329.0ms | +10.3% | 329.0ms | 4.9ms | 21 |
| node | `manifest:transform` | 10 | 126.8ms | 136.9ms | +8.0% | 136.9ms | 17.4ms | 10 |
| node | `module:client-only-stub` | 10 | 120.7ms | 69.5ms | -42.4% | 69.5ms | 28.1ms | 10 |
| web | `manifest:stage` | 21 | 19.0ms | 18.9ms | -0.5% | 18.9ms | 1.5ms | 21 |
| web | `manifest:transform` | 10 | 0.8ms | 0.5ms | -37.5% | 0.5ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 410.7ms | 310.3ms | -24.4% | 310.3ms | 8.7ms | 20 |
| node | `route:module` | 500 | 123.9ms | 119.7ms | -3.4% | 119.7ms | 1.5ms | 20 |
| web | `route:client-entry` | 500 | 85.6ms | 94.7ms | +10.6% | 94.7ms | 2.8ms | 20 |
| node | `module:client-only-stub` | 10 | 68.8ms | 75.7ms | +10.0% | 75.7ms | 10.5ms | 10 |
| node | `manifest:transform` | 10 | 41.5ms | 36.1ms | -13.0% | 36.1ms | 4.7ms | 10 |
| web | `manifest:stage` | 20 | 4.0ms | 4.7ms | +17.5% | 4.7ms | 0.3ms | 20 |
| web | `manifest:transform` | 10 | 0.3ms | 0.4ms | +33.3% | 0.4ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 | Head client JS gzip | Client JS gzip delta | Head total gzip |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 95.42s | 95.78s | +0.4% | 95.78s | - | 1.00x | - | - | - | - |
| complex app | 2 | 67.27s | 70.04s | +4.1% | 70.04s | - | 0.96x | - | - | - | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 80.80s | 82.48s | +2.1% | 72.86s | 74.45s | 2.13s | 2.14s | 3.89s | 3.96s | +1.9% | 82.48s | - | 0.98x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29058027961)

