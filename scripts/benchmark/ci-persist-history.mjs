#!/usr/bin/env node
import { access, cp, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { execa } from 'execa';

const workspace = process.env.GITHUB_WORKSPACE;
const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
const repository = process.env.REPOSITORY ?? process.env.GITHUB_REPOSITORY;
const branch = process.env.BENCHMARK_HISTORY_BRANCH ?? 'benchmark-results';
const prNumber = process.env.PR_NUMBER;
const headSha = process.env.HEAD_SHA;

if (!workspace || !token || !repository || !prNumber || !headSha) {
  throw new Error(
    'GITHUB_WORKSPACE, GH_TOKEN, REPOSITORY, PR_NUMBER, and HEAD_SHA are required.'
  );
}

const historyDir = path.join(workspace, 'benchmark-history');
const outputDir = path.join(workspace, 'benchmark-output');
const remoteUrl = `https://x-access-token:${token}@github.com/${repository}.git`;
const git = (args, options = {}) =>
  execa('git', args, { cwd: historyDir, stdio: 'inherit', ...options });

const exists = async target => {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
};

const branchExists = async () => {
  const result = await execa(
    'git',
    ['ls-remote', '--exit-code', '--heads', remoteUrl, branch],
    { reject: false }
  );
  if (result.exitCode === 0) {
    return true;
  }
  if (result.exitCode === 2) {
    return false;
  }
  throw new Error(`git ls-remote failed with ${result.exitCode}`);
};

if (await branchExists()) {
  await execa(
    'git',
    ['clone', '--depth', '1', '--branch', branch, remoteUrl, historyDir],
    {
      stdio: 'inherit',
    }
  );
} else {
  await execa('git', ['clone', '--depth', '1', remoteUrl, historyDir], {
    stdio: 'inherit',
  });
  await git(['checkout', '--orphan', branch]);
  await git(['rm', '-rf', '.']);
}

await git(['config', 'user.name', 'github-actions[bot]']);
await git([
  'config',
  'user.email',
  '41898282+github-actions[bot]@users.noreply.github.com',
]);

const resultDir = path.join(historyDir, 'pull-requests', prNumber, headSha);
const latestDir = path.join(historyDir, 'pull-requests', prNumber, 'latest');
await mkdir(resultDir, { recursive: true });
await mkdir(latestDir, { recursive: true });
await cp(
  path.join(outputDir, 'dev/base/baseline.json'),
  path.join(resultDir, 'base.json')
);
await cp(
  path.join(outputDir, 'dev/head/baseline.json'),
  path.join(resultDir, 'head.json')
);
await cp(
  path.join(outputDir, 'build/base/baseline.json'),
  path.join(resultDir, 'build-base.json')
);
await cp(
  path.join(outputDir, 'build/head/baseline.json'),
  path.join(resultDir, 'build-head.json')
);
if (await exists(path.join(outputDir, 'synthetic'))) {
  await cp(
    path.join(outputDir, 'synthetic'),
    path.join(resultDir, 'synthetic'),
    {
      recursive: true,
      force: true,
    }
  );
}
await cp(
  path.join(outputDir, 'report/report.json'),
  path.join(resultDir, 'report.json')
);
await cp(
  path.join(outputDir, 'report/comment.md'),
  path.join(resultDir, 'comment.md')
);
await cp(
  path.join(resultDir, 'report.json'),
  path.join(latestDir, 'report.json')
);
await cp(
  path.join(resultDir, 'comment.md'),
  path.join(latestDir, 'comment.md')
);

await git(['add', 'pull-requests']);
const diff = await execa('git', ['diff', '--cached', '--quiet'], {
  cwd: historyDir,
  reject: false,
});
if (diff.exitCode === 0) {
  console.log('Benchmark history is already up to date.');
  process.exit(0);
}

await git([
  'commit',
  '-m',
  `bench: record PR ${prNumber} ${headSha.slice(0, 7)}`,
]);
await git(['push', 'origin', branch]);
