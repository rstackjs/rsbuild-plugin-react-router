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

import { migrateReport } from './migrate-vitest-to-rstest.ai.tsx';

export const validationReport = assetRef('validation_report');

export default (
  <Program
    id="validate"
    model={{ provider: 'openai', name: 'gpt-5.2-codex' }}
    workingDir=".."
    target={{ language: 'markdown' }}
    description="Run local checks for rsbuild-plugin-react-router after porting features."
  >
    <Asset id="validation_report" kind="doc" path="task/output/validation-report.md" />

    <Agent
      id="run-checks"
      produces={['validation_report']}
      external_needs={[{ alias: 'migrateReport', agent: 'migrate-tests' }]}
    >
      <Prompt>
        <System>
          You run the repo tests/build and write a concise report with any
          failures and fixes.
        </System>
        <Context>
          {ctx.file('./package.json', { as: 'package.json', mode: 'code' })}
        </Context>
        <Instructions>
          Run these commands from the repo root and fix any issues:
          - `pnpm test`
          - `pnpm build`

          If a command fails, fix the code/tests and rerun until green.

          Write `task/output/validation-report.md` containing:
          - Commands run
          - Result (pass/fail)
          - Any fixes made
        </Instructions>
      </Prompt>
    </Agent>
  </Program>
);
