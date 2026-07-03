
import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginReactRouter } from "rsbuild-plugin-react-router";

// Vite "build.manifest" is not needed by rsbuild-plugin-react-router.
export default defineConfig({
  plugins: [pluginReact(), pluginReactRouter()],
});
        