/** @type {import('@unpack-js/core').UnpackConfig} */
module.exports = {
  entry: './task/index.ai.tsx',
  // IMPORTANT: this must be a repo-root-relative directory used to resolve asset paths.
  // Our tasks write to task/output/* and task/upstream/*.
  workingDirectory: '.',
  run: {
    // Keep planning quiet by default; enable actions/deltas explicitly when needed.
    showActions: false,
    showDeltas: true,
    showReasoning: false,
  },
};
