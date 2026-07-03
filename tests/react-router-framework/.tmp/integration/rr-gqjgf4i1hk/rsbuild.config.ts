import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginReactRouter } from "rsbuild-plugin-react-router";
import { VanillaExtractPlugin } from "@vanilla-extract/webpack-plugin";

export default defineConfig(({ command }) => ({
  server: {
    port: 45875,
    strictPort: true,
  },
  // vanilla-extract is wired for builds only: @vanilla-extract/webpack-plugin
  // breaks rspack CSS hot updates in dev, where fixtures instead rely on
  // @vanilla-extract/css runtime evaluation (styles then require JS).
  // identifiers: "debug" keeps class names deterministic across the client
  // and server compilations (SSR markup must match client CSS), and
  // realContentHash is disabled because the plugin's browser manifest
  // captures asset names before rspack's real-content-hash rename.
  ...(command === "build"
    ? {
        tools: {
          rspack: {
            plugins: [new VanillaExtractPlugin({ identifiers: "debug" })],
            optimization: { realContentHash: false },
          },
        },
      }
    : {}),
  plugins: [pluginReact(), pluginReactRouter()],
}));
