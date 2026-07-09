const templates = [
  // Framework Mode template. Collapsed from the upstream Rsbuild 7/Rsbuild 8 pair:
  // the Rsbuild major version split is meaningless for rsbuild.
  { name: "rsbuild-template", displayName: "rsbuild" },

  // RSC templates
  { name: "rsc-preview", displayName: "RSC (rsbuild)" },
  { name: "rsc-framework", displayName: "RSC Framework" },
] as const;

export type Template = (typeof templates)[number];
export type TemplateName = Template["name"];

export function getTemplates(names?: Array<Template["name"]>) {
  if (names === undefined) return templates;
  return templates.filter(({ name }) => names.includes(name));
}

export const bundlerTemplates = getTemplates(["rsbuild-template"]);
