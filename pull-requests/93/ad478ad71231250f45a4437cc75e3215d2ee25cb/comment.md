<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `ad478ad` against base `c9535d8`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.93s | 32.36s | +8.1% | 19.94s | 19.74s | -1.0% | 4.05s | 4.07s | +0.6% | 3.31s | 2.94s | -11.4% | 0.92x |
| Large app | 1 | 13.97s | 16.07s | +15.0% | 8.49s | 8.49s | +0.1% | 2.02s | 2.04s | +1.1% | 1.80s | 1.78s | -1.1% | 0.87x |
| Standard fixtures | 6 | 15.96s | 16.29s | +2.1% | 11.45s | 11.25s | -1.8% | 2.03s | 2.03s | +0.1% | 1.52s | 1.16s | -23.5% | 0.98x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 9.02s | 8.89s | -1.4% | 8.92s | 9.11s | 1.01x | 1547 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.25s | 4.35s | +2.4% | 4.31s | 4.39s | 0.98x | 643 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.72s | 5.64s | -1.3% | 5.65s | 5.74s | 1.01x | 817 MB |
| `synthetic-256-sourcemaps` | 10 | 2.24s | 2.23s | -0.6% | 2.24s | 2.42s | 1.01x | 454 MB |
| `synthetic-256-ssr-esm` | 10 | 2.13s | 2.08s | -2.4% | 2.09s | 2.25s | 1.02x | 414 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.51s | 2.51s | +0.1% | 2.53s | 2.74s | 1.00x | 466 MB |
| `synthetic-48-ssr-esm` | 10 | 1.41s | 1.35s | -4.4% | 1.37s | 1.58s | 1.05x | 316 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.97s | 16.07s | +15.0% | 8.49s | 8.49s | 2.02s | 2.04s | 1.80s | 1.78s | -1.1% | 16.37s | 17.08s | 0.87x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.68s | 4.83s | +3.1% | 3.36s | 3.30s | 0.59s | 0.58s | 0.48s | 0.35s | -26.6% | 4.82s | 4.97s | 0.97x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.76s | 4.81s | +1.0% | 3.37s | 3.30s | 0.58s | 0.58s | 0.53s | 0.35s | -33.6% | 4.89s | 5.12s | 0.99x | - |
| `synthetic-256-sourcemaps` | 10 | 2.03s | 2.06s | +1.6% | 1.51s | 1.50s | 0.25s | 0.25s | 0.15s | 0.15s | -0.1% | 2.08s | 2.27s | 0.98x | - |
| `synthetic-256-ssr-esm` | 10 | 1.80s | 1.86s | +3.4% | 1.27s | 1.27s | 0.24s | 0.25s | 0.15s | 0.13s | -16.5% | 1.84s | 1.90s | 0.97x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.78s | 1.81s | +1.5% | 1.29s | 1.25s | 0.23s | 0.25s | 0.15s | 0.13s | -16.5% | 1.83s | 1.94s | 0.99x | - |
| `synthetic-48-ssr-esm` | 10 | 0.91s | 0.93s | +2.6% | 0.65s | 0.63s | 0.13s | 0.13s | 0.05s | 0.05s | -0.3% | 0.93s | 0.94s | 0.97x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1720.6ms | 1814.1ms | +5.4% | 1814.1ms | 23.1ms | 10 |
| node | `route:module` | 1785 | 847.2ms | 943.8ms | +11.4% | 943.8ms | 9.0ms | 10 |
| web | `route:client-entry` | 1785 | 374.3ms | 440.0ms | +17.6% | 440.0ms | 5.5ms | 10 |
| node | `manifest:transform` | 5 | 107.3ms | 167.9ms | +56.5% | 167.9ms | 67.6ms | 5 |
| web | `manifest:stage` | 15 | 16.0ms | 23.0ms | +43.8% | 23.0ms | 4.8ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2111.1ms | 2134.2ms | +1.1% | 2134.2ms | 19.7ms | 10 |
| node | `route:module` | 5130 | 977.0ms | 959.8ms | -1.8% | 959.8ms | 13.7ms | 10 |
| web | `route:client-entry` | 5130 | 647.5ms | 667.6ms | +3.1% | 667.6ms | 6.2ms | 10 |
| node | `manifest:transform` | 5 | 211.3ms | 212.5ms | +0.6% | 212.5ms | 46.7ms | 5 |
| node | `module:client-only-stub` | 5 | 201.8ms | 409.5ms | +102.9% | 409.5ms | 149.4ms | 5 |
| web | `manifest:stage` | 15 | 57.2ms | 62.1ms | +8.6% | 62.1ms | 6.8ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5131 | 2135.0ms | 2098.2ms | -1.7% | 2098.2ms | 24.8ms | 11 |
| node | `route:module` | 5130 | 973.5ms | 964.8ms | -0.9% | 964.8ms | 9.2ms | 10 |
| web | `route:client-entry` | 5131 | 645.9ms | 712.1ms | +10.2% | 712.1ms | 7.6ms | 11 |
| node | `module:client-only-stub` | 5 | 274.8ms | 231.5ms | -15.8% | 231.5ms | 140.9ms | 5 |
| node | `manifest:transform` | 5 | 211.3ms | 214.2ms | +1.4% | 214.2ms | 47.9ms | 5 |
| web | `manifest:stage` | 16 | 60.0ms | 78.7ms | +31.2% | 78.7ms | 8.0ms | 16 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1420.5ms | 1463.5ms | +3.0% | 1463.5ms | 18.0ms | 21 |
| node | `route:module` | 2580 | 607.0ms | 594.0ms | -2.1% | 594.0ms | 4.6ms | 20 |
| web | `route:client-entry` | 2581 | 407.4ms | 419.4ms | +2.9% | 419.4ms | 5.1ms | 21 |
| node | `module:client-only-stub` | 10 | 253.9ms | 164.6ms | -35.2% | 164.6ms | 57.5ms | 10 |
| node | `manifest:transform` | 10 | 159.8ms | 149.9ms | -6.2% | 149.9ms | 17.5ms | 10 |
| web | `manifest:stage` | 33 | 25.0ms | 31.0ms | +24.0% | 31.0ms | 1.4ms | 33 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1410.1ms | 1412.5ms | +0.2% | 1412.5ms | 15.7ms | 20 |
| node | `route:module` | 2580 | 561.8ms | 543.1ms | -3.3% | 543.1ms | 5.0ms | 20 |
| web | `route:client-entry` | 2580 | 394.8ms | 417.2ms | +5.7% | 417.2ms | 5.4ms | 20 |
| node | `manifest:transform` | 10 | 175.7ms | 148.9ms | -15.3% | 148.9ms | 19.9ms | 10 |
| node | `module:client-only-stub` | 10 | 159.0ms | 86.5ms | -45.6% | 86.5ms | 50.1ms | 10 |
| web | `manifest:stage` | 30 | 22.3ms | 29.1ms | +30.5% | 29.1ms | 1.4ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1385.1ms | 1459.5ms | +5.4% | 1459.5ms | 13.9ms | 21 |
| node | `route:module` | 2580 | 550.5ms | 582.8ms | +5.9% | 582.8ms | 5.8ms | 20 |
| web | `route:client-entry` | 2581 | 398.3ms | 427.0ms | +7.2% | 427.0ms | 5.6ms | 21 |
| node | `manifest:transform` | 10 | 175.2ms | 158.8ms | -9.4% | 158.8ms | 23.7ms | 10 |
| node | `module:client-only-stub` | 10 | 81.4ms | 292.6ms | +259.5% | 292.6ms | 131.9ms | 10 |
| web | `manifest:stage` | 31 | 22.4ms | 30.9ms | +37.9% | 30.9ms | 2.3ms | 31 |
| web | `manifest:transform` | 10 | 1.1ms | 1.0ms | -9.1% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 481.7ms | 407.7ms | -15.4% | 407.7ms | 9.7ms | 20 |
| node | `route:module` | 500 | 169.5ms | 165.1ms | -2.6% | 165.1ms | 3.8ms | 20 |
| web | `route:client-entry` | 500 | 107.8ms | 125.5ms | +16.4% | 125.5ms | 3.6ms | 20 |
| node | `module:client-only-stub` | 10 | 73.8ms | 95.5ms | +29.4% | 95.5ms | 14.1ms | 10 |
| node | `manifest:transform` | 10 | 54.2ms | 50.5ms | -6.8% | 50.5ms | 6.7ms | 10 |
| web | `manifest:stage` | 30 | 5.5ms | 7.9ms | +43.6% | 7.9ms | 0.4ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 114.87s | 116.88s | +1.7% | 116.88s | - | 0.98x | - |
| complex app | 2 | 80.90s | 81.29s | +0.5% | 81.29s | - | 1.00x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 99.66s | 101.80s | +2.1% | 90.81s | 90.78s | 2.92s | 2.89s | 3.39s | 3.45s | +1.9% | 101.80s | - | 0.98x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29122288505)

