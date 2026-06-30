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
pnpm benchmark:rsbuild-modes -- --runs=1 --modes=rsbuild-optimized
```

The benchmark modes are:

- `rsbuild-optimized`: production Rsbuild build using the current optimized
  fixture config.
- `rsbuild-js-transform-contention`: same build with the Babel app transform
  and React Compiler path enabled to add main-thread JavaScript transform
  contention.

The plugin under test can be selected without editing this fixture:

```sh
SYNTHETIC_REACT_ROUTER_PLUGIN_IMPORT=file:///path/to/plugin/dist/index.js \
  pnpm benchmark:rsbuild-modes -- --runs=1
```

Root CI uses that environment variable to benchmark the PR base plugin and PR
head plugin against the same embedded app.
