
import { defineConfig } from "@rsbuild/core";
import { pluginMdx } from "@rsbuild/plugin-mdx";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginReactRouterRSC } from "rsbuild-plugin-react-router";

export default defineConfig({
  server: { port: 40649, host: "localhost" },
  output: { assetPrefix: "/app/" },
  plugins: [pluginReact(), pluginMdx(), pluginReactRouterRSC()],
});
  