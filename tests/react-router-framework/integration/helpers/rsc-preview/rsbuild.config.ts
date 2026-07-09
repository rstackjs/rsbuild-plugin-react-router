import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { Layers, pluginRSC } from "rsbuild-plugin-rsc";
import { createRequestListener } from "@remix-run/node-fetch-server";

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginRSC({
      // entry.ssr.tsx is pulled in by entry.rsc.tsx (entry.rsc.tsx:14). Mark it
      // into the SSR layer so it uses the default (non-`react-server`) export
      // condition while entry.rsc stays in the `react-server` layer below.
      layers: {
        ssr: [/[\\/]entry\.ssr\.tsx$/],
      },
    }),
  ],
  environments: {
    // "server" is pluginRSC's default RSC/server env (target `node`, set by the
    // plugin). server.js imports `./dist/rsc/index.js`, so root -> dist/rsc.
    server: {
      source: {
        entry: {
          index: {
            import: "./src/entry.rsc.tsx",
            layer: Layers.rsc,
          },
        },
      },
      output: {
        distPath: { root: "dist/rsc" },
      },
    },
    // "client" is pluginRSC's default browser env (target `web`). server.js
    // serves `express.static("dist/client")`, so root -> dist/client.
    client: {
      source: {
        entry: {
          // html:false: the RSC server renders the document (root.tsx Layout).
          // Without this, a stray dist/client/index.html would be served by
          // express.static at "/" and shadow the RSC handler.
          index: { import: "./src/entry.browser.tsx", html: false },
        },
      },
      output: {
        distPath: { root: "dist/client" },
      },
    },
  },
  // Production is handled by server.js. In dev the test runs `rsbuild dev`
  // directly (utils.ts:37-42) and rsbuild-plugin-rsc does NOT render documents
  // itself (its dev middleware only serves source maps — plugin dist/index.js).
  // Wire the compiled RSC fetch handler as the catch-all, mirroring the
  // framework plugin's own dev setup (src/rsc-dev-server.ts).
  server: {
    setup: ({ server }) => {
      const devServer = server as typeof server & {
        environments: {
          server: {
            loadBundle<T>(entryName: string): Promise<T>;
          };
        };
      };
      // Return-callback form runs AFTER rsbuild's built-in asset middlewares,
      // so compiled client assets / HMR endpoints are served first and only
      // unmatched requests (documents, resource routes, actions) reach RSC.
      return () => {
        server.middlewares.use(async (req, res, next) => {
          if (
            req.url &&
            new URL(req.url, "http://localhost").pathname.startsWith(
              "/__rsbuild",
            )
          ) {
            return next();
          }
          try {
            const mod = await devServer.environments.server.loadBundle<{
              default: (request: Request) => Promise<Response>;
            }>("index");
            await createRequestListener(mod.default)(req, res);
          } catch (error) {
            next(error);
          }
        });
      };
    },
  },
});
