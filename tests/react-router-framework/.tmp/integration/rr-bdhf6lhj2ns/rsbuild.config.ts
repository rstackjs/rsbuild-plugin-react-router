import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginReactRouterRSC } from "rsbuild-plugin-react-router";

export default defineConfig({
  server: {
    port: 46661,
    strictPort: true,
  },
  plugins: [pluginReact(), pluginReactRouterRSC()],
});
