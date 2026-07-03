export const keys = ["buildManifest","reactRouterConfig","viteConfig"];
export const buildManifest = {
  "routes": {
    "root": {
      "path": "",
      "id": "root",
      "file": "app/root.tsx"
    },
    "routes/_index": {
      "id": "routes/_index",
      "parentId": "root",
      "file": "app/routes/_index.tsx",
      "path": undefined,
      "index": true,
      "caseSensitive": undefined
    }
  },
  "serverBundles": {
    "preset_server_bundle_id": {
      "id": "preset_server_bundle_id",
      "file": "build/server/preset_server_bundle_id/index.js"
    }
  },
  "routeIdToServerBundleId": {
    "routes/_index": "preset_server_bundle_id"
  }
};
export const reactRouterConfig = {
  "appDirectory": "/home/zack/projects/rsbuild-plugin-react-router/tests/react-router-framework/.tmp/integration/rr-d78b2k1qpdg/app",
  "basename": "/",
  "buildDirectory": "/home/zack/projects/rsbuild-plugin-react-router/tests/react-router-framework/.tmp/integration/rr-d78b2k1qpdg/build",
  "serverBuildFile": "index.js",
  "serverModuleFormat": "esm",
  "splitRouteModules": true,
  "subResourceIntegrity": false,
  "ssr": true,
  "future": {
    "unstable_optimizeDeps": true,
    "unstable_subResourceIntegrity": false,
    "unstable_trailingSlashAwareDataRequests": true,
    "v8_middleware": false,
    "v8_splitRouteModules": false,
    "v8_viteEnvironmentApi": false
  },
  "routeDiscovery": {
    "mode": "lazy",
    "manifestPath": "/__manifest"
  },
  "prerender": undefined,
  "serverBundles": function() {
        return "preset_server_bundle_id";
      },
  "buildEnd": async function(buildEndArgs) {
        let { viteConfig, buildManifest, reactRouterConfig } = buildEndArgs;

        await _promises.default.writeFile(
          "BUILD_END_META.js",
          [
          "export const keys = " + JSON.stringify(Object.keys(buildEndArgs)) + ";",
          "export const buildManifest = " + (0, _serializeJavascript.default)(buildManifest, { space: 2, unsafe: true }) + ";",
          "export const reactRouterConfig = " + (0, _serializeJavascript.default)(reactRouterConfig, { space: 2, unsafe: true }) + ";",
          // buildEnd receives the normalized rsbuild config; Vite's
          // build.assetsDir maps to output.distPath.assets
          "export const assetsDir = " + JSON.stringify(viteConfig.output.distPath.assets) + ";",
          "export const futureFlags = " + JSON.stringify(reactRouterConfig.future) + ";",
          "export const splitRouteModules = " + JSON.stringify(reactRouterConfig.splitRouteModules) + ";"].
          join("\n"),
          "utf-8"
        );
      },
  "allowedActionOrigins": false,
  "routes": {
    "root": {
      "path": "",
      "id": "root",
      "file": "root.tsx"
    },
    "routes/_index": {
      "id": "routes/_index",
      "parentId": "root",
      "file": "routes/_index.tsx",
      "path": undefined,
      "index": true,
      "caseSensitive": undefined
    }
  },
  "unstable_routeConfig": [
    {
      "id": "routes/_index",
      "file": "routes/_index.tsx",
      "path": undefined,
      "index": true,
      "caseSensitive": undefined
    }
  ],
  "presets": [
    {
      "name": "test-preset",
      "reactRouterConfig": async ({ reactRouterUserConfig: { presets, ...restUserConfig } }) => {
      if (!Array.isArray(presets)) {
        throw new Error("React Router user config doesn't have presets array.");
      }

      let expected = JSON.stringify({ appDirectory: "app" });
      let actual = JSON.stringify(restUserConfig);

      if (actual !== expected) {
        throw new Error([
        "React Router user config wasn't passed to reactRouterConfig hook.",
        "Expected: " + expected,
        "Actual: " + actual].
        join(" "));
      }

      return {};
    }
    },
    {
      "name": "test-preset",
      "reactRouterConfig": async () => ({
      appDirectory: "INCORRECT_APP_DIR" // This is overridden by the user config further down this file
    })
    },
    {
      "name": "test-preset",
      "reactRouterConfigResolved": async ({ reactRouterConfig }) => {
      if (reactRouterConfig.appDirectory.includes("INCORRECT_APP_DIR")) {
        throw new Error("React Router preset config wasn't overridden with user config");
      }
    }
    },
    {
      "name": "test-preset",
      "reactRouterConfig": async () => ({
      buildDirectory: "INCORRECT_BUILD_DIR"
    })
    },
    {
      "name": "test-preset",
      "reactRouterConfig": async () => ({
      buildDirectory: "build"
    })
    },
    {
      "name": "test-preset",
      "reactRouterConfig": async ({ reactRouterUserConfig }) => {
      await _promises.default.writeFile("PRESET_REACT_ROUTER_CONFIG_META.json", JSON.stringify({
        reactRouterUserConfigFrozen: isDeepFrozen(reactRouterUserConfig)
      }), "utf-8");
    }
    },
    {
      "name": "test-preset",
      "reactRouterConfigResolved": async ({ reactRouterConfig }) => {
      await _promises.default.writeFile("PRESET_REACT_ROUTER_CONFIG_RESOLVED_META.json", JSON.stringify({
        reactRouterUserConfigFrozen: isDeepFrozen(reactRouterConfig)
      }), "utf-8");
    }
    },
    {
      "name": "test-preset",
      "reactRouterConfig": async () => ({
      serverBundles() {
        return "preset_server_bundle_id";
      }
    })
    },
    {
      "name": "test-preset",
      "reactRouterConfig": async () => ({
      future: {
        unstable_optimizeDeps: true
      }
    })
    },
    {
      "name": "test-preset",
      "reactRouterConfig": async () => ({
      async buildEnd(buildEndArgs) {
        let { viteConfig, buildManifest, reactRouterConfig } = buildEndArgs;

        await _promises.default.writeFile(
          "BUILD_END_META.js",
          [
          "export const keys = " + JSON.stringify(Object.keys(buildEndArgs)) + ";",
          "export const buildManifest = " + (0, _serializeJavascript.default)(buildManifest, { space: 2, unsafe: true }) + ";",
          "export const reactRouterConfig = " + (0, _serializeJavascript.default)(reactRouterConfig, { space: 2, unsafe: true }) + ";",
          // buildEnd receives the normalized rsbuild config; Vite's
          // build.assetsDir maps to output.distPath.assets
          "export const assetsDir = " + JSON.stringify(viteConfig.output.distPath.assets) + ";",
          "export const futureFlags = " + JSON.stringify(reactRouterConfig.future) + ";",
          "export const splitRouteModules = " + JSON.stringify(reactRouterConfig.splitRouteModules) + ";"].
          join("\n"),
          "utf-8"
        );
      }
    })
    }
  ]
};
export const assetsDir = "custom-assets-dir";
export const futureFlags = {"unstable_optimizeDeps":true,"unstable_subResourceIntegrity":false,"unstable_trailingSlashAwareDataRequests":true,"v8_middleware":false,"v8_splitRouteModules":false,"v8_viteEnvironmentApi":false};
export const splitRouteModules = true;