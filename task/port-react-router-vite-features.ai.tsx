import {
  Agent,
  Asset,
  Context,
  Instructions,
  Program,
  Prompt,
  Skill,
  System,
  assetRef,
  ctx,
} from '@unpack/ai';

import { upstreamPlugin } from './fetch-upstream-react-router-vite.ai.tsx';

export const portMain = assetRef('port_main');

export default (
  <Program
    id="port-react-router-vite-features"
    model={{ name: 'gpt-5.2-codex', reasoningEffort: 'high' }}
    workingDir=".."
    target={{ language: 'ts' }}
    description="Port missing behaviors from React Router's Vite plugin to rsbuild-plugin-react-router."
  >
    <Asset id="port_main" kind="code" path="src/index.ts" />

    <Agent
      id="port-features"
      produces={['port_main']}
      external_needs={[{ alias: 'upstreamPlugin', agent: 'fetch-upstream' }]}
    >
      <Prompt>
        <System>
          You are implementing features in a TypeScript Rsbuild plugin. Prefer
          upstream behavior from React Router's Vite plugin when reasonable, but
          adapt to Rsbuild/Rspack APIs correctly.
        </System>
        <Skill name="rsbuild-docs">{`Use https://rsbuild.rs/llms.txt as the entry point. It lists relative links like /guide/.../index.md and /config/.../source-map.md. Resolve those against https://rsbuild.rs to navigate to the relevant sections.`}</Skill>
        <Context>
          {upstreamPlugin}
          {ctx.file('./README.md', { as: 'Plugin README', mode: 'quote' })}
          {ctx.file('./package.json', { as: 'package.json', mode: 'code' })}
          {ctx.file('./src/index.ts', { as: 'Current Plugin (src/index.ts)', mode: 'code' })}
          {ctx.file('./src/constants.ts', { as: 'Current Constants (src/constants.ts)', mode: 'code' })}
          {ctx.file('./src/plugin-utils.ts', { as: 'Current Utils (src/plugin-utils.ts)', mode: 'code' })}
          {ctx.file('./src/dev-server.ts', { as: 'Dev Server Middleware (src/dev-server.ts)', mode: 'code' })}

          {ctx.file(
            './task/upstream/react-router-dev/vite/plugin.ts',
            { as: 'Upstream Vite Plugin (plugin.ts)', mode: 'code' },
          )}
          {ctx.file(
            './task/upstream/react-router-dev/vite/plugins/validate-plugin-order.ts',
            { as: 'Upstream validate-plugin-order.ts', mode: 'code' },
          )}
          {ctx.file(
            './task/upstream/react-router-dev/vite/plugins/warn-on-client-source-maps.ts',
            { as: 'Upstream warn-on-client-source-maps.ts', mode: 'code' },
          )}
          {ctx.file(
            './task/upstream/react-router-dev/vite/remove-exports.ts',
            { as: 'Upstream remove-exports.ts', mode: 'code' },
          )}
          {ctx.file(
            './task/upstream/react-router-dev/vite/with-props.ts',
            { as: 'Upstream with-props.ts', mode: 'code' },
          )}
          {ctx.file(
            './task/upstream/react-router-dev/vite/ssr-externals.ts',
            { as: 'Upstream ssr-externals.ts', mode: 'code' },
          )}
        </Context>
        <Instructions>
          Use only standard JSX syntax. Prompt interpolation must use JSX
          expression containers and normal JSX text. Do not use legacy
          double-curly placeholders.

          Goal: bring more of React Router's Vite plugin behavior into this
          Rsbuild plugin.

          Implement (at minimum) these ports/adaptations:

          1) Align route export filtering with upstream:
          - Ensure server-only exports include `middleware` (and keep `headers`).
          - Ensure client export lists match upstream intent (client-only route
            exports vs component exports). Update `src/constants.ts` and any
            transforms accordingly.

          2) Add an equivalent of upstream `warnOnClientSourceMaps()` for Rsbuild:
          - On production build, if client sourcemaps are enabled, warn loudly
            (do not crash).
          - Use Rsbuild/Rspack config inspection for both global and
            environment-specific sourcemap settings.

          3) Add an equivalent of upstream `validatePluginOrder()`:
          - For Rsbuild this likely means validating plugin ordering or
            transform ordering in the Rsbuild pipeline (or at least warning when
            known-incompatible config is detected).
          - If Rsbuild has no stable "plugin ordering" API, implement best-effort
            detection and provide actionable error messages.

          4) Review upstream `ssr-externals.ts` and decide whether Rsbuild needs
          an equivalent behavior:
          - If applicable, add a safe version that helps monorepo/local-linked
            packages behave correctly in SSR builds.
          - If not applicable, document why in `task/output/port-report.md`.

          Keep changes scoped and testable:
          - Prefer adding small helper modules under `src/` (e.g. `src/plugins/*`
            or `src/warnings/*`) rather than growing `src/index.ts` further.
          - Add/extend tests under `tests/` using the repo’s current test runner
            (check `package.json` + config). Cover pure logic (export lists,
            sourcemap detection, config validation).
          - Update README only if user-facing configuration changes.

          You must implement real code changes when gaps exist. Do not respond
          with a "no changes needed" outcome unless you have verified parity for
          each requested item and explicitly cite the current files. If gaps
          remain, change the codebase to close them and update tests accordingly.

          This is a code-editing task. Make edits directly in the repo, update
          any dependent files/tests/config, and keep the codebase compiling.
        </Instructions>
      </Prompt>
    </Agent>
  </Program>
);
