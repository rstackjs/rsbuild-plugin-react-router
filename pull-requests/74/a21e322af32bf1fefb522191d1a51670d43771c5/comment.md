<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `a21e322` against base `c93ec98`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 28.98s | 28.38s | -2.1% | 19.35s | 19.10s | -1.3% | 3.90s | 3.84s | -1.8% | 3.24s | 3.07s | -5.5% | 1.02x |
| Large app | 1 | 13.57s | 13.35s | -1.6% | 8.28s | 8.20s | -1.0% | 1.95s | 1.96s | +0.4% | 1.77s | 1.63s | -8.2% | 1.02x |
| Standard fixtures | 6 | 15.41s | 15.03s | -2.5% | 11.07s | 10.90s | -1.6% | 1.95s | 1.88s | -3.9% | 1.47s | 1.44s | -2.2% | 1.03x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.58s | 8.54s | -0.4% | 8.57s | 8.76s | 1.00x | 1540 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.16s | 3.90s | -6.4% | 3.96s | 4.25s | 1.07x | 627 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.62s | 5.39s | -4.0% | 5.42s | 5.66s | 1.04x | 800 MB |
| `synthetic-256-sourcemaps` | 10 | 2.15s | 2.07s | -3.9% | 2.08s | 2.27s | 1.04x | 451 MB |
| `synthetic-256-ssr-esm` | 10 | 2.00s | 1.96s | -2.2% | 1.96s | 2.09s | 1.02x | 410 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.41s | 2.35s | -2.5% | 2.37s | 2.59s | 1.03x | 444 MB |
| `synthetic-48-ssr-esm` | 10 | 1.35s | 1.33s | -1.3% | 1.36s | 1.63s | 1.01x | 323 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 13.57s | 13.35s | -1.6% | 8.28s | 8.20s | 1.95s | 1.96s | 1.77s | 1.63s | -8.2% | 13.42s | 13.69s | 1.02x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.51s | 4.44s | -1.7% | 3.21s | 3.18s | 0.53s | 0.53s | 0.51s | 0.51s | -0.6% | 4.44s | 4.56s | 1.02x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.55s | 4.47s | -1.7% | 3.25s | 3.19s | 0.58s | 0.53s | 0.48s | 0.50s | +5.0% | 4.46s | 4.50s | 1.02x | - |
| `synthetic-256-sourcemaps` | 10 | 1.97s | 1.92s | -2.3% | 1.47s | 1.47s | 0.25s | 0.22s | 0.15s | 0.13s | -16.1% | 1.92s | 1.99s | 1.02x | - |
| `synthetic-256-ssr-esm` | 10 | 1.74s | 1.68s | -3.6% | 1.26s | 1.22s | 0.24s | 0.24s | 0.13s | 0.13s | -2.2% | 1.67s | 1.72s | 1.04x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.75s | 1.67s | -4.9% | 1.24s | 1.23s | 0.23s | 0.23s | 0.15s | 0.13s | -16.9% | 1.68s | 1.77s | 1.05x | - |
| `synthetic-48-ssr-esm` | 10 | 0.89s | 0.85s | -4.3% | 0.64s | 0.61s | 0.12s | 0.13s | 0.05s | 0.05s | -0.8% | 0.86s | 0.90s | 1.05x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1697.7ms | 1640.2ms | -3.4% | 1640.2ms | 21.1ms | 10 |
| node | `route:module` | 1785 | 852.4ms | 860.6ms | +1.0% | 860.6ms | 6.8ms | 10 |
| web | `route:client-entry` | 1785 | 380.9ms | 432.1ms | +13.4% | 432.1ms | 10.3ms | 10 |
| node | `manifest:transform` | 5 | 109.0ms | 141.8ms | +30.1% | 141.8ms | 40.2ms | 5 |
| web | `manifest:stage` | 10 | 14.0ms | 13.7ms | -2.1% | 13.7ms | 1.8ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 134.8ms | - | 134.8ms | 14.3ms | 10 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2072.6ms | 1953.4ms | -5.8% | 1953.4ms | 11.5ms | 10 |
| node | `route:module` | 5130 | 942.6ms | 981.8ms | +4.2% | 981.8ms | 11.6ms | 10 |
| web | `route:client-entry` | 5130 | 637.7ms | 567.9ms | -10.9% | 567.9ms | 6.6ms | 10 |
| node | `module:client-only-stub` | 5 | 273.0ms | 282.0ms | +3.3% | 282.0ms | 128.1ms | 5 |
| node | `manifest:transform` | 5 | 217.2ms | 228.4ms | +5.2% | 228.4ms | 70.7ms | 5 |
| web | `manifest:stage` | 10 | 61.3ms | 45.1ms | -26.4% | 45.1ms | 6.5ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.0ms | - | 2.0ms | 0.3ms | 10 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2048.7ms | 2024.4ms | -1.2% | 2024.4ms | 13.1ms | 10 |
| node | `route:module` | 5130 | 910.1ms | 988.1ms | +8.6% | 988.1ms | 13.1ms | 10 |
| web | `route:client-entry` | 5130 | 623.2ms | 599.4ms | -3.8% | 599.4ms | 6.5ms | 10 |
| node | `manifest:transform` | 5 | 205.0ms | 220.2ms | +7.4% | 220.2ms | 57.5ms | 5 |
| node | `module:client-only-stub` | 5 | 84.7ms | 153.8ms | +81.6% | 153.8ms | 64.0ms | 5 |
| web | `manifest:stage` | 10 | 52.2ms | 46.3ms | -11.3% | 46.3ms | 7.8ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.0ms | - | 2.0ms | 0.3ms | 10 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1360.0ms | 1360.3ms | +0.0% | 1360.3ms | 23.2ms | 21 |
| node | `route:module` | 2580 | 577.7ms | 671.8ms | +16.3% | 671.8ms | 5.0ms | 20 |
| web | `route:client-entry` | 2581 | 387.6ms | 361.2ms | -6.8% | 361.2ms | 7.3ms | 21 |
| node | `manifest:transform` | 10 | 148.2ms | 140.4ms | -5.3% | 140.4ms | 24.0ms | 10 |
| node | `module:client-only-stub` | 10 | 122.5ms | 365.2ms | +198.1% | 365.2ms | 95.5ms | 10 |
| web | `manifest:stage` | 22 | 19.9ms | 20.0ms | +0.5% | 20.0ms | 1.3ms | 22 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 22 | - | 5.2ms | - | 5.2ms | 0.4ms | 22 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1309.6ms | 1305.8ms | -0.3% | 1305.8ms | 22.9ms | 21 |
| node | `route:module` | 2580 | 567.0ms | 606.5ms | +7.0% | 606.5ms | 7.4ms | 20 |
| web | `route:client-entry` | 2581 | 381.8ms | 352.7ms | -7.6% | 352.7ms | 5.3ms | 21 |
| node | `module:client-only-stub` | 10 | 209.9ms | 236.9ms | +12.9% | 236.9ms | 96.4ms | 10 |
| node | `manifest:transform` | 10 | 165.0ms | 137.7ms | -16.5% | 137.7ms | 19.9ms | 10 |
| web | `manifest:stage` | 22 | 20.9ms | 23.4ms | +12.0% | 23.4ms | 4.0ms | 22 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 22 | - | 4.3ms | - | 4.3ms | 0.3ms | 22 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1301.6ms | 1331.5ms | +2.3% | 1331.5ms | 13.8ms | 21 |
| node | `route:module` | 2580 | 536.0ms | 596.3ms | +11.3% | 596.3ms | 5.5ms | 20 |
| web | `route:client-entry` | 2581 | 376.6ms | 361.5ms | -4.0% | 361.5ms | 6.5ms | 21 |
| node | `module:client-only-stub` | 10 | 203.2ms | 223.7ms | +10.1% | 223.7ms | 101.0ms | 10 |
| node | `manifest:transform` | 10 | 159.4ms | 148.0ms | -7.2% | 148.0ms | 24.3ms | 10 |
| web | `manifest:stage` | 21 | 22.4ms | 20.4ms | -8.9% | 20.4ms | 1.4ms | 21 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 4.2ms | - | 4.2ms | 0.4ms | 21 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 512.4ms | 437.6ms | -14.6% | 437.6ms | 10.8ms | 20 |
| node | `route:module` | 500 | 175.5ms | 151.5ms | -13.7% | 151.5ms | 3.5ms | 20 |
| web | `route:client-entry` | 500 | 102.2ms | 80.4ms | -21.3% | 80.4ms | 2.0ms | 20 |
| node | `module:client-only-stub` | 10 | 69.3ms | 91.8ms | +32.5% | 91.8ms | 13.4ms | 10 |
| node | `manifest:transform` | 10 | 52.5ms | 44.5ms | -15.2% | 44.5ms | 5.9ms | 10 |
| web | `manifest:stage` | 20 | 5.2ms | 5.3ms | +1.9% | 5.3ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 4.0ms | - | 4.0ms | 0.3ms | 20 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 112.74s | 113.63s | +0.8% | 113.63s | - | 0.99x | - |
| complex app | 2 | 78.16s | 79.01s | +1.1% | 79.01s | - | 0.99x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 95.50s | 95.01s | -0.5% | 86.76s | 86.02s | 2.87s | 3.07s | 3.34s | 3.25s | -2.6% | 95.01s | - | 1.01x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28835292125)

