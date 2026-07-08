<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `2d63149` against base `4aff046`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.37s | 29.47s | +0.3% | 19.56s | 19.70s | +0.7% | 3.99s | 4.05s | +1.5% | 3.29s | 3.27s | -0.7% | 1.00x |
| Large app | 1 | 13.91s | 13.78s | -0.9% | 8.46s | 8.41s | -0.6% | 2.02s | 2.01s | -0.3% | 1.77s | 1.82s | +2.9% | 1.01x |
| Standard fixtures | 6 | 15.47s | 15.69s | +1.4% | 11.10s | 11.29s | +1.7% | 1.97s | 2.04s | +3.4% | 1.52s | 1.44s | -4.9% | 0.99x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 9.04s | 8.73s | -3.5% | 8.84s | 9.17s | 1.04x | 1538 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.20s | 4.19s | -0.1% | 4.26s | 4.52s | 1.00x | 643 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.59s | 5.61s | +0.3% | 5.68s | 6.07s | 1.00x | 823 MB |
| `synthetic-256-sourcemaps` | 10 | 2.23s | 2.22s | -0.1% | 2.23s | 2.43s | 1.00x | 472 MB |
| `synthetic-256-ssr-esm` | 10 | 2.11s | 2.11s | -0.1% | 2.13s | 2.31s | 1.00x | 419 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.51s | 2.53s | +0.7% | 2.54s | 2.66s | 0.99x | 460 MB |
| `synthetic-48-ssr-esm` | 10 | 1.37s | 1.37s | +0.0% | 1.39s | 1.63s | 1.00x | 312 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.91s | 13.78s | -0.9% | 8.46s | 8.41s | 2.02s | 2.01s | 1.77s | 1.82s | +2.9% | 14.05s | 15.22s | 1.01x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.57s | 4.69s | +2.7% | 3.27s | 3.34s | 0.58s | 0.58s | 0.48s | 0.50s | +4.9% | 4.65s | 4.72s | 0.97x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.57s | 4.60s | +0.6% | 3.23s | 3.30s | 0.56s | 0.58s | 0.53s | 0.48s | -8.9% | 4.59s | 4.67s | 0.99x | - |
| `synthetic-256-sourcemaps` | 10 | 1.97s | 1.98s | +0.4% | 1.47s | 1.49s | 0.25s | 0.24s | 0.15s | 0.15s | -0.7% | 2.00s | 2.10s | 1.00x | - |
| `synthetic-256-ssr-esm` | 10 | 1.73s | 1.74s | +0.6% | 1.24s | 1.26s | 0.23s | 0.25s | 0.15s | 0.13s | -17.0% | 1.73s | 1.77s | 0.99x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.71s | 1.78s | +3.8% | 1.23s | 1.27s | 0.23s | 0.26s | 0.15s | 0.13s | -16.2% | 1.77s | 1.80s | 0.96x | - |
| `synthetic-48-ssr-esm` | 10 | 0.91s | 0.90s | -1.2% | 0.66s | 0.64s | 0.13s | 0.13s | 0.05s | 0.05s | +0.3% | 0.90s | 0.92s | 1.01x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1702.2ms | 1779.4ms | +4.5% | 1779.4ms | 20.5ms | 10 |
| node | `route:module` | 1785 | 877.8ms | 895.1ms | +2.0% | 895.1ms | 11.3ms | 10 |
| web | `route:client-entry` | 1785 | 399.5ms | 367.0ms | -8.1% | 367.0ms | 5.9ms | 10 |
| node | `manifest:transform` | 5 | 102.0ms | 138.3ms | +35.6% | 138.3ms | 43.9ms | 5 |
| web | `manifest:stage` | 10 | 14.2ms | 14.6ms | +2.8% | 14.6ms | 2.0ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2067.8ms | 2049.3ms | -0.9% | 2049.3ms | 15.6ms | 10 |
| node | `route:module` | 5130 | 903.4ms | 951.7ms | +5.3% | 951.7ms | 12.0ms | 10 |
| web | `route:client-entry` | 5130 | 647.6ms | 650.2ms | +0.4% | 650.2ms | 7.9ms | 10 |
| node | `manifest:transform` | 5 | 208.7ms | 217.3ms | +4.1% | 217.3ms | 47.1ms | 5 |
| node | `module:client-only-stub` | 5 | 173.3ms | 323.2ms | +86.5% | 323.2ms | 128.3ms | 5 |
| web | `manifest:stage` | 10 | 57.3ms | 53.0ms | -7.5% | 53.0ms | 8.3ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2046.5ms | 2025.9ms | -1.0% | 2025.9ms | 15.9ms | 10 |
| node | `route:module` | 5130 | 956.5ms | 912.7ms | -4.6% | 912.7ms | 5.4ms | 10 |
| web | `route:client-entry` | 5130 | 635.3ms | 632.3ms | -0.5% | 632.3ms | 6.8ms | 10 |
| node | `manifest:transform` | 5 | 215.9ms | 216.6ms | +0.3% | 216.6ms | 49.0ms | 5 |
| node | `module:client-only-stub` | 5 | 90.1ms | 121.7ms | +35.1% | 121.7ms | 41.0ms | 5 |
| web | `manifest:stage` | 10 | 59.4ms | 64.3ms | +8.2% | 64.3ms | 8.5ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1431.7ms | 1421.7ms | -0.7% | 1421.7ms | 20.8ms | 22 |
| node | `route:module` | 2580 | 585.4ms | 632.6ms | +8.1% | 632.6ms | 5.9ms | 20 |
| web | `route:client-entry` | 2582 | 398.1ms | 412.4ms | +3.6% | 412.4ms | 5.9ms | 22 |
| node | `manifest:transform` | 10 | 154.5ms | 148.0ms | -4.2% | 148.0ms | 22.6ms | 10 |
| node | `module:client-only-stub` | 10 | 64.0ms | 243.4ms | +280.3% | 243.4ms | 67.3ms | 10 |
| web | `manifest:stage` | 22 | 20.6ms | 21.6ms | +4.9% | 21.6ms | 1.4ms | 22 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1342.3ms | 1413.2ms | +5.3% | 1413.2ms | 16.5ms | 20 |
| node | `route:module` | 2580 | 547.7ms | 564.4ms | +3.0% | 564.4ms | 8.7ms | 20 |
| web | `route:client-entry` | 2580 | 387.1ms | 392.6ms | +1.4% | 392.6ms | 5.4ms | 20 |
| node | `module:client-only-stub` | 10 | 183.0ms | 138.1ms | -24.5% | 138.1ms | 84.7ms | 10 |
| node | `manifest:transform` | 10 | 168.9ms | 161.0ms | -4.7% | 161.0ms | 18.9ms | 10 |
| web | `manifest:stage` | 20 | 20.7ms | 21.2ms | +2.4% | 21.2ms | 1.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1313.5ms | 1454.3ms | +10.7% | 1454.3ms | 19.9ms | 21 |
| node | `route:module` | 2580 | 562.4ms | 573.2ms | +1.9% | 573.2ms | 5.6ms | 20 |
| web | `route:client-entry` | 2581 | 388.4ms | 407.9ms | +5.0% | 407.9ms | 6.1ms | 21 |
| node | `module:client-only-stub` | 10 | 299.5ms | 208.0ms | -30.6% | 208.0ms | 139.9ms | 10 |
| node | `manifest:transform` | 10 | 174.5ms | 163.1ms | -6.5% | 163.1ms | 21.0ms | 10 |
| web | `manifest:stage` | 21 | 20.8ms | 21.8ms | +4.8% | 21.8ms | 1.4ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 487.0ms | 396.8ms | -18.5% | 396.8ms | 9.7ms | 20 |
| node | `route:module` | 500 | 163.6ms | 159.4ms | -2.6% | 159.4ms | 5.1ms | 20 |
| web | `route:client-entry` | 500 | 107.4ms | 116.4ms | +8.4% | 116.4ms | 3.6ms | 20 |
| node | `module:client-only-stub` | 10 | 92.4ms | 101.8ms | +10.2% | 101.8ms | 14.3ms | 10 |
| node | `manifest:transform` | 10 | 50.9ms | 52.4ms | +2.9% | 52.4ms | 7.2ms | 10 |
| web | `manifest:stage` | 20 | 5.3ms | 5.7ms | +7.5% | 5.7ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 117.85s | 118.46s | +0.5% | 118.46s | - | 0.99x | - |
| complex app | 2 | 85.93s | 93.57s | +8.9% | 93.57s | - | 0.92x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 100.70s | 99.12s | -1.6% | 91.56s | 90.18s | 2.94s | 2.91s | 3.51s | 3.44s | -2.0% | 99.12s | - | 1.02x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28927184270)

