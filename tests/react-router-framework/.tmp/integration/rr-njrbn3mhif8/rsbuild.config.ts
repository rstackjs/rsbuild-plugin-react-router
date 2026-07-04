import { defineConfig } from "@rsbuild/core";
import { pluginMdx } from "@rsbuild/plugin-mdx";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginReactRouter } from "rsbuild-plugin-react-router";

export default defineConfig({
  server: {
    port: 35127,
    strictPort: true,
  },
  plugins: [pluginReact(), pluginMdx(), pluginReactRouter()],
});
