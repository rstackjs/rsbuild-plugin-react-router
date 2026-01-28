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

export const migrateReport = assetRef('migrate_report');

export default (
  <Program
    id="migrate-vitest-to-rstest"
    workingDir=".."
    target={{ language: 'markdown' }}
    description="Plan (and if applicable, implement) migrating the test runner from Vitest to Rstest in rsbuild-plugin-react-router."
  >
    <Asset id="migrate_report" kind="doc" path="task/output/migrate-vitest-to-rstest.md" />

    <Agent id="migrate-tests" produces={['migrate_report']}>
      <Prompt skills={['rstest-docs']}>
        <Skill name="rstest-docs" />
        <System>
          You migrate test infrastructure safely. You consult upstream docs and
          only propose changes that make sense for the language/tooling in this
          repository.
        </System>
        <Context>
          {ctx.file('./package.json', { as: 'package.json', mode: 'code' })}
          {ctx.file('./vitest.config.ts', { as: 'vitest.config.ts', mode: 'code' })}
          {ctx.file('./tests/index.test.ts', { as: 'tests/index.test.ts', mode: 'code' })}
          {ctx.file('./tests/features.test.ts', { as: 'tests/features.test.ts', mode: 'code' })}
          {ctx.file('./tests/setup.ts', { as: 'tests/setup.ts', mode: 'code' })}
          {ctx.file('./README.md', { as: 'README', mode: 'quote' })}
        </Context>
        <Instructions>
          Read `https://rstest.rs/llms.txt` and follow any linked markdown docs
          needed to understand how to migrate tests.

          Then evaluate whether migrating from Vitest to Rstest is actually
          applicable here:
          - This repo is a TypeScript project (Vitest). Rstest is a Rust test
            framework. If there is no Rust crate/test suite in this repo, you
            must NOT invent one just to satisfy the request.

          Deliverable: write `task/output/migrate-vitest-to-rstest.md` with:
          - A clear statement of applicability (is this migration possible here?)
          - If not applicable: explain why (language/runtime mismatch) and list
            realistic alternatives (e.g. keep Vitest; migrate Vitest -> Jest; or
            add Rust tests only if the repo actually contains Rust code).
          - If applicable: provide an ordered, concrete migration checklist
            including file edits, script changes, and how to run tests in CI.

          Do not modify the repo unless the migration is clearly applicable and
          there is an unambiguous target test runner integration.
        </Instructions>
      </Prompt>
    </Agent>
  </Program>
);

