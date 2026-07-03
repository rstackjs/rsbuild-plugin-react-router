import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginReactRouterRSC } from "rsbuild-plugin-react-router";

export default defineConfig({
  server: {
    port: 43681,
    strictPort: true,
  },
  output: {
    assetPrefix: "/mybase/", // Vite: base
  },
  plugins: [pluginReact(), pluginReactRouterRSC()],
});
