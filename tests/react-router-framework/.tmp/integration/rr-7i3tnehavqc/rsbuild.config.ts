
import { defineConfig } from "@rsbuild/core";
import { pluginMdx } from "@rsbuild/plugin-mdx";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginReactRouter } from "rsbuild-plugin-react-router";

export default defineConfig({
  server: { port: 34081, host: "localhost" },
  output: { assetPrefix: "https://cdn.example.com/assets/" },
  plugins: [pluginReact(), pluginMdx(), pluginReactRouter()],
});
  