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

export const migrateConfig = assetRef('migrate_config');

export default (
  <Program
    id="migrate-vitest-to-rstest"
    model={{ name: 'gpt-5.2-codex', reasoningEffort: 'high' }}
    workingDir=".."
    target={{ language: 'markdown' }}
    description="Plan (and if applicable, implement) migrating the test runner from Vitest to Rstest in rsbuild-plugin-react-router."
  >
    <Asset id="migrate_config" kind="code" path="package.json" />

    <Agent id="migrate-tests" produces={['migrate_config']}>
      <Prompt>
        <Skill name="rstest-docs">{`Use https://rstest.rs/llms.txt as the entry point. It lists relative links like /guide/.../. Resolve those against https://rstest.rs to navigate to the relevant sections.`}</Skill>
        <System>
          You migrate test infrastructure safely. You consult upstream docs and
          only propose changes that make sense for the language/tooling in this
          repository.
        </System>
        <Context>
          {ctx.file('./package.json', { as: 'package.json', mode: 'code' })}
          {ctx.file('./rstest.config.ts', { as: 'rstest.config.ts', mode: 'code' })}
          {ctx.file('./tests/index.test.ts', { as: 'tests/index.test.ts', mode: 'code' })}
          {ctx.file('./tests/features.test.ts', { as: 'tests/features.test.ts', mode: 'code' })}
          {ctx.file('./tests/setup.ts', { as: 'tests/setup.ts', mode: 'code' })}
          {ctx.file('./README.md', { as: 'README', mode: 'quote' })}
        </Context>
        <Instructions>
          Read `https://rstest.rs/llms.txt` and follow any linked markdown docs
          needed to understand how to migrate tests.

          Then evaluate whether migrating from Vitest to Rstest is actually
          applicable here. Start by confirming:
          - What test runner is currently used (scripts, config files, imports).
          - Whether this repo contains any Rust crates/tests.

          Constraints:
          - This repo is TypeScript. Rstest is a JS testing framework for the
            Rspack/Rsbuild ecosystem. If this repo does not run JS tests, you
            must NOT invent them.
          - If migration is not applicable, propose realistic JS alternatives
            (e.g. keep Vitest, or migrate to Jest) and outline the minimum
            changes required.

          If migration is applicable, make the code changes directly in the
          repo (configs, dependencies, scripts, and tests). If not applicable,
          do not modify the repo.

          This is a code-editing task. Make changes in the repository rather
          than producing reports.
        </Instructions>
      </Prompt>
    </Agent>
  </Program>
);
