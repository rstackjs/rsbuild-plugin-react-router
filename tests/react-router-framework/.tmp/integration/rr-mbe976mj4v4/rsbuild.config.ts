import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginReactRouter } from "rsbuild-plugin-react-router";

export default defineConfig({
  server: {
    port: 38093,
    strictPort: true,
  },
  dev: {
    assetPrefix: "/mybase/", // Vite: base (dev)
  },
  output: {
    assetPrefix: "/mybase/", // Vite: base
  },
  plugins: [pluginReact(), pluginReactRouter()],
});
