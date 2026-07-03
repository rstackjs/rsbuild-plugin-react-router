import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginReactRouter } from "rsbuild-plugin-react-router";

export default defineConfig({
  server: {
    port: 45137,
    strictPort: true,
  },
  output: {
    assetPrefix: "/mybase/", // Vite: base
  },
  plugins: [pluginReact(), pluginReactRouter()],
});
