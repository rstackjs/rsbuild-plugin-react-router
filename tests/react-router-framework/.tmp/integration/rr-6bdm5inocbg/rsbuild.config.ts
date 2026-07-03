import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginReactRouterRSC } from "rsbuild-plugin-react-router";

export default defineConfig({
  server: {
    port: 34787,
    strictPort: true,
  },
  dev: { assetPrefix: "/app/" }, // Vite: base
  output: {
    assetPrefix: "/app/", // Vite: base
  },
  plugins: [pluginReact(), pluginReactRouterRSC()],
});
