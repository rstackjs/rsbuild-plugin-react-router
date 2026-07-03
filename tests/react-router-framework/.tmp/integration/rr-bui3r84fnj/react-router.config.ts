import fs from "node:fs/promises";
import serializeJs from "serialize-javascript";

let isDeepFrozen = (obj: any) =>
  Object.isFrozen(obj) &&
  Object.keys(obj).every(
    prop => typeof obj[prop] !== 'object' || obj[prop] === null || isDeepFrozen(obj[prop])
  );

export default {
  // Ensure user config takes precedence over preset config
  appDirectory: "app",

  presets: [
    // Ensure user config is passed to reactRouterConfig hook
    {
      name: "test-preset",
      reactRouterConfig: async ({ reactRouterUserConfig: { presets, ...restUserConfig } }) => {
        if (!Array.isArray(presets)) {
          throw new Error("React Router user config doesn't have presets array.");
        }

        let expected = JSON.stringify({ appDirectory: "app"});
        let actual = JSON.stringify(restUserConfig);

        if (actual !== expected) {
          throw new Error([
            "React Router user config wasn't passed to reactRouterConfig hook.",
            "Expected: " + expected,
            "Actual: " + actual,
          ].join(" "));
        }

        return {};
      },
    },

    // Ensure preset config takes lower precedence than user config
    {
      name: "test-preset",
      reactRouterConfig: async () => ({
        appDirectory: "INCORRECT_APP_DIR", // This is overridden by the user config further down this file
      }),
    },
    {
      name: "test-preset",
      reactRouterConfigResolved: async ({ reactRouterConfig }) => {
        if (reactRouterConfig.appDirectory.includes("INCORRECT_APP_DIR")) {
          throw new Error("React Router preset config wasn't overridden with user config");
        }
      }
    },

    // Ensure config presets are merged in the correct order
    {
      name: "test-preset",
      reactRouterConfig: async () => ({
        buildDirectory: "INCORRECT_BUILD_DIR",
      }),
    },
    {
      name: "test-preset",
      reactRouterConfig: async () => ({
        buildDirectory: "build",
      }),
    },

    // Ensure reactRouterConfig is called with a frozen user config
    {
      name: "test-preset",
      reactRouterConfig: async ({ reactRouterUserConfig }) => {
        await fs.writeFile("PRESET_REACT_ROUTER_CONFIG_META.json", JSON.stringify({
          reactRouterUserConfigFrozen: isDeepFrozen(reactRouterUserConfig),
        }), "utf-8");
      }
    },

    // Ensure reactRouterConfigResolved is called with a frozen config
    {
      name: "test-preset",
      reactRouterConfigResolved: async ({ reactRouterConfig }) => {
        await fs.writeFile("PRESET_REACT_ROUTER_CONFIG_RESOLVED_META.json", JSON.stringify({
          reactRouterUserConfigFrozen: isDeepFrozen(reactRouterConfig),
        }), "utf-8");
      }
    },

    // Ensure presets can set serverBundles option (this is critical for Vercel support)
    {
      name: "test-preset",
      reactRouterConfig: async () => ({
        serverBundles() {
          return "preset_server_bundle_id";
        },
      }),
    },

    // Ensure presets can set future flags
    {
      name: "test-preset",
      reactRouterConfig: async () => ({
        future: {
          unstable_optimizeDeps: true,
        },
      }),
    },

    // Ensure presets can set buildEnd option (this is critical for Vercel support)
    {
      name: "test-preset",
      reactRouterConfig: async () => ({
        async buildEnd(buildEndArgs) {
          let { viteConfig, buildManifest, reactRouterConfig } = buildEndArgs;

          await fs.writeFile(
            "BUILD_END_META.js",
            [
              "export const keys = " + JSON.stringify(Object.keys(buildEndArgs)) + ";",
              "export const buildManifest = " + serializeJs(buildManifest, { space: 2, unsafe: true }) + ";",
              "export const reactRouterConfig = " + serializeJs(reactRouterConfig, { space: 2, unsafe: true }) + ";",
              "export const assetsDir = " + JSON.stringify(viteConfig.build.assetsDir) + ";",
              "export const futureFlags = " + JSON.stringify(reactRouterConfig.future) + ";",
              "export const splitRouteModules = " + JSON.stringify(reactRouterConfig.splitRouteModules) + ";",
            ].join("\n"),
            "utf-8"
          );
        },
      }),
    },
  ],
}