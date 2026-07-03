import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginReactRouter } from "rsbuild-plugin-react-router";

export default defineConfig({
  output: { manifest: true }, // Vite: build.manifest
  plugins: [pluginReact(), pluginReactRouter()],
});