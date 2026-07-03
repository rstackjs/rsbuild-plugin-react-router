import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginReactRouter } from "rsbuild-plugin-react-router";
import { VanillaExtractPlugin } from "@vanilla-extract/webpack-plugin";

export default defineConfig({
  server: {
    port: 33871,
    strictPort: true,
  },
  tools: {
    rspack: {
      plugins: [new VanillaExtractPlugin({ identifiers: "debug" })],
      optimization: { realContentHash: false },
    },
  },
  plugins: [pluginReact(), pluginReactRouter()],
});
