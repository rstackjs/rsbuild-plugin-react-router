export default {
  buildEnd: async ({ buildManifest }) => {
    let fs = await import("node:fs");
    await fs.promises.writeFile(
      "build/test-manifest.json",
      JSON.stringify(buildManifest, null, 2)
    );
  },
  serverBundles: async ({ branch }) => {
    // Smoke test to ensure we can read the route files via 'route.file'
    await Promise.all(branch.map(async (route) => {
      const fs = await import("node:fs/promises");
      const routeFileContents = await fs.readFile(route.file, "utf8");
      if (!routeFileContents.includes("// THIS IS A ROUTE FILE")) {
        throw new Error("Couldn't file route file test comment");
      }
    }));

    if (branch.some((route) => route.id === "routes/_index")) {
      return "root";
    }

    if (branch.some((route) => route.id === "routes/bundle_a")) {
      return "bundle_a";
    }

    if (branch.some((route) => route.id === "routes/bundle_b")) {
      return "bundle_b";
    }

    if (branch.some((route) => route.id === "routes/_pathless.bundle_c")) {
      return "bundle_c";
    }

    throw new Error("No bundle defined for route " + branch[branch.length - 1].id);
  }
}