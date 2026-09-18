---
'rsbuild-plugin-react-router': minor
---

Require Rsbuild 2.2.8 or newer and send hot data revalidation through its custom-event API. Replay the latest committed revision to reconnecting clients with `environment.hot.onConnect()`.

Remove the watched HDR revision file and the extra browser compilation it triggered. Keep pending revisions until hydration and browser hot updates finish, and ignore duplicate revisions.

Resolve the built-in development request handler from the application's React Router package so linked workspaces cannot mix server and browser data protocols during revalidation.

Update workspace Rsbuild and Rspack versions to 2.2.8 and 2.2.6, including the upstream loader-dependency and Watchpack performance fixes.
