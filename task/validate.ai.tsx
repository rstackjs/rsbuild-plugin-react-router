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

export const validationTarget = assetRef('validation_target');

export default (
  <Program
    id="validate"
    model={{ name: 'gpt-5.2-codex' }}
    workingDir=".."
    target={{ language: 'markdown' }}
    description="Run local checks for rsbuild-plugin-react-router after porting features."
  >
    <Asset id="validation_target" kind="code" path="package.json" />

    <Agent id="run-checks" produces={['validation_target']}>
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
          - `pnpm test` (or the repo’s current test script if it changes)
          - `pnpm build`

          If a command fails, fix the code/tests and rerun until green.

          Do not write any markdown report files. Only run commands and fix
          issues in code if needed.

          This is a code-editing task. Apply fixes in the repo, not in reports.
        </Instructions>
      </Prompt>
    </Agent>
  </Program>
);
