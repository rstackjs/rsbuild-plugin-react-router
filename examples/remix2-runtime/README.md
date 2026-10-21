# Verify native Remix 2

Run these commands from the plugin repository. They install only in fresh temporary directories outside the pnpm workspace.

```sh
node scripts/test-remix2-isolated.mts native
node scripts/test-remix2-isolated.mts plugin
```

The default mode runs both, in that order.

The native mode uses the stock `@remix-run/dev@2.11.2` classic compiler. The plugin mode packs the current package with lifecycle scripts disabled. Build the plugin before running that mode. To test an already packed artifact, set `REMIX2_PLUGIN_TARBALL` to its absolute path.

The isolated installer uses npm with `--legacy-peer-deps`. This disables automatic peer installation, not production dependencies. Every installed copy of the native runtime must match the pinned versions. Any `@react-router/*` package fails acceptance, including a transitive production dependency.

Do not install or run this fixture inside the plugin workspace. Its router override would replace the required `@remix-run/router@1.19.1`. The copied fixture receives the packed plugin dependency only in plugin mode. There is no plugin stub or framework alias.

The runner retains its temporary install, generated package lock, build artifacts, and Playwright failure evidence. It prints the directory at startup. If Chromium is unavailable, run `npm exec playwright install chromium` inside that temporary fixture, following the repository's Playwright workflow. Then rerun the fixture's browser tests.

## Native reference proof

On 2026-10-21, this command completed successfully with Node `24.3.0` and npm `11.4.2`.

```sh
node scripts/test-remix2-isolated.mts native
```

The install is at `/var/folders/vt/k5n58rgd0vl3djs61xv2c0t80000gn/T/remix2-isolated-BzlhW3/native`. The complete output is at `/tmp/remix2-native-reference-20261021.log`.

The runner executed these checks.

- `npm run test:versions` verified Remix `2.11.2`, React and React DOM `18.3.1`, React Router and React Router DOM `6.26.1`, and router `1.19.1`. All native runtime copies matched. No RR7/8 package was available.
- `npm run typecheck` passed.
- `npm run build:native` passed with the stock classic compiler.
- `npm run test:artifacts` verified the native server build and eight browser artifacts. The loader-only Node sentinel and RR7 globals were absent from browser output.
- `npm run test:http` passed all five tests. It checked SSR, actual `_data` GET/POST, action status `201`, headers, loader revalidation, document and data redirects, streamed SSR defer, and native deferred data/error records.
- `npm run test:e2e:production` passed all six Chromium tests. It checked JavaScript-disabled SSR, custom bootstrap and hydration, Link navigation, Form and fetcher submissions, redirects, and document/navigation defer. Console and page errors were empty.

Both custom entry SHA-256 values were identical before compilation and after browser acceptance.

The development browser check allows two exact stock-native diagnostics.
The unchanged custom client entry sets `data-remix2-entry` before hydration,
which React 18 development reports as an extra attribute. A deliberately rejected
deferred promise also raises `intentional-native-defer-rejection` before hydration
starts after that rejection. Stock Remix's development compiler and Express
handler reproduced both on 2026-10-21. The comparison output is at
`/tmp/remix2-stock-dev-console.log` and `/tmp/remix2-stock-dev-error-kind.log`.
The deferred diagnostic is allowed only for the deferred document test.
Production checks and all other console and page errors remain strict.

```text
app/entry.client.tsx 6a1975eedf395b2546450e46631ecb132fea8bed6820b2f7ee4b5efe73367a82
app/entry.server.tsx cd7f7919b50420da19c3e3552626493fbd5d263351910a537f30b22c4f195fed
```

The reference established two native protocol details. Index document actions use `?index`. Deferred `_data` responses use `text/remix-deferred; charset=utf-8`, with `data:` and `error:` records. The classic compiler omits `isSpaMode` for this SSR build.

## Initial packed plugin red gates

Before implementation on the same date, `node scripts/test-remix2-isolated.mts plugin` installed the baseline packed plugin in `/var/folders/vt/k5n58rgd0vl3djs61xv2c0t80000gn/T/remix2-isolated-mc05lc/plugin`. It exited with status `1`.

- `test:package` failed for both ESM and CommonJS with `ERR_PACKAGE_PATH_NOT_EXPORTED`. The baseline package had no `./remix2` export.
- `test:versions` rejected the production dependency `@react-router/node@8.5.0`. Top-level native versions still matched the pins.
- A separate `npm run build` in that install failed at the real `rsbuild.config.ts` import with the same missing-subpath error.

These were implementation and packaging failures, not environment blockers. The native entry and optional framework peers now resolve both gates.

## Complete plugin acceptance

After the isolation checks pass, plugin mode runs type checking, failure cases, real dev compilation, browser dev acceptance, production compilation, HTTP acceptance, and browser production acceptance. It checks custom entry hashes throughout.

The packed plugin acceptance passed on 2026-10-21. The final artifact was `/tmp/remix2-review3-fixes-packed/rsbuild-plugin-react-router-0.8.2.tgz`, with SHA-256 `b150f99ad914d056e8208c932ceebf8ffd9888096972d73ee7e9338842ff85c2`. The complete output is at `/tmp/remix2-review3-fixes-isolated-final2.log`.

The runner verifies the following behavior.

- `tests/failures.mjs` requires an invalid first production build to reject promptly. It removes the custom server entry temporarily and requires the undeclared-isbot default-entry case to fail without changing package.json, the install lock, or dependency manifests.
- `tests/dev-generation.mjs` requires first dev compilation to reject readiness. It changes loader data and browser route content, verifies a successful generation, then injects a syntax failure. Subsequent data/document requests must retain the previous loader, browser manifest, and reachable route modules. A repaired build must recover.
- `tests/package.mjs` requires real ESM/CJS loading and independent declarations. It checks the packed subpath's local import graph for RR7 imports and root-entry imports.
- `tests/dev-assets.mjs` holds an old document through three normal watch rebuilds. Both default ESM and custom CommonJS servers retain its 11 immutable asset URLs with identical bytes, hydrate the document, and expose the current generation to fresh requests. Failed attempts remain unpublished, and close clears in-memory assets.
- `tests/review-regressions.mjs` and `tests/aliases.mjs` cover readiness supersession, fatal watch failure, shared route IDs, classic `.client` modules, and exact and prefix alias resolution.

Both fixture typechecks, all six development Chromium tests, the production build and artifact checks, all five HTTP tests, and all six production Chromium tests passed. Custom entries remained byte-identical throughout.

The production server consumes the configured native build at `build/server/index.js` and serves `public`. If the agreed plugin output contract changes, update the fixture config and output checks together. `REMIX2_SERVER_BUILD` and `REMIX2_CLIENT_BUILD` can select diagnostic artifact paths without changing application entries.

This fixture does not prove TTArk, GuluX disk watching, CSP, regional delivery, recovery, or existing RR7/8 regressions. Those remain separate acceptance gates.
