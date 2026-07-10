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
    description="Collect current Rsbuild React Router plugin sources so later tasks can validate migration behavior."
  >
    <Asset id="upstream_plugin" kind="code" path="src/index.ts" />

    <Agent id="fetch-upstream" produces={['upstream_plugin']}>
      <Prompt>
        <System>
          You fetch upstream source files into the repo using shell commands and
          verify they were written.
        </System>
        <Context>
          {ctx.literal(
            [
              'Primary repo: rstackjs/rsbuild-plugin-react-router',
              'Primary plugin entry: src/index.ts',
              'Primary config examples: rsbuild.config.ts',
            ].join('\n'),
            { as: 'Upstream Source', mode: 'plain' }
          )}
        </Context>
        <Instructions>
          Inspect the local Rsbuild plugin sources and confirm the migration
          target files exist. Do not download or maintain external plugin
          snapshots for this migration.
        </Instructions>
      </Prompt>
    </Agent>
  </Program>
);
