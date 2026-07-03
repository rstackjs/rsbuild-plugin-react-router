import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginReactRouter } from "rsbuild-plugin-react-router";
import { VanillaExtractPlugin } from "@vanilla-extract/webpack-plugin";

export default defineConfig({
  server: {
    port: 42045,
    strictPort: true,
  },
  tools: {
    rspack: {
      plugins: [new VanillaExtractPlugin({ identifiers: "debug" })],
      optimization: { realContentHash: false },
    },
  },
  // Vite "build.cssCodeSplit: false" is not mapped: rsbuild always extracts CSS and these fixtures only assert that styles are applied.
  plugins: [pluginReact(), pluginReactRouter()],
});
