import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginReactRouter } from "rsbuild-plugin-react-router";

export default defineConfig({
  server: {
    port: 35495,
    strictPort: true,
  },
  plugins: [pluginReact(), pluginReactRouter()],
});
