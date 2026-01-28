import { Agent, Asset, Context, Instructions, Program, Prompt, System } from '@unpack/ai';

import './fetch-upstream-react-router-vite.ai.tsx';
import './migrate-vitest-to-rstest.ai.tsx';
import './port-react-router-vite-features.ai.tsx';
import './validate.ai.tsx';

import { upstreamViteIndex } from './fetch-upstream-react-router-vite.ai.tsx';
import { migrateReport } from './migrate-vitest-to-rstest.ai.tsx';
import { portReport } from './port-react-router-vite-features.ai.tsx';
import { validationReport } from './validate.ai.tsx';

export default (
  <Program
    id="rsbuild-react-router-port"
    workingDir=".."
    target={{ language: 'markdown' }}
    description="Orchestrate fetching upstream React Router Vite plugin sources and porting missing features into rsbuild-plugin-react-router."
  >
    <Asset id="final_report" kind="doc" path="task/output/final-report.md" />

    <Agent id="write-final-report" produces={['final_report']}>
      <Prompt>
        <System>
          You summarize the work done by the upstream-fetch + port + validation
          tasks.
        </System>
        <Context>
          {upstreamViteIndex}
          {migrateReport}
          {portReport}
          {validationReport}
        </Context>
        <Instructions>
          Write `task/output/final-report.md` with:
          - What upstream snapshot was fetched
          - What features were ported
          - How to run tests/build
          - Any remaining gaps vs upstream
        </Instructions>
      </Prompt>
    </Agent>
  </Program>
);
