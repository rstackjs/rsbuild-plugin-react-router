import {
  Agent,
  Asset,
  Context,
  Instructions,
  Program,
  Prompt,
  System,
  assetRef,
  ctx,
} from '@unpack/ai';

// Downstream tasks can include the fetched snapshot index in prompt context.
export const upstreamViteIndex = assetRef('upstream_vite_index');

export default (
  <Program
    id="fetch-upstream-react-router-vite"
    model={{ name: 'gpt-5.2-codex' }}
    workingDir=".."
    target={{ language: 'markdown' }}
    description="Fetch upstream react-router-dev/vite sources into task/upstream/ so later tasks can port behavior into Rsbuild."
  >
    <Asset
      id="upstream_vite_index"
      kind="doc"
      path="task/upstream/react-router-dev/vite/INDEX.md"
    />

    <Agent id="fetch-upstream" produces={['upstream_vite_index']}>
      <Prompt>
        <System>
          You fetch upstream source files into the repo using shell commands and
          verify they were written.
        </System>
        <Context>
          {ctx.literal(
            [
              'Upstream repo: remix-run/react-router',
              'Upstream folder: packages/react-router-dev/vite/',
              'Target folder in this repo: task/upstream/react-router-dev/vite/',
              '',
              'Raw base URL:',
              'https://raw.githubusercontent.com/remix-run/react-router/main/packages/react-router-dev/vite',
            ].join('\n'),
            { as: 'Upstream Source', mode: 'plain' },
          )}
        </Context>
        <Instructions>
          Create the directory tree `task/upstream/react-router-dev/vite/` and
          download the upstream files (use `curl -fsSL ... -o ...`).
          Prefer one shell script that fetches everything deterministically.
          Overwrite existing files.
          After fetching, write `task/upstream/react-router-dev/vite/INDEX.md`
          listing:
          - the raw URL for each file
          - the local path
          - a short note for "key" files: `plugin.ts`, `with-props.ts`,
            `remove-exports.ts`, `styles.ts`, `route-chunks.ts`

          Fetch these files:

          - babel.ts
          - build.ts
          - cache.ts
          - cloudflare-dev-proxy.ts
          - cloudflare.ts
          - combine-urls-test.ts
          - combine-urls.ts
          - dev.ts
          - has-dependency.ts
          - has-rsc-plugin.ts
          - load-dotenv.ts
          - node-adapter.ts
          - optimize-deps-entries.ts
          - plugin.ts
          - profiler.ts
          - remove-exports-test.ts
          - remove-exports.ts
          - resolve-file-url.ts
          - resolve-relative-route-file-path.ts
          - route-chunks-test.ts
          - route-chunks.ts
          - rsc/plugin.ts
          - rsc/virtual-route-config.ts
          - rsc/virtual-route-modules.ts
          - plugins/validate-plugin-order.ts
          - plugins/warn-on-client-source-maps.ts
          - ssr-externals.ts
          - static/refresh-utils.mjs
          - static/rsc-refresh-utils.mjs
          - styles.ts
          - virtual-module.ts
          - vite-node.ts
          - vite.ts
          - with-props.ts

          Sanity-check that `task/upstream/react-router-dev/vite/plugin.ts`
          exists and is non-empty before finishing.
        </Instructions>
      </Prompt>
    </Agent>
  </Program>
);
