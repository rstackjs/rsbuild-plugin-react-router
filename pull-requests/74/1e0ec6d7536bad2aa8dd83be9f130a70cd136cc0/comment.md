<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `1e0ec6d` against base `96ed301`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 27.49s | 39.09s | +42.2% | 18.33s | 23.90s | +30.4% | 3.71s | 3.80s | +2.4% | 3.11s | 3.23s | +4.0% | 0.70x |
| Large app | 1 | 12.81s | 18.06s | +40.9% | 7.83s | 10.66s | +36.2% | 1.84s | 1.93s | +4.8% | 1.65s | 1.80s | +9.1% | 0.71x |
| Standard fixtures | 6 | 14.68s | 21.04s | +43.3% | 10.50s | 13.24s | +26.1% | 1.87s | 1.87s | +0.0% | 1.46s | 1.44s | -1.7% | 0.70x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.32s | 10.37s | +24.6% | 10.34s | 10.40s | 0.80x | 1593 MB |
| `synthetic-1024-ssr-esm` | 5 | 3.85s | 4.38s | +13.7% | 4.44s | 4.69s | 0.88x | 651 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.17s | 6.31s | +22.1% | 6.38s | 6.71s | 0.82x | 866 MB |
| `synthetic-256-sourcemaps` | 10 | 2.08s | 2.28s | +9.3% | 2.28s | 2.47s | 0.91x | 459 MB |
| `synthetic-256-ssr-esm` | 10 | 1.96s | 2.13s | +8.6% | 2.13s | 2.27s | 0.92x | 423 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.32s | 2.66s | +14.7% | 2.67s | 2.85s | 0.87x | 490 MB |
| `synthetic-48-ssr-esm` | 10 | 1.31s | 1.37s | +5.2% | 1.40s | 1.64s | 0.95x | 323 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 12.81s | 18.06s | +40.9% | 7.83s | 10.66s | 1.84s | 1.93s | 1.65s | 1.80s | +9.1% | 18.00s | 18.11s | 0.71x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.30s | 6.52s | +51.6% | 3.04s | 4.00s | 0.56s | 0.54s | 0.48s | 0.50s | +5.4% | 6.58s | 6.95s | 0.66x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.33s | 6.52s | +50.4% | 3.08s | 3.99s | 0.52s | 0.53s | 0.48s | 0.50s | +5.5% | 6.58s | 6.97s | 0.66x | - |
| `synthetic-256-sourcemaps` | 10 | 1.88s | 2.65s | +40.7% | 1.39s | 1.70s | 0.24s | 0.23s | 0.15s | 0.13s | -16.3% | 2.65s | 2.74s | 0.71x | - |
| `synthetic-256-ssr-esm` | 10 | 1.66s | 2.18s | +31.8% | 1.19s | 1.45s | 0.22s | 0.23s | 0.15s | 0.13s | -16.9% | 2.19s | 2.27s | 0.76x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.64s | 2.16s | +31.7% | 1.18s | 1.44s | 0.22s | 0.22s | 0.15s | 0.13s | -17.1% | 2.16s | 2.29s | 0.76x | - |
| `synthetic-48-ssr-esm` | 10 | 0.86s | 1.00s | +15.7% | 0.62s | 0.67s | 0.12s | 0.13s | 0.05s | 0.05s | -0.3% | 1.00s | 1.02s | 0.86x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1700.9ms | 1546.0ms | -9.1% | 1546.0ms | 25.1ms | 10 |
| node | `route:module` | 1785 | 908.6ms | 757.4ms | -16.6% | 757.4ms | 11.1ms | 10 |
| web | `route:client-entry` | 1785 | 367.7ms | 459.5ms | +25.0% | 459.5ms | 9.6ms | 10 |
| node | `manifest:transform` | 5 | 114.7ms | 118.9ms | +3.7% | 118.9ms | 29.2ms | 5 |
| web | `manifest:stage` | 15 | 18.5ms | 19.6ms | +5.9% | 19.6ms | 1.9ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 148.5ms | - | 148.5ms | 19.5ms | 10 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 1996.4ms | 1802.7ms | -9.7% | 1802.7ms | 9.9ms | 10 |
| node | `route:module` | 5130 | 892.2ms | 936.7ms | +5.0% | 936.7ms | 9.5ms | 10 |
| web | `route:client-entry` | 5130 | 637.5ms | 616.4ms | -3.3% | 616.4ms | 7.7ms | 10 |
| node | `manifest:transform` | 5 | 203.4ms | 205.9ms | +1.2% | 205.9ms | 46.4ms | 5 |
| node | `module:client-only-stub` | 5 | 78.1ms | 109.1ms | +39.7% | 109.1ms | 57.9ms | 5 |
| web | `manifest:stage` | 15 | 60.1ms | 59.2ms | -1.5% | 59.2ms | 6.5ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.3ms | - | 2.3ms | 0.4ms | 10 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 1959.4ms | 1814.2ms | -7.4% | 1814.2ms | 15.0ms | 10 |
| node | `route:module` | 5130 | 940.9ms | 916.4ms | -2.6% | 916.4ms | 10.4ms | 10 |
| web | `route:client-entry` | 5130 | 592.1ms | 631.0ms | +6.6% | 631.0ms | 8.8ms | 10 |
| node | `manifest:transform` | 5 | 194.2ms | 205.1ms | +5.6% | 205.1ms | 43.5ms | 5 |
| node | `module:client-only-stub` | 5 | 108.3ms | 51.6ms | -52.4% | 51.6ms | 17.6ms | 5 |
| web | `manifest:stage` | 15 | 66.5ms | 57.4ms | -13.7% | 57.4ms | 6.5ms | 15 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.1ms | - | 2.1ms | 0.4ms | 10 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 1357.2ms | 1336.7ms | -1.5% | 1336.7ms | 15.9ms | 22 |
| node | `route:module` | 2580 | 577.7ms | 619.6ms | +7.3% | 619.6ms | 4.7ms | 20 |
| web | `route:client-entry` | 2582 | 395.0ms | 417.8ms | +5.8% | 417.8ms | 5.3ms | 22 |
| node | `module:client-only-stub` | 10 | 159.2ms | 26.4ms | -83.4% | 26.4ms | 8.1ms | 10 |
| node | `manifest:transform` | 10 | 152.4ms | 173.8ms | +14.0% | 173.8ms | 21.7ms | 10 |
| web | `manifest:stage` | 32 | 21.7ms | 27.3ms | +25.8% | 27.3ms | 1.3ms | 32 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 22 | - | 6.2ms | - | 6.2ms | 0.5ms | 22 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2583 | 1334.6ms | 1270.2ms | -4.8% | 1270.2ms | 11.0ms | 23 |
| node | `route:module` | 2581 | 538.2ms | 609.1ms | +13.2% | 609.1ms | 7.9ms | 21 |
| web | `route:client-entry` | 2583 | 385.7ms | 392.7ms | +1.8% | 392.7ms | 5.1ms | 23 |
| node | `module:client-only-stub` | 10 | 174.8ms | 24.8ms | -85.8% | 24.8ms | 5.7ms | 10 |
| node | `manifest:transform` | 10 | 158.9ms | 172.9ms | +8.8% | 172.9ms | 24.9ms | 10 |
| web | `manifest:stage` | 33 | 21.2ms | 27.5ms | +29.7% | 27.5ms | 1.3ms | 33 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 24 | - | 4.7ms | - | 4.7ms | 0.4ms | 24 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2581 | 1298.4ms | 1232.3ms | -5.1% | 1232.3ms | 11.0ms | 21 |
| node | `route:module` | 2580 | 547.3ms | 599.2ms | +9.5% | 599.2ms | 6.9ms | 20 |
| web | `route:client-entry` | 2581 | 380.4ms | 399.4ms | +5.0% | 399.4ms | 5.4ms | 21 |
| node | `module:client-only-stub` | 10 | 312.3ms | 22.6ms | -92.8% | 22.6ms | 3.1ms | 10 |
| node | `manifest:transform` | 10 | 162.2ms | 175.7ms | +8.3% | 175.7ms | 21.8ms | 10 |
| web | `manifest:stage` | 31 | 20.8ms | 26.7ms | +28.4% | 26.7ms | 1.3ms | 31 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 21 | - | 4.2ms | - | 4.2ms | 0.4ms | 21 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 483.5ms | 365.5ms | -24.4% | 365.5ms | 8.5ms | 20 |
| node | `route:module` | 500 | 166.6ms | 141.6ms | -15.0% | 141.6ms | 0.7ms | 20 |
| web | `route:client-entry` | 500 | 112.7ms | 85.6ms | -24.0% | 85.6ms | 0.9ms | 20 |
| node | `module:client-only-stub` | 10 | 78.4ms | 81.9ms | +4.5% | 81.9ms | 12.9ms | 10 |
| node | `manifest:transform` | 10 | 50.8ms | 45.9ms | -9.6% | 45.9ms | 6.1ms | 10 |
| web | `manifest:stage` | 30 | 5.4ms | 7.9ms | +46.3% | 7.9ms | 0.4ms | 30 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 4.4ms | - | 4.4ms | 0.4ms | 20 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 109.41s | 118.87s | +8.6% | 118.87s | - | 0.92x | - |
| complex app | 2 | 76.18s | 85.55s | +12.3% | 85.55s | - | 0.89x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 92.22s | 101.57s | +10.1% | 83.20s | 90.75s | 2.66s | 2.93s | 3.09s | 3.25s | +5.3% | 101.57s | - | 0.91x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/29068099053)

