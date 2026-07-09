<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `67092d4` against base `9018ef6`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.54s | 30.39s | +2.9% | 19.68s | 20.88s | +6.1% | 3.98s | 3.93s | -1.2% | 3.31s | 2.91s | -12.2% | 0.97x |
| Large app | 1 | 13.76s | 13.50s | -1.9% | 8.35s | 8.37s | +0.3% | 1.99s | 1.96s | -1.7% | 1.79s | 1.54s | -13.8% | 1.02x |
| Standard fixtures | 6 | 15.78s | 16.89s | +7.0% | 11.34s | 12.51s | +10.3% | 1.99s | 1.97s | -0.8% | 1.52s | 1.36s | -10.3% | 0.93x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.84s | 9.06s | +2.5% | 9.13s | 9.34s | 0.98x | 1564 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.26s | 4.97s | +16.6% | 5.01s | 5.34s | 0.86x | 728 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.76s | 6.35s | +10.4% | 6.35s | 6.41s | 0.91x | 850 MB |
| `synthetic-256-sourcemaps` | 10 | 2.22s | 2.36s | +6.4% | 2.37s | 2.55s | 0.94x | 488 MB |
| `synthetic-256-ssr-esm` | 10 | 2.11s | 2.29s | +8.3% | 2.30s | 2.44s | 0.92x | 444 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.51s | 2.68s | +6.8% | 2.74s | 2.95s | 0.94x | 487 MB |
| `synthetic-48-ssr-esm` | 10 | 1.38s | 1.31s | -5.0% | 1.34s | 1.56s | 1.05x | 341 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.76s | 13.50s | -1.9% | 8.35s | 8.37s | 1.99s | 1.96s | 1.79s | 1.54s | -13.8% | 13.49s | 13.61s | 1.02x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.53s | 5.01s | +10.6% | 3.24s | 3.72s | 0.56s | 0.55s | 0.48s | 0.45s | -5.4% | 4.99s | 5.08s | 0.90x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.76s | 5.08s | +6.7% | 3.37s | 3.69s | 0.56s | 0.57s | 0.53s | 0.48s | -10.1% | 5.13s | 5.38s | 0.94x | - |
| `synthetic-256-sourcemaps` | 10 | 2.03s | 2.05s | +0.7% | 1.51s | 1.55s | 0.25s | 0.24s | 0.15s | 0.13s | -16.9% | 2.06s | 2.11s | 0.99x | - |
| `synthetic-256-ssr-esm` | 10 | 1.76s | 1.95s | +11.2% | 1.27s | 1.48s | 0.24s | 0.24s | 0.15s | 0.13s | -16.9% | 1.96s | 2.01s | 0.90x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.79s | 1.93s | +7.5% | 1.30s | 1.45s | 0.25s | 0.24s | 0.15s | 0.13s | -16.4% | 1.93s | 1.99s | 0.93x | - |
| `synthetic-48-ssr-esm` | 10 | 0.91s | 0.87s | -4.1% | 0.65s | 0.62s | 0.13s | 0.12s | 0.05s | 0.05s | +0.1% | 0.87s | 0.91s | 1.04x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1727.6ms | 4948.9ms | +186.5% | 4948.9ms | 27.4ms | 33 |
| node | `route:module` | 1785 | 949.9ms | 1742.2ms | +83.4% | 1742.2ms | 10.3ms | 56 |
| web | `route:client-entry` | 1785 | 389.1ms | 357.2ms | -8.2% | 357.2ms | 5.5ms | 10 |
| node | `manifest:transform` | 5 | 159.2ms | 104.4ms | -34.4% | 104.4ms | 24.6ms | 5 |
| web | `manifest:stage` | 10 | 14.2ms | 16.8ms | +18.3% | 16.8ms | 4.5ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2040.3ms | 3659.9ms | +79.4% | 3659.9ms | 19.4ms | 35 |
| node | `route:module` | 5130 | 983.2ms | 1726.4ms | +75.6% | 1726.4ms | 4.4ms | 47 |
| node | `module:client-only-stub` | 5 | 749.7ms | 27.2ms | -96.4% | 27.2ms | 7.5ms | 5 |
| web | `route:client-entry` | 5130 | 649.7ms | 635.7ms | -2.2% | 635.7ms | 7.2ms | 10 |
| node | `manifest:transform` | 5 | 211.0ms | 214.9ms | +1.8% | 214.9ms | 46.5ms | 5 |
| web | `manifest:stage` | 10 | 52.0ms | 53.7ms | +3.3% | 53.7ms | 6.7ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5132 | 2085.3ms | 3672.0ms | +76.1% | 3672.0ms | 36.6ms | 38 |
| node | `route:module` | 5130 | 943.6ms | 1727.4ms | +83.1% | 1727.4ms | 5.9ms | 41 |
| web | `route:client-entry` | 5131 | 644.5ms | 649.1ms | +0.7% | 649.1ms | 6.8ms | 11 |
| node | `manifest:transform` | 5 | 206.2ms | 215.4ms | +4.5% | 215.4ms | 48.7ms | 5 |
| node | `module:client-only-stub` | 5 | 128.8ms | 38.2ms | -70.3% | 38.2ms | 12.3ms | 5 |
| web | `manifest:stage` | 11 | 51.9ms | 52.9ms | +1.9% | 52.9ms | 7.0ms | 11 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2584 | 1462.1ms | 3022.1ms | +106.7% | 3022.1ms | 25.0ms | 44 |
| node | `route:module` | 2580 | 601.3ms | 1170.7ms | +94.7% | 1170.7ms | 5.9ms | 66 |
| web | `route:client-entry` | 2582 | 394.6ms | 398.9ms | +1.1% | 398.9ms | 4.7ms | 22 |
| node | `manifest:transform` | 10 | 170.5ms | 146.3ms | -14.2% | 146.3ms | 20.9ms | 10 |
| node | `module:client-only-stub` | 10 | 163.1ms | 55.6ms | -65.9% | 55.6ms | 7.8ms | 10 |
| web | `manifest:stage` | 22 | 21.5ms | 20.4ms | -5.1% | 20.4ms | 1.3ms | 22 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2583 | 1357.6ms | 2938.7ms | +116.5% | 2938.7ms | 16.0ms | 43 |
| node | `route:module` | 2580 | 541.9ms | 1120.8ms | +106.8% | 1120.8ms | 6.4ms | 70 |
| web | `route:client-entry` | 2583 | 390.6ms | 387.5ms | -0.8% | 387.5ms | 4.9ms | 23 |
| node | `manifest:transform` | 10 | 175.9ms | 160.4ms | -8.8% | 160.4ms | 21.2ms | 10 |
| node | `module:client-only-stub` | 10 | 162.1ms | 66.7ms | -58.9% | 66.7ms | 21.1ms | 10 |
| web | `manifest:stage` | 23 | 21.4ms | 22.0ms | +2.8% | 22.0ms | 1.4ms | 23 |
| web | `manifest:transform` | 10 | 1.0ms | 1.1ms | +10.0% | 1.1ms | 0.2ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1346.4ms | 2958.2ms | +119.7% | 2958.2ms | 28.5ms | 42 |
| node | `route:module` | 2580 | 559.9ms | 1098.5ms | +96.2% | 1098.5ms | 6.6ms | 70 |
| web | `route:client-entry` | 2582 | 396.6ms | 402.8ms | +1.6% | 402.8ms | 5.1ms | 22 |
| node | `manifest:transform` | 10 | 165.7ms | 149.8ms | -9.6% | 149.8ms | 20.8ms | 10 |
| node | `module:client-only-stub` | 10 | 142.7ms | 78.8ms | -44.8% | 78.8ms | 13.6ms | 10 |
| web | `manifest:stage` | 22 | 21.6ms | 20.7ms | -4.2% | 20.7ms | 1.4ms | 22 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 505.1ms | 369.8ms | -26.8% | 369.8ms | 6.0ms | 20 |
| node | `route:module` | 500 | 167.7ms | 164.8ms | -1.7% | 164.8ms | 5.5ms | 20 |
| web | `route:client-entry` | 500 | 107.0ms | 102.2ms | -4.5% | 102.2ms | 3.3ms | 20 |
| node | `module:client-only-stub` | 10 | 73.4ms | 76.7ms | +4.5% | 76.7ms | 12.5ms | 10 |
| node | `manifest:transform` | 10 | 57.0ms | 53.9ms | -5.4% | 53.9ms | 6.8ms | 10 |
| web | `manifest:stage` | 20 | 5.4ms | 5.2ms | -3.7% | 5.2ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 114.11s | 110.63s | -3.0% | 110.63s | - | 1.03x | - |
| complex app | 2 | 84.16s | 76.48s | -9.1% | 76.48s | - | 1.10x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 100.41s | 93.18s | -7.2% | 91.44s | 85.13s | 3.02s | 3.09s | 3.36s | 2.25s | -33.0% | 93.18s | - | 1.08x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28984352481)

