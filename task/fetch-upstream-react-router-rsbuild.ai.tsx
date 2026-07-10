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

export const upstreamPlugin = assetRef('upstream_plugin');

export default (
  <Program
    id="fetch-upstream-react-router-rsbuild"
    model={{ name: 'gpt-5.2-codex' }}
    workingDir=".."
    target={{ language: 'markdown' }}
    description="Fetch upstream React Router framework sources so later tasks can adapt behavior to Rsbuild."
  >
    <Asset
      id="upstream_plugin"
      kind="code"
      path="task/upstream/react-router-dev/vite/plugin.ts"
    />

    <Agent id="fetch-upstream" produces={['upstream_plugin']}>
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
              'Target folder: task/upstream/react-router-dev/vite/',
              'Raw base URL: https://raw.githubusercontent.com/remix-run/react-router/main/packages/react-router-dev/vite',
            ].join('\n'),
            { as: 'Upstream Source', mode: 'plain' }
          )}
        </Context>
        <Instructions>
          Fetch these upstream files with `curl -fsSL`, preserving their paths
          under `task/upstream/react-router-dev/vite/`: `plugin.ts`,
          `remove-exports.ts`, `ssr-externals.ts`,
          `plugins/validate-plugin-order.ts`, and
          `plugins/warn-on-client-source-maps.ts`. Overwrite existing files and
          verify `plugin.ts` is non-empty.
        </Instructions>
      </Prompt>
    </Agent>
  </Program>
);
