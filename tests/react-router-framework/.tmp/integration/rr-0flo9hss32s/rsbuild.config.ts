import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginReactRouter } from "rsbuild-plugin-react-router";

export default defineConfig({
  server: {
    port: 34993,
    strictPort: true,
  },
  dev: {
    assetPrefix: "https://cdn.example.com/assets/", // Vite: base (dev)
  },
  output: {
    assetPrefix: "https://cdn.example.com/assets/", // Vite: base
  },
  plugins: [pluginReact(), pluginReactRouter()],
});
