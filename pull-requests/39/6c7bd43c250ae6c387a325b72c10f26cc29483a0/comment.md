<!-- react-router-benchmark-ci -->
## Benchmark Results

Compared PR head `6c7bd43` against base `06ae3db`.

**Total median wall time:** 16.95s -> 8.93s (-47.3%, 1.90x speedup)

| Benchmark | Base | Head | Delta | Speedup | Head RSS p95 |
|---|---:|---:|---:|---:|---:|
| `synthetic-1024-ssr-esm` | 8.46s | 3.84s | -54.6% | 2.20x | 619 MB |
| `synthetic-1024-ssr-esm-split` | 8.49s | 5.08s | -40.1% | 1.67x | 793 MB |

Profile: `ci`; iterations: `5`; warmup: `1`.
[Workflow run](https://github.com/rstackjs/rsbuild-plugin-react-router/actions/runs/28273971890)

