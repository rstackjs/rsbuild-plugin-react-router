#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(scriptPath), '..');
const manifestPath = path.join(
  repoRoot,
  'tests/react-router-framework/UPSTREAM.json'
);

const git = (sourceRoot, args, options = {}) =>
  execFileSync('git', ['-C', sourceRoot, ...args], {
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  });

export const parseNameStatus = output => {
  const fields = output.toString('utf8').split('\0');
  if (fields.at(-1) === '') {
    fields.pop();
  }

  const changes = [];
  for (let index = 0; index < fields.length; ) {
    const status = fields[index++];
    if (!status) {
      throw new Error('Malformed git diff output: missing status');
    }
    const kind = status[0];
    if (kind === 'R' || kind === 'C') {
      const oldPath = fields[index++];
      const newPath = fields[index++];
      if (!oldPath || !newPath) {
        throw new Error(`Malformed git diff output for ${status}`);
      }
      changes.push({ kind, status, oldPath, path: newPath });
      continue;
    }

    const changedPath = fields[index++];
    if (!changedPath) {
      throw new Error(`Malformed git diff output for ${status}`);
    }
    changes.push({ kind, status, path: changedPath });
  }
  return changes;
};

export const categorizeChanges = changes => {
  const result = {
    directoriesWithAddedFiles: [],
    added: [],
    modified: [],
    deleted: [],
    renamed: [],
    other: [],
  };
  const directoriesWithAddedFiles = new Set();

  for (const change of changes) {
    if (change.kind === 'A') {
      result.added.push(change.path);
      const directory = path.posix.dirname(change.path);
      if (directory !== '.') {
        directoriesWithAddedFiles.add(directory);
      }
    } else if (change.kind === 'M') {
      result.modified.push(change.path);
    } else if (change.kind === 'D') {
      result.deleted.push(change.path);
    } else if (change.kind === 'R') {
      result.renamed.push(change);
    } else {
      result.other.push(change);
    }
  }

  result.directoriesWithAddedFiles = [...directoriesWithAddedFiles].sort();
  for (const key of ['added', 'modified', 'deleted']) {
    result[key].sort();
  }
  result.renamed.sort((left, right) => left.path.localeCompare(right.path));
  result.other.sort((left, right) => left.path.localeCompare(right.path));
  return result;
};

const resolveCommit = (sourceRoot, ref) =>
  git(sourceRoot, ['rev-parse', '--verify', `${ref}^{commit}`], {
    encoding: 'utf8',
  }).trim();

export const auditUpstream = ({
  sourceRoot,
  baseRef,
  targetRef = 'HEAD',
  sourceDirs,
}) => {
  const baseCommit = resolveCommit(sourceRoot, baseRef);
  const targetCommit = resolveCommit(sourceRoot, targetRef);
  const output = git(
    sourceRoot,
    [
      'diff',
      '--name-status',
      '-z',
      '--find-renames',
      baseCommit,
      targetCommit,
      '--',
      ...sourceDirs,
    ],
    { encoding: 'buffer' }
  );
  return {
    baseCommit,
    targetCommit,
    ...categorizeChanges(parseNameStatus(output)),
  };
};

const printPaths = (label, paths) => {
  console.log(`${label} (${paths.length})`);
  for (const entry of paths) {
    console.log(`  ${entry}`);
  }
};

export const printAudit = audit => {
  console.log(`React Router framework upstream audit`);
  console.log(`  reviewed: ${audit.baseCommit}`);
  console.log(`  target:   ${audit.targetCommit}`);
  printPaths('Directories with added files', audit.directoriesWithAddedFiles);
  printPaths('Added files', audit.added);
  printPaths('Modified files', audit.modified);
  printPaths('Deleted files', audit.deleted);
  console.log(`Renamed files (${audit.renamed.length})`);
  for (const change of audit.renamed) {
    console.log(`  ${change.oldPath} -> ${change.path}`);
  }
  console.log(`Other changes (${audit.other.length})`);
  for (const change of audit.other) {
    console.log(`  ${change.status} ${change.path}`);
  }
  console.log(
    '\nReview these changes manually. Copy and adapt only the tests this ' +
      'repository needs, run them, then update lastReviewedRef and reviewedAt ' +
      'in tests/react-router-framework/UPSTREAM.json.'
  );
};

const readOption = name =>
  process.argv
    .find(argument => argument.startsWith(`--${name}=`))
    ?.slice(name.length + 3);

const isDirectExecution =
  process.argv[1] && path.resolve(process.argv[1]) === scriptPath;

if (isDirectExecution) {
  const sourceOption = readOption('source') ?? process.env.REACT_ROUTER_REPO;
  if (!sourceOption) {
    throw new Error(
      'Pass --source=/path/to/react-router or set REACT_ROUTER_REPO.'
    );
  }
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const audit = auditUpstream({
    sourceRoot: path.resolve(sourceOption),
    baseRef: manifest.lastReviewedRef,
    targetRef: readOption('target') ?? 'HEAD',
    sourceDirs: manifest.sourceDirs,
  });
  printAudit(audit);
}
