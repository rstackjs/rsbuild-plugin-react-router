import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const roots = [path.join(root, "app"), path.join(root, "public/generated")];
const extensions = new Map();
let totalBytes = 0;
let totalFiles = 0;
let imports = 0;
let dynamicImports = 0;
let compilerMarkers = 0;
let formatJsMarkers = 0;
let secretMarkers = 0;
let restrictedMarkers = 0;

async function visit(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await visit(filePath);
      continue;
    }
    const stat = await fs.stat(filePath);
    const extension = path.extname(entry.name) || "(none)";
    const current = extensions.get(extension) ?? { bytes: 0, files: 0 };
    current.bytes += stat.size;
    current.files += 1;
    extensions.set(extension, current);
    totalBytes += stat.size;
    totalFiles += 1;

    if (/\.[cm]?[jt]sx?$/.test(entry.name)) {
      const source = await fs.readFile(filePath, "utf8");
      imports += (source.match(/\b(?:import|export)\s+(?!\()/g) ?? []).length;
      dynamicImports += (source.match(/\bimport\s*\(/g) ?? []).length;
      compilerMarkers += /["']use memo["']/.test(source) ? 1 : 0;
      formatJsMarkers += /FormattedMessage|defineMessages|formatMessage/.test(source)
        ? 1
        : 0;
      secretMarkers += source.includes("__syntheticSecret") ? 1 : 0;
      restrictedMarkers += source.includes("restricted") ? 1 : 0;
    }
  }
}

for (const directory of roots) await visit(directory);

console.log(
  JSON.stringify(
    {
      totalFiles,
      totalBytes,
      imports,
      dynamicImports,
      compilerMarkers,
      formatJsMarkers,
      secretMarkers,
      restrictedMarkers,
      extensions: Object.fromEntries(
        [...extensions.entries()].sort(([left], [right]) =>
          left.localeCompare(right)
        )
      ),
    },
    null,
    2
  )
);
