# Coherent React Router development generations

The plugin builds React Router applications with separate `web` and `node`
compilers. During development, those compilers can finish at different times.
Publishing each result independently can pair a new browser manifest with an
older server entry object.

## Contract

The plugin exposes only a committed React Router development generation:

- every configured React Router server entry was evaluated successfully;
- each entry's embedded manifest came from the selected web compilation;
- failed, incomplete, and superseded candidates cannot replace the last-good
  generation; and
- built-in middleware and `loadReactRouterServerBuild(devServer)` read the same
  committed generation.

Requests capture one committed server entry object for their lifetime. Calling
`loadReactRouterServerBuild(devServer, entryName)` selects a configured server
bundle by its exact Rsbuild entry name; omitting `entryName` selects the full
default build. All entries switch generations together. The public helper is
the supported build provider for custom development servers; calling
`devServer.environments.node.loadBundle()` directly bypasses this contract.

## Lifecycle model

A candidate records the exact web compilation used to produce its manifests and
the corresponding evaluated node builds. It becomes visible only after
Rsbuild's aggregate development callback supplies a complete, error-free pair.
One-sided callbacks are accepted only when their known changed files do not
intersect the unchanged compiler's dependencies.

Each node compilation also records the latest completed web compilation when it
starts. If rapid edits produce a callback containing a node result paired with
a different web compilation, that mixed candidate is discarded. Fatal compiler
failures reject initial waiters promptly; later failures preserve last-good
output.

The committed generation remains available while a later candidate builds.
Initial compilation failures are reported to requests; failures after a commit
leave the last-good generation available. Starting a replacement dev server
creates a new lifecycle session so callbacks from the old session cannot
publish into the new one.

Programmatic replacement requires callers to await the active server's
`close()` before calling `createDevServer()` again. The plugin rejects an
overlapping or out-of-order replacement rather than closing one server from
inside another server's global startup-hook transaction. Callers must serialize
`createDevServer()` calls; concurrent server creation is outside this contract.
If startup fails before returning a server, or if closing the active server
rejects, restart the process before retrying unless the caller can externally
prove and force complete teardown. A fresh Rsbuild instance alone is not
sufficient because the prior compiler or watchers may still be active.

## Deliberate limit

This is an eagerly evaluated server-entry-set and manifest-pairing guarantee, not
byte-level output atomicity. Development outputs use stable paths and mutable
storage, so an old server-build object does not preserve older client assets or
server chunks that are imported lazily after entry evaluation.

Rsbuild publishes compiler-derived WebSocket success before its supported
`onAfterDevCompile` plugin callback. The plugin therefore cannot promise that
browser success notification waits for framework publication. A supported
graph-settled, pre-success hook is required to close that gap.

Strict old-or-new asset serving would additionally require immutable
generation filenames, staged output promotion, or request-pinned asset
snapshots with garbage collection. That is outside this contract.
