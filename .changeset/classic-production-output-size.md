---
'rsbuild-plugin-react-router': patch
---

Shrink classic-mode production browser output. Production builds now mangle
export names (`optimization.mangleExports: 'size'`), drop exports nothing
imports across the whole graph (`optimization.usedExports: 'global'`), and name
async chunks `static/js/async/[id]-[contenthash:16].js`. Classic mode resolves
route modules through the browser manifest by chunk, so export names are not
part of its runtime contract. RSC builds are unchanged and keep every export
name because Flight resolves client references by name. Development builds are
unchanged. To keep readable export names in a classic production build, set
`optimization.mangleExports` and `optimization.usedExports` back in the
function form of `tools.rspack`, which runs after plugin defaults are merged.
