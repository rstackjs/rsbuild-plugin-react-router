import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginReactRouter } from "rsbuild-plugin-react-router";

export default defineConfig({
  server: {
    port: 34097,
    strictPort: true,
  },
  output: {
    assetPrefix: "http://localhost:34097/", // Vite: base
  },
  plugins: [pluginReact(), pluginReactRouter()],
});
