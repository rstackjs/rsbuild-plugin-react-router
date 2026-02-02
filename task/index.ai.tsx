import { Agent, Asset, Instructions, Program, Prompt, System, assetRef } from '@unpack/ai';

import './fetch-upstream-react-router-vite.ai.tsx';
import './migrate-vitest-to-rstest.ai.tsx';
import './port-react-router-vite-features.ai.tsx';
import './validate.ai.tsx';

import { upstreamPlugin } from './fetch-upstream-react-router-vite.ai.tsx';
import { migrateConfig } from './migrate-vitest-to-rstest.ai.tsx';
import { portMain } from './port-react-router-vite-features.ai.tsx';
import { validationTarget } from './validate.ai.tsx';

export const orchestratorMarker = assetRef('orchestrator_marker');

export default (
  <Program
    id="rsbuild-react-router-port"
    model={{ name: 'gpt-5.2-codex' }}
    workingDir=".."
    target={{ language: 'markdown' }}
    description="Orchestrate fetching upstream React Router Vite plugin sources and porting missing features into rsbuild-plugin-react-router."
  >
    <Asset id="orchestrator_marker" kind="code" path="src/index.ts" />

    <Agent
      id="orchestrate"
      produces={['orchestrator_marker']}
      external_needs={[
        { alias: 'upstreamPlugin', agent: 'fetch-upstream' },
        { alias: 'migrateConfig', agent: 'migrate-tests' },
        { alias: 'portMain', agent: 'port-features' },
        { alias: 'validationTarget', agent: 'run-checks' },
      ]}
    >
      <Prompt>
        <System>Do not write any markdown report files.</System>
        <Instructions>
          Ensure upstream fetch, migration, porting, and validation run in
          dependency order. Do not write any markdown files.
        </Instructions>
      </Prompt>
    </Agent>
  </Program>
);
