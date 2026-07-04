import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginReactRouter } from "rsbuild-plugin-react-router";
import { VanillaExtractPlugin } from "@vanilla-extract/webpack-plugin";

export default defineConfig({
  server: {
    port: 45179,
    strictPort: true,
  },
  // vanilla-extract via @vanilla-extract/webpack-plugin.
  // - identifiers: "debug" keeps class names deterministic across the
  //   client and server compilations (SSR markup must match client CSS).
  // - optimization.sideEffects is disabled so side-effect-only .css.ts
  //   imports (compiled to virtual CSS imports) survive the fixture's
  //   "sideEffects": false package flag.
  tools: {
    rspack: {
      plugins: [new VanillaExtractPlugin({ identifiers: "debug" })],
      optimization: { sideEffects: false },
    },
  },
  plugins: [pluginReact(), pluginReactRouter()],
});
