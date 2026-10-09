import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { describe, expect, it } from '@rstest/core';

const execute = promisify(execFile);

describe.each(['cjs', 'esm'])('native server lazy compilation (%s)', format => {
  it.each([
    'basic',
    'reject',
    'nested',
    'simultaneous',
    'during-apply',
    'bootstrap',
    'ordinary-tla',
    'dependency',
    'context',
    'custom-loader',
    'compile-error',
    'source-error',
    'unknown',
    'shutdown',
    'supersede',
    'web-pending',
    'web-error',
    'server-bundles',
  ])(
    '%s',
    async scenario => {
      const { stdout } = await execute(
        process.execPath,
        [
          '--experimental-vm-modules',
          'scripts/fixtures/dev-node-lazy.mjs',
          format,
          '4',
          scenario,
        ],
        { env: { ...process.env, NODE_ENV: 'development' } }
      );
      expect(JSON.parse(stdout.trim().split('\n').at(-1)!)).toMatchObject({
        format,
        scenario,
        result: 'passed',
      });
    },
    20000
  );
});
