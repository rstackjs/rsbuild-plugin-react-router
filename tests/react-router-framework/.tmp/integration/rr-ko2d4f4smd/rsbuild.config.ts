import { defineConfig } from "@rsbuild/core";
    import { pluginReact } from "@rsbuild/plugin-react";
    import { pluginReactRouter } from "rsbuild-plugin-react-router";

    // Dropped Vite-only plugins: vite-env-only (serverOnly$ macro
    // transform) has no rsbuild equivalent; vite-tsconfig-paths is
    // unnecessary because rsbuild resolves tsconfig "paths" natively.
    export default defineConfig({
      server: {
port: 42015,
strictPort: true,
},
      plugins: [pluginReact(), pluginReactRouter()],
    });