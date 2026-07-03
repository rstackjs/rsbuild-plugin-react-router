
import { defineConfig } from "@rsbuild/core";
import { pluginMdx } from "@rsbuild/plugin-mdx";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginReactRouter } from "rsbuild-plugin-react-router";

export default defineConfig({
  server: { port: 37195, host: "localhost" },
  output: { assetPrefix: "/custom/base/" },
  plugins: [pluginReact(), pluginMdx(), pluginReactRouter()],
});
  