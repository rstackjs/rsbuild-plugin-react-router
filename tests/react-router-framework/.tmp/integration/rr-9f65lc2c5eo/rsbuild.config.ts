import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginReactRouter } from "rsbuild-plugin-react-router";

export default defineConfig({
  server: {
    port: 45339,
    strictPort: true,
  },
  dev: { assetPrefix: "http://localhost:45339/" }, // Vite: base
  output: {
    assetPrefix: "http://localhost:45339/", // Vite: base
  },
  plugins: [pluginReact(), pluginReactRouter()],
});
