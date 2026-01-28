#!/usr/bin/env bash
set -euo pipefail

# Fetch upstream React Router "react-router-dev/vite" sources into this repo.
# Overwrites existing files to keep the snapshot deterministic.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$ROOT_DIR/task/upstream/react-router-dev/vite"
BASE_URL="https://raw.githubusercontent.com/remix-run/react-router/main/packages/react-router-dev/vite"

FILES=(
  "babel.ts"
  "build.ts"
  "cache.ts"
  "cloudflare-dev-proxy.ts"
  "cloudflare.ts"
  "combine-urls-test.ts"
  "combine-urls.ts"
  "dev.ts"
  "has-dependency.ts"
  "has-rsc-plugin.ts"
  "load-dotenv.ts"
  "node-adapter.ts"
  "optimize-deps-entries.ts"
  "plugin.ts"
  "profiler.ts"
  "remove-exports-test.ts"
  "remove-exports.ts"
  "resolve-file-url.ts"
  "resolve-relative-route-file-path.ts"
  "route-chunks-test.ts"
  "route-chunks.ts"
  "rsc/plugin.ts"
  "rsc/virtual-route-config.ts"
  "rsc/virtual-route-modules.ts"
  "plugins/validate-plugin-order.ts"
  "plugins/warn-on-client-source-maps.ts"
  "ssr-externals.ts"
  "static/refresh-utils.mjs"
  "static/rsc-refresh-utils.mjs"
  "styles.ts"
  "virtual-module.ts"
  "vite-node.ts"
  "vite.ts"
  "with-props.ts"
)

mkdir -p "$OUT_DIR"

for f in "${FILES[@]}"; do
  url="$BASE_URL/$f"
  out="$OUT_DIR/$f"
  mkdir -p "$(dirname "$out")"
  curl -fsSL "$url" -o "$out"
done

# Sanity check required by task instructions.
if [[ ! -s "$OUT_DIR/plugin.ts" ]]; then
  echo "error: expected non-empty $OUT_DIR/plugin.ts" >&2
  exit 1
fi

echo "Fetched ${#FILES[@]} files into: $OUT_DIR"

