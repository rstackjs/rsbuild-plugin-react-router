import { defineConfig } from "@rsbuild/core";
import { pluginMdx } from "@rsbuild/plugin-mdx";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginReactRouter } from "rsbuild-plugin-react-router";

export default defineConfig({
  server: {
    port: 36757,
    strictPort: true,
  },
  plugins: [pluginReact(), pluginMdx(), pluginReactRouter()],
});
