import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginReactRouter } from "rsbuild-plugin-react-router";

export default defineConfig({
  server: {
    port: 41273,
    strictPort: true,
  },
  output: {
    assetPrefix: "http://localhost:41273/", // Vite: base
  },
  plugins: [pluginReact(), pluginReactRouter()],
});
