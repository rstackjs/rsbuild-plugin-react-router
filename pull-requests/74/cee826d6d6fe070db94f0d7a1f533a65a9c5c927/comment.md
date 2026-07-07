<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `cee826d` against base `c93ec98`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 28.98s | 29.77s | +2.7% | 19.35s | 20.02s | +3.4% | 3.90s | 3.97s | +1.7% | 3.24s | 3.28s | +1.0% | 0.97x |
| Large app | 1 | 13.57s | 14.02s | +3.3% | 8.28s | 8.57s | +3.4% | 1.95s | 1.99s | +2.1% | 1.77s | 1.81s | +2.1% | 0.97x |
| Standard fixtures | 6 | 15.41s | 15.75s | +2.2% | 11.07s | 11.45s | +3.4% | 1.95s | 1.98s | +1.2% | 1.47s | 1.47s | -0.4% | 0.98x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.58s | 8.91s | +3.8% | 8.83s | 8.97s | 0.96x | 1519 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.16s | 3.97s | -4.5% | 4.05s | 4.36s | 1.05x | 618 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.62s | 5.57s | -0.8% | 5.50s | 5.62s | 1.01x | 811 MB |
| `synthetic-256-sourcemaps` | 10 | 2.15s | 2.10s | -2.1% | 2.12s | 2.31s | 1.02x | 447 MB |
| `synthetic-256-ssr-esm` | 10 | 2.00s | 2.02s | +1.0% | 2.05s | 2.14s | 0.99x | 396 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.41s | 2.40s | -0.1% | 2.42s | 2.62s | 1.00x | 456 MB |
| `synthetic-48-ssr-esm` | 10 | 1.35s | 1.36s | +0.6% | 1.38s | 1.62s | 0.99x | 320 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.57s | 14.02s | +3.3% | 8.28s | 8.57s | 1.95s | 1.99s | 1.77s | 1.81s | +2.1% | 14.19s | 15.21s | 0.97x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.51s | 4.67s | +3.3% | 3.21s | 3.36s | 0.53s | 0.55s | 0.51s | 0.53s | +3.9% | 4.67s | 4.73s | 0.97x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.55s | 4.58s | +0.7% | 3.25s | 3.29s | 0.58s | 0.57s | 0.48s | 0.51s | +5.4% | 4.68s | 5.07s | 0.99x | - |
| `synthetic-256-sourcemaps` | 10 | 1.97s | 2.04s | +3.9% | 1.47s | 1.55s | 0.25s | 0.24s | 0.15s | 0.13s | -16.5% | 2.05s | 2.13s | 0.96x | - |
| `synthetic-256-ssr-esm` | 10 | 1.74s | 1.77s | +1.5% | 1.26s | 1.29s | 0.24s | 0.24s | 0.13s | 0.13s | -1.3% | 1.77s | 1.84s | 0.98x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.75s | 1.79s | +2.2% | 1.24s | 1.30s | 0.23s | 0.24s | 0.15s | 0.13s | -16.5% | 1.79s | 1.88s | 0.98x | - |
| `synthetic-48-ssr-esm` | 10 | 0.89s | 0.90s | +1.2% | 0.64s | 0.65s | 0.12s | 0.13s | 0.05s | 0.05s | +0.2% | 0.91s | 0.94s | 0.99x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1786 | 1697.7ms | 1733.0ms | +2.1% | 1733.0ms | 19.8ms | 11 |
| node | `route:module` | 1785 | 852.4ms | 937.4ms | +10.0% | 937.4ms | 11.4ms | 10 |
| web | `route:client-entry` | 1786 | 380.9ms | 438.8ms | +15.2% | 438.8ms | 7.9ms | 11 |
| node | `manifest:transform` | 5 | 109.0ms | 186.7ms | +71.3% | 186.7ms | 63.7ms | 5 |
| web | `manifest:stage` | 11 | 14.0ms | 15.3ms | +9.3% | 15.3ms | 1.9ms | 11 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 11 | - | 194.1ms | - | 194.1ms | 48.7ms | 11 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2072.6ms | 2032.8ms | -1.9% | 2032.8ms | 12.1ms | 10 |
| node | `route:module` | 5130 | 942.6ms | 1039.9ms | +10.3% | 1039.9ms | 12.2ms | 10 |
| web | `route:client-entry` | 5130 | 637.7ms | 617.2ms | -3.2% | 617.2ms | 8.4ms | 10 |
| node | `module:client-only-stub` | 5 | 273.0ms | 269.9ms | -1.1% | 269.9ms | 175.2ms | 5 |
| node | `manifest:transform` | 5 | 217.2ms | 231.9ms | +6.8% | 231.9ms | 57.1ms | 5 |
| web | `manifest:stage` | 10 | 61.3ms | 47.5ms | -22.5% | 47.5ms | 8.4ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.0ms | - | 2.0ms | 0.3ms | 10 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2048.7ms | 2043.5ms | -0.3% | 2043.5ms | 11.6ms | 10 |
| node | `route:module` | 5130 | 910.1ms | 999.6ms | +9.8% | 999.6ms | 14.6ms | 10 |
| web | `route:client-entry` | 5130 | 623.2ms | 591.9ms | -5.0% | 591.9ms | 6.9ms | 10 |
| node | `manifest:transform` | 5 | 205.0ms | 242.1ms | +18.1% | 242.1ms | 60.6ms | 5 |
| node | `module:client-only-stub` | 5 | 84.7ms | 389.5ms | +359.9% | 389.5ms | 153.6ms | 5 |
| web | `manifest:stage` | 10 | 52.2ms | 45.8ms | -12.3% | 45.8ms | 6.7ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.0ms | - | 2.0ms | 0.3ms | 10 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1360.0ms | 1427.2ms | +4.9% | 1427.2ms | 20.8ms | 21 |
| node | `route:module` | 2580 | 577.7ms | 667.9ms | +15.6% | 667.9ms | 4.4ms | 20 |
| web | `route:client-entry` | 2581 | 387.6ms | 398.8ms | +2.9% | 398.8ms | 6.6ms | 21 |
| node | `manifest:transform` | 10 | 148.2ms | 168.6ms | +13.8% | 168.6ms | 25.2ms | 10 |
| node | `module:client-only-stub` | 10 | 122.5ms | 248.4ms | +102.8% | 248.4ms | 159.8ms | 10 |
| web | `manifest:stage` | 23 | 19.9ms | 21.5ms | +8.0% | 21.5ms | 1.4ms | 23 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 23 | - | 5.9ms | - | 5.9ms | 0.4ms | 23 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1309.6ms | 1385.6ms | +5.8% | 1385.6ms | 17.6ms | 22 |
| node | `route:module` | 2580 | 567.0ms | 611.4ms | +7.8% | 611.4ms | 6.3ms | 20 |
| web | `route:client-entry` | 2582 | 381.8ms | 361.9ms | -5.2% | 361.9ms | 5.8ms | 22 |
| node | `module:client-only-stub` | 10 | 209.9ms | 165.0ms | -21.4% | 165.0ms | 75.7ms | 10 |
| node | `manifest:transform` | 10 | 165.0ms | 168.1ms | +1.9% | 168.1ms | 24.7ms | 10 |
| web | `manifest:stage` | 23 | 20.9ms | 22.1ms | +5.7% | 22.1ms | 1.4ms | 23 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 23 | - | 4.4ms | - | 4.4ms | 0.4ms | 23 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1301.6ms | 1356.5ms | +4.2% | 1356.5ms | 15.9ms | 22 |
| node | `route:module` | 2580 | 536.0ms | 618.9ms | +15.5% | 618.9ms | 7.9ms | 20 |
| web | `route:client-entry` | 2582 | 376.6ms | 396.8ms | +5.4% | 396.8ms | 6.0ms | 22 |
| node | `module:client-only-stub` | 10 | 203.2ms | 166.9ms | -17.9% | 166.9ms | 93.8ms | 10 |
| node | `manifest:transform` | 10 | 159.4ms | 165.5ms | +3.8% | 165.5ms | 22.7ms | 10 |
| web | `manifest:stage` | 23 | 22.4ms | 26.0ms | +16.1% | 26.0ms | 4.8ms | 23 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 23 | - | 4.7ms | - | 4.7ms | 0.4ms | 23 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 512.4ms | 421.9ms | -17.7% | 421.9ms | 12.2ms | 20 |
| node | `route:module` | 500 | 175.5ms | 141.3ms | -19.5% | 141.3ms | 0.7ms | 20 |
| web | `route:client-entry` | 500 | 102.2ms | 86.0ms | -15.9% | 86.0ms | 2.3ms | 20 |
| node | `module:client-only-stub` | 10 | 69.3ms | 87.1ms | +25.7% | 87.1ms | 13.5ms | 10 |
| node | `manifest:transform` | 10 | 52.5ms | 48.2ms | -8.2% | 48.2ms | 6.2ms | 10 |
| web | `manifest:stage` | 20 | 5.2ms | 5.8ms | +11.5% | 5.8ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 4.1ms | - | 4.1ms | 0.3ms | 20 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 112.74s | 117.15s | +3.9% | 117.15s | - | 0.96x | - |
| complex app | 2 | 78.16s | 79.57s | +1.8% | 79.57s | - | 0.98x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 95.50s | 95.29s | -0.2% | 86.76s | 86.66s | 2.87s | 2.89s | 3.34s | 3.17s | -5.1% | 95.29s | - | 1.00x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28833686959)

