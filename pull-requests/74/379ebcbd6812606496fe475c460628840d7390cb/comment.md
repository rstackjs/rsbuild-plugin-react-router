<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `379ebcb` against base `9018ef6`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 30.03s | 33.98s | +13.2% | 19.97s | 24.16s | +21.0% | 4.13s | 3.94s | -4.6% | 3.34s | 3.34s | +0.1% | 0.88x |
| Large app | 1 | 14.13s | 16.32s | +15.5% | 8.54s | 10.83s | +26.8% | 2.07s | 1.99s | -3.7% | 1.85s | 1.88s | +1.6% | 0.87x |
| Standard fixtures | 6 | 15.90s | 17.66s | +11.1% | 11.44s | 13.34s | +16.6% | 2.06s | 1.95s | -5.5% | 1.49s | 1.46s | -1.9% | 0.90x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.99s | 10.52s | +16.9% | 10.52s | 10.61s | 0.86x | 1582 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.27s | 4.45s | +4.2% | 4.45s | 4.66s | 0.96x | 648 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.69s | 6.27s | +10.1% | 6.31s | 6.42s | 0.91x | 828 MB |
| `synthetic-256-sourcemaps` | 10 | 2.28s | 2.31s | +1.1% | 2.30s | 2.42s | 0.99x | 453 MB |
| `synthetic-256-ssr-esm` | 10 | 2.10s | 2.18s | +3.7% | 2.18s | 2.34s | 0.96x | 424 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.52s | 2.70s | +7.4% | 2.72s | 2.88s | 0.93x | 486 MB |
| `synthetic-48-ssr-esm` | 10 | 1.39s | 1.39s | +0.4% | 1.42s | 1.66s | 1.00x | 321 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 14.13s | 16.32s | +15.5% | 8.54s | 10.83s | 2.07s | 1.99s | 1.85s | 1.88s | +1.6% | 16.33s | 16.55s | 0.87x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.66s | 5.27s | +13.2% | 3.34s | 3.97s | 0.60s | 0.54s | 0.48s | 0.50s | +5.1% | 5.25s | 5.29s | 0.88x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.70s | 5.32s | +13.2% | 3.35s | 3.99s | 0.60s | 0.56s | 0.50s | 0.53s | +5.5% | 5.31s | 5.41s | 0.88x | - |
| `synthetic-256-sourcemaps` | 10 | 2.06s | 2.24s | +8.5% | 1.52s | 1.76s | 0.26s | 0.24s | 0.15s | 0.13s | -17.3% | 2.23s | 2.28s | 0.92x | - |
| `synthetic-256-ssr-esm` | 10 | 1.78s | 1.92s | +8.3% | 1.28s | 1.46s | 0.24s | 0.24s | 0.15s | 0.13s | -17.4% | 1.94s | 2.00s | 0.92x | - |
| `synthetic-256-ssr-esm-split` | 10 | 1.78s | 1.96s | +10.2% | 1.28s | 1.47s | 0.25s | 0.24s | 0.15s | 0.13s | -16.8% | 1.95s | 2.05s | 0.91x | - |
| `synthetic-48-ssr-esm` | 10 | 0.92s | 0.94s | +2.1% | 0.66s | 0.69s | 0.13s | 0.13s | 0.05s | 0.05s | -1.7% | 0.94s | 0.97s | 0.98x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 1715.8ms | 1509.5ms | -12.0% | 1509.5ms | 13.2ms | 10 |
| node | `route:module` | 1785 | 954.8ms | 769.5ms | -19.4% | 769.5ms | 12.2ms | 10 |
| web | `route:client-entry` | 1785 | 387.8ms | 439.5ms | +13.3% | 439.5ms | 10.0ms | 10 |
| node | `manifest:transform` | 5 | 104.3ms | 109.9ms | +5.4% | 109.9ms | 33.0ms | 5 |
| web | `manifest:stage` | 10 | 14.3ms | 15.2ms | +6.3% | 15.2ms | 2.1ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 138.1ms | - | 138.1ms | 15.0ms | 10 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2029.8ms | 1810.5ms | -10.8% | 1810.5ms | 8.3ms | 10 |
| node | `route:module` | 5130 | 929.8ms | 901.3ms | -3.1% | 901.3ms | 9.2ms | 10 |
| web | `route:client-entry` | 5130 | 635.7ms | 645.5ms | +1.5% | 645.5ms | 7.7ms | 10 |
| node | `manifest:transform` | 5 | 205.6ms | 214.0ms | +4.1% | 214.0ms | 54.2ms | 5 |
| node | `module:client-only-stub` | 5 | 81.0ms | 258.6ms | +219.3% | 258.6ms | 65.8ms | 5 |
| web | `manifest:stage` | 10 | 55.1ms | 46.6ms | -15.4% | 46.6ms | 8.0ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.1ms | - | 2.1ms | 0.4ms | 10 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 2129.9ms | 1809.0ms | -15.1% | 1809.0ms | 7.7ms | 10 |
| node | `route:module` | 5130 | 978.9ms | 940.8ms | -3.9% | 940.8ms | 12.5ms | 10 |
| web | `route:client-entry` | 5130 | 647.6ms | 621.2ms | -4.1% | 621.2ms | 6.9ms | 10 |
| node | `module:client-only-stub` | 5 | 442.0ms | 120.8ms | -72.7% | 120.8ms | 72.4ms | 5 |
| node | `manifest:transform` | 5 | 215.7ms | 201.0ms | -6.8% | 201.0ms | 44.4ms | 5 |
| web | `manifest:stage` | 10 | 54.8ms | 45.3ms | -17.3% | 45.3ms | 6.6ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.6ms | +20.0% | 0.6ms | 0.2ms | 5 |
| node | `assets:relocate-ssr-only` | 10 | - | 2.1ms | - | 2.1ms | 0.4ms | 10 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 1441.1ms | 1316.0ms | -8.7% | 1316.0ms | 16.0ms | 20 |
| node | `route:module` | 2580 | 577.7ms | 637.9ms | +10.4% | 637.9ms | 5.7ms | 20 |
| web | `route:client-entry` | 2580 | 409.8ms | 395.9ms | -3.4% | 395.9ms | 5.7ms | 20 |
| node | `manifest:transform` | 10 | 159.7ms | 168.0ms | +5.2% | 168.0ms | 22.7ms | 10 |
| node | `module:client-only-stub` | 10 | 91.2ms | 29.9ms | -67.2% | 29.9ms | 7.0ms | 10 |
| web | `manifest:stage` | 20 | 22.4ms | 22.4ms | -0.0% | 22.4ms | 3.5ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 5.7ms | - | 5.7ms | 0.4ms | 20 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2583 | 1311.8ms | 1226.3ms | -6.5% | 1226.3ms | 12.1ms | 23 |
| node | `route:module` | 2580 | 533.9ms | 611.5ms | +14.5% | 611.5ms | 8.4ms | 20 |
| web | `route:client-entry` | 2583 | 394.4ms | 403.6ms | +2.3% | 403.6ms | 5.6ms | 23 |
| node | `module:client-only-stub` | 10 | 247.6ms | 34.8ms | -85.9% | 34.8ms | 12.3ms | 10 |
| node | `manifest:transform` | 10 | 165.9ms | 169.2ms | +2.0% | 169.2ms | 23.3ms | 10 |
| web | `manifest:stage` | 23 | 21.2ms | 21.7ms | +2.4% | 21.7ms | 1.4ms | 23 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 23 | - | 4.3ms | - | 4.3ms | 0.3ms | 23 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2583 | 1335.5ms | 1244.0ms | -6.9% | 1244.0ms | 11.8ms | 23 |
| node | `route:module` | 2580 | 557.1ms | 590.0ms | +5.9% | 590.0ms | 7.9ms | 20 |
| web | `route:client-entry` | 2583 | 394.8ms | 407.5ms | +3.2% | 407.5ms | 5.6ms | 23 |
| node | `manifest:transform` | 10 | 167.8ms | 169.8ms | +1.2% | 169.8ms | 26.1ms | 10 |
| node | `module:client-only-stub` | 10 | 101.3ms | 24.1ms | -76.2% | 24.1ms | 3.3ms | 10 |
| web | `manifest:stage` | 24 | 20.6ms | 22.5ms | +9.2% | 22.5ms | 1.4ms | 24 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 24 | - | 4.6ms | - | 4.6ms | 0.4ms | 24 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 498.6ms | 372.9ms | -25.2% | 372.9ms | 7.5ms | 20 |
| node | `route:module` | 500 | 174.5ms | 145.0ms | -16.9% | 145.0ms | 0.7ms | 20 |
| web | `route:client-entry` | 500 | 108.1ms | 91.1ms | -15.7% | 91.1ms | 2.0ms | 20 |
| node | `module:client-only-stub` | 10 | 79.6ms | 91.5ms | +14.9% | 91.5ms | 17.0ms | 10 |
| node | `manifest:transform` | 10 | 53.8ms | 49.2ms | -8.6% | 49.2ms | 6.3ms | 10 |
| web | `manifest:stage` | 20 | 5.3ms | 5.3ms | 0.0% | 5.3ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |
| node | `assets:relocate-ssr-only` | 20 | - | 4.0ms | - | 4.0ms | 0.3ms | 20 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 117.96s | 126.34s | +7.1% | 126.34s | - | 0.93x | - |
| complex app | 2 | 86.69s | 98.00s | +13.0% | 98.00s | - | 0.88x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 99.83s | 103.20s | +3.4% | 90.88s | 94.04s | 2.93s | 3.08s | 3.40s | 3.46s | +1.6% | 103.20s | - | 0.97x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28960205527)

