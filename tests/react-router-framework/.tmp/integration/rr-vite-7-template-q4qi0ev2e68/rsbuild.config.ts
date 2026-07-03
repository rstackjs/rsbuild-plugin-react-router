
import { defineConfig } from "@rsbuild/core";
import { pluginMdx } from "@rsbuild/plugin-mdx";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginReactRouter } from "rsbuild-plugin-react-router";

export default defineConfig({
  server: { port: 34735, host: "localhost" },
  
  plugins: [pluginReact(), pluginMdx(), pluginReactRouter()],
});
  