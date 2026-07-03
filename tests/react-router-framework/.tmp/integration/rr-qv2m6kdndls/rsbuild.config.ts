import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginReactRouter } from "rsbuild-plugin-react-router";

export default defineConfig({
  server: {
    port: 36213,
    strictPort: true,
  },
  dev: { assetPrefix: "/app/" }, // Vite: base
  output: {
    assetPrefix: "/app/", // Vite: base
  },
  plugins: [pluginReact(), pluginReactRouter()],
});
