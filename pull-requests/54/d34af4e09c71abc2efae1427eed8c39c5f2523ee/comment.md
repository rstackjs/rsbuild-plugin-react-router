<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `d34af4e` against base `7a55f78`.

### Dev Rollup

| Group | Fixtures | Base total | Head total | Delta | Base ready | Head ready | Ready delta | Base routes | Head routes | Route delta | Base update/HMR | Head update/HMR | Update delta | Speedup |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All dev fixtures | 7 | 32.07s | 29.27s | -8.7% | 22.31s | 19.55s | -12.4% | 4.22s | 4.05s | -4.0% | 3.04s | 3.26s | +7.1% | 1.10x |
| Large app | 1 | 15.00s | 13.83s | -7.8% | 9.85s | 8.42s | -14.5% | 1.99s | 2.01s | +0.8% | 1.62s | 1.80s | +10.9% | 1.08x |
| Standard fixtures | 6 | 17.06s | 15.44s | -9.5% | 12.47s | 11.13s | -10.7% | 2.23s | 2.04s | -8.3% | 1.42s | 1.46s | +2.8% | 1.11x |

### Production Build Benchmarks

Rendered 7 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 8.97s | 8.79s | -2.0% | 8.84s | 9.10s | 1.02x | 1524 MB |
| `synthetic-1024-ssr-esm` | 5 | 4.36s | 4.14s | -4.9% | 4.18s | 4.33s | 1.05x | 635 MB |
| `synthetic-1024-ssr-esm-split` | 5 | 5.76s | 5.55s | -3.6% | 5.62s | 5.92s | 1.04x | 804 MB |
| `synthetic-256-sourcemaps` | 10 | 2.39s | 2.13s | -10.8% | 2.15s | 2.32s | 1.12x | 433 MB |
| `synthetic-256-ssr-esm` | 10 | 2.25s | 2.01s | -10.7% | 2.02s | 2.15s | 1.12x | 398 MB |
| `synthetic-256-ssr-esm-split` | 10 | 2.63s | 2.46s | -6.6% | 2.45s | 2.61s | 1.07x | 442 MB |
| `synthetic-48-ssr-esm` | 10 | 1.60s | 1.34s | -16.3% | 1.36s | 1.59s | 1.19x | 313 MB |

### full Dev Fixture Summary

Rendered 7 dev benchmark fixtures from the `full` profile.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `large-355-ssr-esm` | 5 | 15.00s | 13.83s | -7.8% | 9.85s | 8.42s | 1.99s | 2.01s | 1.62s | 1.80s | +10.9% | 14.08s | 15.01s | 1.08x | - |
| `synthetic-1024-ssr-esm` | 5 | 4.84s | 4.61s | -4.7% | 3.59s | 3.29s | 0.54s | 0.60s | 0.48s | 0.50s | +5.0% | 4.60s | 4.63s | 1.05x | - |
| `synthetic-1024-ssr-esm-split` | 5 | 4.76s | 4.53s | -4.7% | 3.52s | 3.25s | 0.54s | 0.58s | 0.45s | 0.50s | +10.7% | 4.51s | 4.56s | 1.05x | - |
| `synthetic-256-sourcemaps` | 10 | 2.31s | 1.96s | -15.1% | 1.73s | 1.47s | 0.29s | 0.23s | 0.13s | 0.15s | +15.5% | 1.96s | 1.99s | 1.18x | - |
| `synthetic-256-ssr-esm` | 10 | 2.05s | 1.72s | -15.9% | 1.44s | 1.24s | 0.35s | 0.25s | 0.13s | 0.13s | -1.3% | 1.72s | 1.77s | 1.19x | - |
| `synthetic-256-ssr-esm-split` | 10 | 2.04s | 1.73s | -15.0% | 1.40s | 1.24s | 0.35s | 0.25s | 0.15s | 0.13s | -17.3% | 1.73s | 1.85s | 1.18x | - |
| `synthetic-48-ssr-esm` | 10 | 1.07s | 0.88s | -18.0% | 0.78s | 0.62s | 0.15s | 0.13s | 0.08s | 0.05s | -33.3% | 0.88s | 0.91s | 1.22x | - |

#### large-355-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 1785 | 479700.2ms | 1767.0ms | -99.6% | 1767.0ms | 26.6ms | 10 |
| web | `route:client-entry` | 1785 | 147365.0ms | 368.0ms | -99.8% | 368.0ms | 5.6ms | 10 |
| node | `route:module` | 1785 | 136436.5ms | 884.1ms | -99.4% | 884.1ms | 6.0ms | 10 |
| node | `manifest:transform` | 5 | 235.9ms | 147.3ms | -37.6% | 147.3ms | 57.6ms | 5 |
| web | `manifest:stage` | 10 | 16.1ms | 14.5ms | -9.9% | 14.5ms | 2.1ms | 10 |
| web | `manifest:transform` | 5 | 0.6ms | 0.5ms | -16.7% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 1283358.2ms | 2055.8ms | -99.8% | 2055.8ms | 23.2ms | 10 |
| web | `route:client-entry` | 5130 | 944556.5ms | 646.1ms | -99.9% | 646.1ms | 7.2ms | 10 |
| node | `route:module` | 5130 | 641014.6ms | 900.9ms | -99.9% | 900.9ms | 5.5ms | 10 |
| node | `module:client-only-stub` | 5 | 357.8ms | 95.3ms | -73.4% | 95.3ms | 37.4ms | 5 |
| node | `manifest:transform` | 5 | 275.6ms | 213.5ms | -22.5% | 213.5ms | 51.8ms | 5 |
| web | `manifest:stage` | 10 | 57.4ms | 55.7ms | -3.0% | 55.7ms | 7.1ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-1024-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 5130 | 991647.4ms | 1985.4ms | -99.8% | 1985.4ms | 16.2ms | 10 |
| web | `route:client-entry` | 5130 | 887287.7ms | 621.9ms | -99.9% | 621.9ms | 18.6ms | 10 |
| node | `route:module` | 5130 | 843108.7ms | 981.5ms | -99.9% | 981.5ms | 11.0ms | 10 |
| node | `module:client-only-stub` | 5 | 691.3ms | 204.2ms | -70.5% | 204.2ms | 116.2ms | 5 |
| node | `manifest:transform` | 5 | 270.9ms | 204.6ms | -24.5% | 204.6ms | 43.4ms | 5 |
| web | `manifest:stage` | 10 | 64.6ms | 54.1ms | -16.3% | 54.1ms | 8.5ms | 10 |
| web | `manifest:transform` | 5 | 0.5ms | 0.5ms | 0.0% | 0.5ms | 0.1ms | 5 |

#### synthetic-256-sourcemaps Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 287443.6ms | 1391.0ms | -99.5% | 1391.0ms | 18.9ms | 20 |
| node | `route:module` | 2580 | 163636.2ms | 626.6ms | -99.6% | 626.6ms | 4.4ms | 20 |
| web | `route:client-entry` | 2580 | 112222.5ms | 390.8ms | -99.7% | 390.8ms | 4.9ms | 20 |
| node | `module:client-only-stub` | 10 | 414.7ms | 295.4ms | -28.8% | 295.4ms | 94.5ms | 10 |
| node | `manifest:transform` | 10 | 296.5ms | 164.3ms | -44.6% | 164.3ms | 24.5ms | 10 |
| web | `manifest:stage` | 20 | 29.3ms | 21.0ms | -28.3% | 21.0ms | 1.5ms | 20 |
| web | `manifest:transform` | 10 | 1.2ms | 1.0ms | -16.7% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2580 | 239046.1ms | 1358.2ms | -99.4% | 1358.2ms | 12.7ms | 20 |
| node | `route:module` | 2580 | 131802.5ms | 547.2ms | -99.6% | 547.2ms | 4.6ms | 20 |
| web | `route:client-entry` | 2580 | 96728.8ms | 397.9ms | -99.6% | 397.9ms | 5.8ms | 20 |
| node | `manifest:transform` | 10 | 339.1ms | 147.7ms | -56.4% | 147.7ms | 17.8ms | 10 |
| node | `module:client-only-stub` | 10 | 329.1ms | 69.2ms | -79.0% | 69.2ms | 21.0ms | 10 |
| web | `manifest:stage` | 20 | 26.3ms | 20.8ms | -20.9% | 20.8ms | 1.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

#### synthetic-256-ssr-esm-split Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 2582 | 244138.1ms | 1429.4ms | -99.4% | 1429.4ms | 20.9ms | 22 |
| node | `route:module` | 2580 | 119456.8ms | 556.0ms | -99.5% | 556.0ms | 4.8ms | 20 |
| web | `route:client-entry` | 2582 | 102388.6ms | 409.7ms | -99.6% | 409.7ms | 5.5ms | 22 |
| node | `module:client-only-stub` | 10 | 231.8ms | 169.0ms | -27.1% | 169.0ms | 60.2ms | 10 |
| node | `manifest:transform` | 10 | 228.7ms | 181.2ms | -20.8% | 181.2ms | 21.5ms | 10 |
| web | `manifest:stage` | 22 | 25.9ms | 21.8ms | -15.8% | 21.8ms | 1.4ms | 22 |
| web | `manifest:transform` | 10 | 1.1ms | 1.0ms | -9.1% | 1.0ms | 0.1ms | 10 |

#### synthetic-48-ssr-esm Plugin Operations

| Environment | Operation | Count | Base total | Head total | Delta | Head wall | Head max | Reports |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| web | `route:module` | 500 | 519.0ms | 451.4ms | -13.0% | 451.4ms | 14.9ms | 20 |
| node | `route:module` | 500 | 235.5ms | 155.5ms | -34.0% | 155.5ms | 0.8ms | 20 |
| web | `route:client-entry` | 500 | 107.6ms | 114.6ms | +6.5% | 114.6ms | 3.4ms | 20 |
| node | `manifest:transform` | 10 | 97.2ms | 55.3ms | -43.1% | 55.3ms | 8.5ms | 10 |
| node | `module:client-only-stub` | 10 | 93.3ms | 77.6ms | -16.8% | 77.6ms | 12.9ms | 10 |
| web | `manifest:stage` | 20 | 6.8ms | 5.5ms | -19.1% | 5.5ms | 0.4ms | 20 |
| web | `manifest:transform` | 10 | 1.0ms | 1.0ms | 0.0% | 1.0ms | 0.1ms | 10 |

### Synthetic Rsbuild App

Rendered 2 production build benchmarks.

| Benchmark | Runs | Base total | Head total | Delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 116.55s | 115.27s | -1.1% | 115.27s | - | 1.01x | - |
| complex app | 2 | 81.10s | 80.81s | -0.4% | 80.81s | - | 1.00x | - |

Rendered 1 dev benchmark fixture from the embedded complex app.

| Benchmark | Runs | Base total | Head total | Delta | Base ready | Head ready | Base routes | Head routes | Base update/HMR | Head update/HMR | Update delta | Head mean | Head p95 | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| complex app | 2 | 98.70s | 97.50s | -1.2% | 90.00s | 88.74s | 2.89s | 2.87s | 3.41s | 3.29s | -3.3% | 97.50s | - | 1.01x | - |

Profile: `full`; mode: `dev`; iterations: `10`; warmup: `0`.
The uploaded benchmark artifact includes `diagnostics/summary.md` and `diagnostics/summary.json` with runner metadata, per-run timing samples, CPU/RSS samples, and plugin timing hot spots.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28621834138)

