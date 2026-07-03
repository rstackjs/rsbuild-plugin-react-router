
// this is kinda silly, but this way we can track imports
// that happen during SSR and during CSR
export async function logImport(url: string) {
  try {
    const fs = await import("node:fs");
    const path = await import("node:path");
    fs.appendFileSync(path.join(process.cwd(), "ssr-route-imports.txt"), url + "\n");
  }
  catch (e) {
    (window.csrRouteImports ??= []).push(url);
  }
}
        