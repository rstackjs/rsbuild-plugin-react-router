<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `b4a84b4` against base `c93ec98`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.47s | 29.42s | -0.2% | 19.72s | 20.04s | +1.6% | 3.97s | 3.92s | -1.2% | 3.27s | 2.92s | -10.6% | 1.00x |
| Large app | 1 | 13.83s | 14.04s | +1.5% | 8.44s | 8.57s | +1.4% | 2.01s | 1.99s | -0.8% | 1.75s | 1.78s | +1.5% | 0.98x |
| Standard fixtures | 6 | 15.65s | 15.38s | -1.7% | 11.28s | 11.47s | +1.7% | 1.96s | 1.92s | -1.6% | 1.52s | 1.14s | -24.6% | 1.02x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.71s | 8.75s | +0.5% | 8.82s | 9.05s | 1.00x | 1541 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.18s | 4.10s | -2.0% | 4.13s | 4.33s | 1.02x | 648 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.57s | 5.68s | +2.0% | 5.69s | 5.85s | 0.98x | 821 MB |
| `synthetic-256-sourcemaps` | 10 | 2.17s | 2.22s | +1.9% | 2.23s | 2.39s | 0.98x | 451 MB |
| `synthetic-256-ssr-esm` | 10 | 2.02s | 2.06s | +1.7% | 2.07s | 2.24s | 0.98x | 416 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.44s | 2.47s | +1.5% | 2.49s | 2.65s | 0.98x | 451 MB |
| `synthetic-48-ssr-esm` | 10 | 1.35s | 1.39s | +2.3% | 1.45s | 2.05s | 0.98x | 330 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.83s | 14.04s | +1.5% | 8.44s | 8.57s | 2.01s | 1.99s | 1.75s | 1.78s | +1.5% | 13.96s | 14.15s | 0.98x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.63s | 4.48s | -3.1% | 3.30s | 3.34s | 0.56s | 0.55s | 0.50s | 0.38s | -25.2% | 4.49s | 4.55s | 1.03x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.60s | 4.49s | -2.3% | 3.29s | 3.35s | 0.54s | 0.55s | 0.51s | 0.38s | -24.9% | 4.54s | 4.69s | 1.02x | - |
| `synthetic-256-sourcemaps` | 10 | 2.00s | 1.98s | -1.0% | 1.50s | 1.53s | 0.25s | 0.23s | 0.15s | 0.13s | -15.8% | 1.98s | 1.99s | 1.01x | - |
| `synthetic-256-ssr-esm` | 10 | 1.76s | 1.77s | +0.7% | 1.27s | 1.32s | 0.24s | 0.23s | 0.15s | 0.10s | -31.7% | 1.76s | 1.82s | 0.99x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.75s | 1.75s | +0.0% | 1.26s | 1.31s | 0.23s | 0.23s | 0.15s | 0.10s | -32.2% | 1.75s | 1.78s | 1.00x | - |
| `synthetic-48-ssr-esm` | 10 | 0.91s | 0.90s | -1.3% | 0.66s | 0.64s | 0.13s | 0.13s | 0.05s | 0.05s | +0.9% | 0.90s | 0.91s | 1.01x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1713.2ms | 1533.6ms | -10.5% | 1533.6ms | 14.5ms | 10 |
| node | `route:module` | 1785 | 910.1ms | 742.0ms | -18.5% | 742.0ms | 6.2ms | 10 |
| web | `route:client-entry` | 1785 | 380.3ms | 419.1ms | +10.2% | 419.1ms | 8.2ms | 10 |
| node | `manifest:transform` | 5 | 141.8ms | 151.3ms | +6.7% | 151.3ms | 54.4ms | 5 |
| web | `manifest:stage` | 10 | 14.4ms | 14.4ms | 0.0% | 14.4ms | 1.9ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2035.1ms | 1771.4ms | -13.0% | 1771.4ms | 18.0ms | 10 |
| node | `route:module` | 5130 | 921.3ms | 846.2ms | -8.2% | 846.2ms | 12.8ms | 10 |
| web | `route:client-entry` | 5130 | 627.2ms | 539.0ms | -14.1% | 539.0ms | 6.8ms | 10 |
| node | `manifest:transform` | 5 | 208.2ms | 214.6ms | +3.1% | 214.6ms | 49.3ms | 5 |
| node | `module:client-only-stub` | 5 | 103.1ms | 75.5ms | -26.8% | 75.5ms | 22.3ms | 5 |
| web | `manifest:stage` | 10 | 59.4ms | 46.8ms | -21.2% | 46.8ms | 6.7ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2056.4ms | 1792.4ms | -12.8% | 1792.4ms | 16.8ms | 10 |
| node | `route:module` | 5130 | 919.2ms | 852.0ms | -7.3% | 852.0ms | 10.9ms | 10 |
| web | `route:client-entry` | 5130 | 603.6ms | 545.9ms | -9.6% | 545.9ms | 8.9ms | 10 |
| node | `module:client-only-stub` | 5 | 469.5ms | 203.0ms | -56.8% | 203.0ms | 158.3ms | 5 |
| node | `manifest:transform` | 5 | 204.7ms | 237.4ms | +16.0% | 237.4ms | 58.9ms | 5 |
| web | `manifest:stage` | 10 | 60.7ms | 46.2ms | -23.9% | 46.2ms | 6.7ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1410.9ms | 1289.3ms | -8.6% | 1289.3ms | 20.2ms | 20 |
| node | `route:module` | 2580 | 598.2ms | 579.0ms | -3.2% | 579.0ms | 7.2ms | 20 |
| web | `route:client-entry` | 2580 | 397.2ms | 369.0ms | -7.1% | 369.0ms | 6.3ms | 20 |
| node | `module:client-only-stub` | 10 | 244.6ms | 160.1ms | -34.5% | 160.1ms | 49.4ms | 10 |
| node | `manifest:transform` | 10 | 145.5ms | 157.9ms | +8.5% | 157.9ms | 21.4ms | 10 |
| web | `manifest:stage` | 20 | 20.1ms | 20.8ms | +3.5% | 20.8ms | 1.5ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1358.0ms | 1248.6ms | -8.1% | 1248.6ms | 14.1ms | 21 |
| node | `route:module` | 2580 | 553.6ms | 521.2ms | -5.9% | 521.2ms | 6.6ms | 20 |
| web | `route:client-entry` | 2581 | 383.5ms | 370.1ms | -3.5% | 370.1ms | 7.6ms | 21 |
| node | `module:client-only-stub` | 10 | 195.5ms | 246.1ms | +25.9% | 246.1ms | 97.6ms | 10 |
| node | `manifest:transform` | 10 | 151.0ms | 196.0ms | +29.8% | 196.0ms | 25.0ms | 10 |
| web | `manifest:stage` | 21 | 20.2ms | 21.0ms | +4.0% | 21.0ms | 1.5ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1325.3ms | 1256.7ms | -5.2% | 1256.7ms | 13.8ms | 20 |
| node | `route:module` | 2580 | 542.4ms | 547.9ms | +1.0% | 547.9ms | 5.1ms | 20 |
| web | `route:client-entry` | 2580 | 380.0ms | 324.0ms | -14.7% | 324.0ms | 5.7ms | 20 |
| node | `manifest:transform` | 10 | 179.8ms | 174.0ms | -3.2% | 174.0ms | 22.8ms | 10 |
| node | `module:client-only-stub` | 10 | 131.9ms | 261.7ms | +98.4% | 261.7ms | 57.1ms | 10 |
| web | `manifest:stage` | 20 | 20.6ms | 20.7ms | +0.5% | 20.7ms | 1.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 487.5ms | 446.6ms | -8.4% | 446.6ms | 10.1ms | 20 |
| node | `route:module` | 500 | 163.8ms | 118.9ms | -27.4% | 118.9ms | 0.6ms | 20 |
| web | `route:client-entry` | 500 | 107.7ms | 83.7ms | -22.3% | 83.7ms | 2.1ms | 20 |
| node | `module:client-only-stub` | 10 | 76.8ms | 77.7ms | +1.2% | 77.7ms | 20.2ms | 10 |
| node | `manifest:transform` | 10 | 50.2ms | 49.2ms | -2.0% | 49.2ms | 8.6ms | 10 |
| web | `manifest:stage` | 20 | 5.5ms | 5.9ms | +7.3% | 5.9ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 113.46s | 116.71s | +2.9% | 116.71s | - | 0.97x | - |
| complex app | 2 | 78.98s | 82.30s | +4.2% | 82.30s | - | 0.96x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 96.87s | 100.06s | +3.3% | 88.10s | 91.20s | 2.88s | 2.91s | 3.29s | 3.37s | +2.5% | 100.06s | - | 0.97x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28687568528)

