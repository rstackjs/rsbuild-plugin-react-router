# Embedded Synthetic Rsbuild Benchmark

This fixture is a deterministic large React Router app used by this repository's
benchmark CI. It keeps the Rsbuild app shape, loader mix, React Compiler work,
Tailwind work, SVG transforms, worker imports, CSS modules, and large public JSON
payloads from the support repro without checking out or copying another
repository during CI.

Generated source and build output are ignored. The checked-in files are only the
small app shell, generator, Rsbuild config, and benchmark runner.

## Profile

`synthetic.config.json` generates roughly:

| Characteristic          |         Count |
| ----------------------- | ------------: |
| Code modules            |        10,895 |
| React Router routes     |           355 |
| Dynamic imports         |         1,065 |
| SVG assets              |         1,184 |
| CSS modules             |           217 |
| Public locale-like JSON |     144.3 MiB |
| Generated input         | about 228 MiB |

## Commands

```sh
pnpm install --frozen-lockfile
pnpm generate
pnpm shape
pnpm benchmark:rsbuild -- --profile=all --runs=1
```

There is intentionally one benchmark path. The Rsbuild config enables the
realistic expensive work directly: React Router Framework Mode, React Compiler,
Babel app transforms, Tailwind, SVGR, CSS modules, worker imports, dynamic
imports, and large public JSON payloads.

Root CI benchmarks the PR base plugin and PR head plugin against the same
embedded app by staging each built plugin package into this workspace fixture.
It records a cold build plus a dev server pass with readiness, route-load, and
generated route-module update rebuild timings.

Set `SYNTHETIC_DEV_TIMEOUT_MS` or `SYNTHETIC_DEV_ROUTE_TIMEOUT_MS` to tune dev
server readiness and route-fetch timeouts for slower CI runners.
