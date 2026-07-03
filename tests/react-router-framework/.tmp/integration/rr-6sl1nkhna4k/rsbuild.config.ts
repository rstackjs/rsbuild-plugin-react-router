
import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginReactRouter } from "rsbuild-plugin-react-router";

export default defineConfig({
  // External build orchestrators can introduce additional server
  // environments that React Router should ignore.
  environments: {
    externalServerEnv: {
      output: { target: "node" },
      source: { entry: { index: "./external-server-env.ts" } },
    },
  },
  output: {
    dataUriLimit: 0, // Vite: build.assetsInlineLimit
  },
  plugins: [pluginReact(), pluginReactRouter()],
});
      