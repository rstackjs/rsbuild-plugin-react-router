<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `2243874` against base `c93ec98`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 28.98s | 39.10s | +34.9% | 19.35s | 20.37s | +5.2% | 3.90s | 4.05s | +3.7% | 3.24s | 3.37s | +3.9% | 0.74x |
| Large app | 1 | 13.57s | 16.30s | +20.2% | 8.28s | 8.79s | +6.1% | 1.95s | 2.04s | +4.3% | 1.77s | 1.86s | +4.7% | 0.83x |
| Standard fixtures | 6 | 15.41s | 22.79s | +47.9% | 11.07s | 11.58s | +4.6% | 1.95s | 2.01s | +3.1% | 1.47s | 1.52s | +3.0% | 0.68x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.58s | 8.82s | +2.8% | 8.80s | 8.99s | 0.97x | 1509 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.16s | 3.92s | -5.8% | 3.94s | 4.17s | 1.06x | 638 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.62s | 5.54s | -1.4% | 5.55s | 5.73s | 1.01x | 797 MB |
| `synthetic-256-sourcemaps` | 10 | 2.15s | 2.12s | -1.4% | 2.13s | 2.31s | 1.01x | 461 MB |
| `synthetic-256-ssr-esm` | 10 | 2.00s | 1.96s | -2.0% | 1.98s | 2.13s | 1.02x | 406 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.41s | 2.40s | -0.4% | 2.42s | 2.63s | 1.00x | 445 MB |
| `synthetic-48-ssr-esm` | 10 | 1.35s | 1.35s | -0.1% | 1.38s | 1.70s | 1.00x | 324 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.57s | 16.30s | +20.2% | 8.28s | 8.79s | 1.95s | 2.04s | 1.77s | 1.86s | +4.7% | 16.37s | 16.55s | 0.83x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.51s | 7.32s | +62.2% | 3.21s | 3.46s | 0.53s | 0.59s | 0.51s | 0.55s | +8.8% | 7.29s | 7.34s | 0.62x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.55s | 7.04s | +54.8% | 3.25s | 3.31s | 0.58s | 0.57s | 0.48s | 0.53s | +10.4% | 7.07s | 7.23s | 0.65x | - |
| `synthetic-256-sourcemaps` | 10 | 1.97s | 2.86s | +45.6% | 1.47s | 1.55s | 0.25s | 0.23s | 0.15s | 0.13s | -16.2% | 2.83s | 3.01s | 0.69x | - |
| `synthetic-256-ssr-esm` | 10 | 1.74s | 2.26s | +29.8% | 1.26s | 1.29s | 0.24s | 0.24s | 0.13s | 0.13s | -1.4% | 2.25s | 2.30s | 0.77x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.75s | 2.28s | +30.2% | 1.24s | 1.32s | 0.23s | 0.24s | 0.15s | 0.13s | -16.1% | 2.28s | 2.35s | 0.77x | - |
| `synthetic-48-ssr-esm` | 10 | 0.89s | 1.03s | +15.4% | 0.64s | 0.65s | 0.12s | 0.13s | 0.05s | 0.05s | +0.4% | 1.03s | 1.07s | 0.87x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1697.7ms | 1824.1ms | +7.4% | 1824.1ms | 26.8ms | 10 |
| node | `route:module` | 1785 | 852.4ms | 908.9ms | +6.6% | 908.9ms | 8.2ms | 10 |
| web | `route:client-entry` | 1785 | 380.9ms | 462.1ms | +21.3% | 462.1ms | 9.2ms | 10 |
| node | `manifest:transform` | 5 | 109.0ms | 115.4ms | +5.9% | 115.4ms | 32.7ms | 5 |
| web | `manifest:stage` | 15 | 14.0ms | 19.9ms | +42.1% | 19.9ms | 1.9ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 142.1ms | - | 142.1ms | 15.4ms | 10 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2072.6ms | 2032.6ms | -1.9% | 2032.6ms | 11.0ms | 10 |
| node | `route:module` | 5130 | 942.6ms | 1061.0ms | +12.6% | 1061.0ms | 14.1ms | 10 |
| web | `route:client-entry` | 5130 | 637.7ms | 658.1ms | +3.2% | 658.1ms | 14.1ms | 10 |
| node | `module:client-only-stub` | 5 | 273.0ms | 67.6ms | -75.2% | 67.6ms | 22.4ms | 5 |
| node | `manifest:transform` | 5 | 217.2ms | 218.8ms | +0.7% | 218.8ms | 52.1ms | 5 |
| web | `manifest:stage` | 15 | 61.3ms | 60.6ms | -1.1% | 60.6ms | 6.8ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.1ms | - | 2.1ms | 0.4ms | 10 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2048.7ms | 1981.2ms | -3.3% | 1981.2ms | 13.2ms | 10 |
| node | `route:module` | 5130 | 910.1ms | 1056.8ms | +16.1% | 1056.8ms | 7.9ms | 10 |
| web | `route:client-entry` | 5130 | 623.2ms | 607.8ms | -2.5% | 607.8ms | 14.6ms | 10 |
| node | `manifest:transform` | 5 | 205.0ms | 230.2ms | +12.3% | 230.2ms | 63.4ms | 5 |
| node | `module:client-only-stub` | 5 | 84.7ms | 444.2ms | +424.4% | 444.2ms | 366.4ms | 5 |
| web | `manifest:stage` | 15 | 52.2ms | 60.4ms | +15.7% | 60.4ms | 6.8ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.7ms | - | 2.7ms | 0.8ms | 10 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1360.0ms | 1396.1ms | +2.7% | 1396.1ms | 23.3ms | 22 |
| node | `route:module` | 2580 | 577.7ms | 678.1ms | +17.4% | 678.1ms | 4.8ms | 20 |
| web | `route:client-entry` | 2582 | 387.6ms | 386.6ms | -0.3% | 386.6ms | 5.9ms | 22 |
| node | `manifest:transform` | 10 | 148.2ms | 163.9ms | +10.6% | 163.9ms | 23.0ms | 10 |
| node | `module:client-only-stub` | 10 | 122.5ms | 86.5ms | -29.4% | 86.5ms | 27.6ms | 10 |
| web | `manifest:stage` | 33 | 19.9ms | 31.2ms | +56.8% | 31.2ms | 4.5ms | 33 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 23 | - | 5.9ms | - | 5.9ms | 0.4ms | 23 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2583 | 1309.6ms | 1335.6ms | +2.0% | 1335.6ms | 12.9ms | 23 |
| node | `route:module` | 2580 | 567.0ms | 638.0ms | +12.5% | 638.0ms | 6.2ms | 20 |
| web | `route:client-entry` | 2583 | 381.8ms | 404.7ms | +6.0% | 404.7ms | 8.2ms | 23 |
| node | `module:client-only-stub` | 10 | 209.9ms | 236.9ms | +12.9% | 236.9ms | 106.3ms | 10 |
| node | `manifest:transform` | 10 | 165.0ms | 188.4ms | +14.2% | 188.4ms | 26.2ms | 10 |
| web | `manifest:stage` | 33 | 20.9ms | 29.2ms | +39.7% | 29.2ms | 1.4ms | 33 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 23 | - | 4.6ms | - | 4.6ms | 0.4ms | 23 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2584 | 1301.6ms | 1350.7ms | +3.8% | 1350.7ms | 15.8ms | 24 |
| node | `route:module` | 2580 | 536.0ms | 652.6ms | +21.8% | 652.6ms | 8.6ms | 20 |
| web | `route:client-entry` | 2584 | 376.6ms | 370.8ms | -1.5% | 370.8ms | 6.2ms | 24 |
| node | `module:client-only-stub` | 10 | 203.2ms | 120.5ms | -40.7% | 120.5ms | 44.2ms | 10 |
| node | `manifest:transform` | 10 | 159.4ms | 168.9ms | +6.0% | 168.9ms | 25.3ms | 10 |
| web | `manifest:stage` | 34 | 22.4ms | 30.4ms | +35.7% | 30.4ms | 1.4ms | 34 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 24 | - | 5.2ms | - | 5.2ms | 0.4ms | 24 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 512.4ms | 442.5ms | -13.6% | 442.5ms | 11.8ms | 20 |
| node | `route:module` | 500 | 175.5ms | 139.8ms | -20.3% | 139.8ms | 3.5ms | 20 |
| web | `route:client-entry` | 500 | 102.2ms | 83.8ms | -18.0% | 83.8ms | 2.2ms | 20 |
| node | `module:client-only-stub` | 10 | 69.3ms | 73.3ms | +5.8% | 73.3ms | 14.5ms | 10 |
| node | `manifest:transform` | 10 | 52.5ms | 44.9ms | -14.5% | 44.9ms | 5.5ms | 10 |
| web | `manifest:stage` | 30 | 5.2ms | 7.9ms | +51.9% | 7.9ms | 0.4ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 4.1ms | - | 4.1ms | 0.4ms | 20 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 112.74s | 117.67s | +4.4% | 117.67s | - | 0.96x | - |
| complex app | 2 | 78.16s | 91.20s | +16.7% | 91.20s | - | 0.86x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 95.50s | 110.88s | +16.1% | 86.76s | 97.28s | 2.87s | 3.18s | 3.34s | 3.57s | +6.8% | 110.88s | - | 0.86x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28831111049)

