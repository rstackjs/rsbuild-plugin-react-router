const templates = [
  // Framework Mode template. Collapsed from the upstream Vite 7/Vite 8 pair:
  // the Vite major version split is meaningless for rsbuild.
  { name: "rsbuild-template", displayName: "rsbuild" },

  // RSC templates
  { name: "rsc-preview", displayName: "RSC (rsbuild)" },
  { name: "rsc-framework", displayName: "RSC Framework" },

  { name: "vite-plugin-cloudflare-template", displayName: "Cloudflare" },
] as const;

export type Template = (typeof templates)[number];

export function getTemplates(names?: Array<Template["name"]>) {
  if (names === undefined) return templates;
  return templates.filter(({ name }) => names.includes(name));
}

export const bundlerTemplates = getTemplates(["rsbuild-template"]);
