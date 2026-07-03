export default {
  buildEnd: async ({ buildManifest }) => {
    let fs = await import("node:fs");
    await fs.promises.writeFile(
      "build/test-manifest.json",
      JSON.stringify(buildManifest, null, 2),
      "utf-8",
    );
  },
}