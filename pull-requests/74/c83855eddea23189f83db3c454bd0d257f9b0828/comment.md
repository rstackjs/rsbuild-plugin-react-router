<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `c83855e` against base `c93ec98`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 29.47s | 28.33s | -3.9% | 19.72s | 19.37s | -1.8% | 3.97s | 3.78s | -4.7% | 3.27s | 2.77s | -15.1% | 1.04x |
| Large app | 1 | 13.83s | 13.34s | -3.5% | 8.44s | 8.21s | -2.8% | 2.01s | 1.92s | -4.6% | 1.75s | 1.66s | -5.0% | 1.04x |
| Standard fixtures | 6 | 15.65s | 14.98s | -4.2% | 11.28s | 11.16s | -1.1% | 1.96s | 1.86s | -4.7% | 1.52s | 1.11s | -26.6% | 1.04x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.71s | 8.43s | -3.2% | 8.47s | 8.71s | 1.03x | 1524 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.18s | 3.94s | -5.8% | 3.99s | 4.27s | 1.06x | 634 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.57s | 5.56s | -0.2% | 5.57s | 5.80s | 1.00x | 821 MB |
| `synthetic-256-sourcemaps` | 10 | 2.17s | 2.11s | -2.8% | 2.13s | 2.29s | 1.03x | 458 MB |
| `synthetic-256-ssr-esm` | 10 | 2.02s | 1.99s | -1.8% | 2.00s | 2.17s | 1.02x | 421 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.44s | 2.38s | -2.2% | 2.39s | 2.55s | 1.02x | 446 MB |
| `synthetic-48-ssr-esm` | 10 | 1.35s | 1.36s | +0.2% | 1.37s | 1.58s | 1.00x | 325 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.83s | 13.34s | -3.5% | 8.44s | 8.21s | 2.01s | 1.92s | 1.75s | 1.66s | -5.0% | 13.61s | 14.70s | 1.04x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.63s | 4.38s | -5.2% | 3.30s | 3.25s | 0.56s | 0.52s | 0.50s | 0.38s | -25.0% | 4.37s | 4.45s | 1.06x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.60s | 4.36s | -5.1% | 3.29s | 3.26s | 0.54s | 0.53s | 0.51s | 0.35s | -30.4% | 4.49s | 5.02s | 1.05x | - |
| `synthetic-256-sourcemaps` | 10 | 2.00s | 1.95s | -2.4% | 1.50s | 1.49s | 0.25s | 0.23s | 0.15s | 0.13s | -16.9% | 1.94s | 1.97s | 1.02x | - |
| `synthetic-256-ssr-esm` | 10 | 1.76s | 1.70s | -3.1% | 1.27s | 1.26s | 0.24s | 0.22s | 0.15s | 0.10s | -32.4% | 1.69s | 1.75s | 1.03x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.75s | 1.70s | -2.9% | 1.26s | 1.26s | 0.23s | 0.23s | 0.15s | 0.10s | -32.6% | 1.70s | 1.80s | 1.03x | - |
| `synthetic-48-ssr-esm` | 10 | 0.91s | 0.88s | -3.7% | 0.66s | 0.63s | 0.13s | 0.13s | 0.05s | 0.05s | +0.4% | 0.87s | 0.92s | 1.04x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1713.2ms | 1525.3ms | -11.0% | 1525.3ms | 13.9ms | 10 |
| node | `route:module` | 1785 | 910.1ms | 736.0ms | -19.1% | 736.0ms | 7.0ms | 10 |
| web | `route:client-entry` | 1785 | 380.3ms | 431.0ms | +13.3% | 431.0ms | 9.7ms | 10 |
| node | `manifest:transform` | 5 | 141.8ms | 96.5ms | -31.9% | 96.5ms | 25.0ms | 5 |
| web | `manifest:stage` | 11 | 14.4ms | 15.1ms | +4.9% | 15.1ms | 1.8ms | 11 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2035.1ms | 1713.0ms | -15.8% | 1713.0ms | 16.5ms | 10 |
| node | `route:module` | 5130 | 921.3ms | 819.4ms | -11.1% | 819.4ms | 12.0ms | 10 |
| web | `route:client-entry` | 5130 | 627.2ms | 523.9ms | -16.5% | 523.9ms | 6.6ms | 10 |
| node | `manifest:transform` | 5 | 208.2ms | 214.5ms | +3.0% | 214.5ms | 49.5ms | 5 |
| node | `module:client-only-stub` | 5 | 103.1ms | 425.9ms | +313.1% | 425.9ms | 310.6ms | 5 |
| web | `manifest:stage` | 10 | 59.4ms | 48.0ms | -19.2% | 48.0ms | 7.9ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5131 | 2056.4ms | 1722.6ms | -16.2% | 1722.6ms | 11.6ms | 11 |
| node | `route:module` | 5130 | 919.2ms | 801.7ms | -12.8% | 801.7ms | 12.2ms | 10 |
| web | `route:client-entry` | 5131 | 603.6ms | 539.7ms | -10.6% | 539.7ms | 8.2ms | 11 |
| node | `module:client-only-stub` | 5 | 469.5ms | 84.8ms | -81.9% | 84.8ms | 28.3ms | 5 |
| node | `manifest:transform` | 5 | 204.7ms | 212.7ms | +3.9% | 212.7ms | 50.2ms | 5 |
| web | `manifest:stage` | 11 | 60.7ms | 48.2ms | -20.6% | 48.2ms | 6.6ms | 11 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1410.9ms | 1301.2ms | -7.8% | 1301.2ms | 16.2ms | 20 |
| node | `route:module` | 2580 | 598.2ms | 572.1ms | -4.4% | 572.1ms | 6.2ms | 20 |
| web | `route:client-entry` | 2580 | 397.2ms | 327.5ms | -17.5% | 327.5ms | 5.0ms | 20 |
| node | `module:client-only-stub` | 10 | 244.6ms | 310.7ms | +27.0% | 310.7ms | 95.7ms | 10 |
| node | `manifest:transform` | 10 | 145.5ms | 181.4ms | +24.7% | 181.4ms | 21.8ms | 10 |
| web | `manifest:stage` | 20 | 20.1ms | 20.1ms | -0.0% | 20.1ms | 1.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1358.0ms | 1319.2ms | -2.9% | 1319.2ms | 15.2ms | 21 |
| node | `route:module` | 2580 | 553.6ms | 488.2ms | -11.8% | 488.2ms | 4.7ms | 20 |
| web | `route:client-entry` | 2581 | 383.5ms | 338.7ms | -11.7% | 338.7ms | 5.9ms | 21 |
| node | `module:client-only-stub` | 10 | 195.5ms | 102.3ms | -47.7% | 102.3ms | 25.7ms | 10 |
| node | `manifest:transform` | 10 | 151.0ms | 154.8ms | +2.5% | 154.8ms | 24.8ms | 10 |
| web | `manifest:stage` | 21 | 20.2ms | 20.4ms | +1.0% | 20.4ms | 1.4ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1325.3ms | 1229.8ms | -7.2% | 1229.8ms | 14.3ms | 22 |
| node | `route:module` | 2580 | 542.4ms | 496.3ms | -8.5% | 496.3ms | 8.4ms | 20 |
| web | `route:client-entry` | 2582 | 380.0ms | 355.3ms | -6.5% | 355.3ms | 5.3ms | 22 |
| node | `manifest:transform` | 10 | 179.8ms | 138.0ms | -23.2% | 138.0ms | 17.0ms | 10 |
| node | `module:client-only-stub` | 10 | 131.9ms | 242.5ms | +83.9% | 242.5ms | 80.0ms | 10 |
| web | `manifest:stage` | 22 | 20.6ms | 21.5ms | +4.4% | 21.5ms | 1.3ms | 22 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 487.5ms | 440.1ms | -9.7% | 440.1ms | 12.8ms | 20 |
| node | `route:module` | 500 | 163.8ms | 129.3ms | -21.1% | 129.3ms | 4.5ms | 20 |
| web | `route:client-entry` | 500 | 107.7ms | 83.2ms | -22.7% | 83.2ms | 2.1ms | 20 |
| node | `module:client-only-stub` | 10 | 76.8ms | 79.6ms | +3.6% | 79.6ms | 11.9ms | 10 |
| node | `manifest:transform` | 10 | 50.2ms | 54.3ms | +8.2% | 54.3ms | 7.9ms | 10 |
| web | `manifest:stage` | 20 | 5.5ms | 5.5ms | -0.0% | 5.5ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 113.46s | 109.56s | -3.4% | 109.56s | - | 1.04x | - |
| complex app | 2 | 78.98s | 80.43s | +1.8% | 80.43s | - | 0.98x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 96.87s | 98.51s | +1.7% | 88.10s | 89.79s | 2.88s | 2.90s | 3.29s | 3.27s | -0.7% | 98.51s | - | 0.98x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28688128881)

