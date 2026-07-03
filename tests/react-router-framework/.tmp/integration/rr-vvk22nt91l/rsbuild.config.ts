import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginReactRouter } from "rsbuild-plugin-react-router";
import { VanillaExtractPlugin } from "@vanilla-extract/webpack-plugin";

export default defineConfig({
  server: {
    port: 44355,
    strictPort: true,
  },
  // vanilla-extract is wired for production builds only:
  // @vanilla-extract/webpack-plugin breaks rspack CSS hot updates in dev,
  // where fixtures instead rely on @vanilla-extract/css runtime evaluation
  // (styles then require JS). identifiers: "debug" keeps class names
  // deterministic across the client and server compilations (SSR markup
  // must match client CSS), and realContentHash is disabled because the
  // plugin's browser manifest captures asset names before rspack's
  // real-content-hash rename.
  // optimization.sideEffects is disabled so that side-effect-only
  // .css.ts imports (compiled to virtual CSS imports) survive the
  // fixture's "sideEffects": false package flag.
  tools: {
    rspack: (config, { isProd, appendPlugins }) => {
      if (!isProd) return config;
      appendPlugins(new VanillaExtractPlugin({ identifiers: "debug" }));
      config.optimization = {
        ...config.optimization,
        realContentHash: false,
        sideEffects: false,
      };
      return config;
    },
  },
  plugins: [pluginReact(), pluginReactRouter()],
});
