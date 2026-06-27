<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `dff4b2a` against base `06ae3db`.

**Total median wall time:** 17.00s -> 9.13s (-46.3%, 1.86x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-1024-ssr-esm` | 8.44s | 3.90s | -53.7% | 2.16x | 619 MB |
| `synthetic-1024-ssr-esm-split` | 8.56s | 5.23s | -39.0% | 1.64x | 764 MB |

Profile: `ci`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28273971678)

