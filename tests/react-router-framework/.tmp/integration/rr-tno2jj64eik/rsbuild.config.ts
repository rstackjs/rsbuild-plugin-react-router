import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginReactRouter } from "rsbuild-plugin-react-router";
import { VanillaExtractPlugin } from "@vanilla-extract/webpack-plugin";

export default defineConfig({
  server: {
    port: 33239,
    strictPort: true,
  },
  output: {
    assetPrefix: "/custom/base/", // Vite: base
  },
  tools: { rspack: { plugins: [new VanillaExtractPlugin()] } },
  plugins: [pluginReact(), pluginReactRouter()],
});
