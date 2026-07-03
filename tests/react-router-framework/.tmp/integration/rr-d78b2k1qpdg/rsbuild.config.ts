import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginReactRouter } from "rsbuild-plugin-react-router";

export default defineConfig({
  output: {
    distPath: { assets: "custom-assets-dir" }, // Vite: build.assetsDir
  },
  plugins: [pluginReact(), pluginReactRouter()],
});
