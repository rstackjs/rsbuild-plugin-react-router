import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginReactRouter } from "rsbuild-plugin-react-router";

export default defineConfig({
  server: {
    port: 36253,
    strictPort: true,
  },
  dev: {
    assetPrefix: "/app/", // Vite: base (dev)
  },
  output: {
    assetPrefix: "/app/", // Vite: base
  },
  plugins: [pluginReact(), pluginReactRouter()],
});
