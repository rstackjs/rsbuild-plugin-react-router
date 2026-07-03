
                import { defineConfig } from "@rsbuild/core";
                import { pluginMdx } from "@rsbuild/plugin-mdx";
                import { pluginReact } from "@rsbuild/plugin-react";
                import { pluginReactRouter } from "rsbuild-plugin-react-router";

                export default defineConfig({
                  server: {
  port: 33301,
  strictPort: true,
},
                  output: {
  dataUriLimit: 0, // Vite: build.assetsInlineLimit
},
                  plugins: [
                    pluginReact(),
                    pluginMdx(),
                    pluginReactRouter(),
                  ],
                });
              