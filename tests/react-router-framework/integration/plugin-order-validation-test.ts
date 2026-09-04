import { test, expect } from "@playwright/test";
import dedent from "dedent";

import { createProject, build, reactRouterConfig } from "./helpers/rsbuild.js";

// Adapted from upstream `vite-plugin-order-validation-test.ts`. The Vite cases
// about `@vitejs/plugin-rsc` ordering have no Rsbuild equivalent; the MDX rule
// is the one this plugin enforces.
test.describe("Rsbuild plugin order validation", () => {
  test("Framework Mode with MDX plugin after React Router plugin", async () => {
    let cwd = await createProject({
      "rsbuild.config.ts": dedent`
        import { defineConfig } from "@rsbuild/core";
        import { pluginMdx } from "@rsbuild/plugin-mdx";
        import { pluginReact } from "@rsbuild/plugin-react";
        import { pluginReactRouter } from "rsbuild-plugin-react-router";

        export default defineConfig({
          plugins: [pluginReact(), pluginReactRouter(), pluginMdx()],
        });
      `,
    });

    let buildResult = build({ cwd });
    expect(buildResult.stderr.toString()).toContain(
      'The "rsbuild:mdx" plugin should be placed before the React Router plugin',
    );
    expect(buildResult.status).not.toBe(0);
  });

  test("RSC Framework Mode with MDX plugin after React Router plugin", async () => {
    let cwd = await createProject(
      {
        "rsbuild.config.ts": dedent`
          import { defineConfig } from "@rsbuild/core";
          import { pluginMdx } from "@rsbuild/plugin-mdx";
          import { pluginReact } from "@rsbuild/plugin-react";
          import { pluginReactRouterRSC } from "rsbuild-plugin-react-router";

          export default defineConfig({
            plugins: [pluginReact(), pluginReactRouterRSC(), pluginMdx()],
          });
        `,
        "react-router.config.ts": reactRouterConfig(),
      },
      "rsc-framework",
    );

    let buildResult = build({ cwd });
    expect(buildResult.stderr.toString()).toContain(
      'The "rsbuild:mdx" plugin should be placed before the React Router plugin',
    );
    expect(buildResult.status).not.toBe(0);
  });
});
