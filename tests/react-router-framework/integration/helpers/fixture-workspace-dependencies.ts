import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import path from "pathe";

import type { TemplateName } from "./rsbuild.js";

const repoRoot = process.cwd();
const helpersRoot = path.join(
  repoRoot,
  "tests/react-router-framework/integration/helpers",
);
const rsbuildReadyPath = "node_modules/@rsbuild/core/bin/rsbuild.js";

const packageNameToTemplate: Record<string, TemplateName> = {
  "integration-rsbuild-template": "rsbuild-template",
  "integration-rsc-framework": "rsc-framework",
  "integration-rsc-preview": "rsc-preview",
};

export const getFixtureWorkspaceNodeModulesPath = (
  templateName: TemplateName,
): string => path.join(helpersRoot, templateName, "node_modules");

export function prepareFixtureProjectDependencies(
  projectDir: string,
  templateName = readTemplateName(projectDir),
) {
  if (existsSync(path.join(projectDir, rsbuildReadyPath))) {
    return;
  }

  const sourceNodeModules = getFixtureWorkspaceNodeModulesPath(templateName);
  if (!existsSync(path.join(sourceNodeModules, "@rsbuild/core/bin/rsbuild.js"))) {
    throw new Error(
      `Missing workspace dependencies for ${templateName}. Run pnpm install from the repo root.`,
    );
  }

  linkWorkspaceNodeModules(sourceNodeModules, path.join(projectDir, "node_modules"));
}

function readTemplateName(projectDir: string): TemplateName {
  const packageJson = JSON.parse(
    readFileSync(path.join(projectDir, "package.json"), "utf8"),
  ) as { name?: string };
  const templateName = packageJson.name
    ? packageNameToTemplate[packageJson.name]
    : undefined;
  if (!templateName) {
    throw new Error(
      `Cannot infer React Router framework fixture template from package ${JSON.stringify(packageJson.name)}.`,
    );
  }
  return templateName;
}

function linkWorkspaceNodeModules(sourceNodeModules: string, targetNodeModules: string) {
  mkdirSync(targetNodeModules, { recursive: true });

  for (const entry of readdirSync(sourceNodeModules, { withFileTypes: true })) {
    if (entry.name === ".modules.yaml" || entry.name === ".pnpm") {
      continue;
    }

    const sourceEntry = path.join(sourceNodeModules, entry.name);
    const targetEntry = path.join(targetNodeModules, entry.name);
    if (entry.name.startsWith("@") && lstatSync(sourceEntry).isDirectory()) {
      linkScopedPackages(sourceEntry, targetEntry);
      continue;
    }
    linkEntry(sourceEntry, targetEntry);
  }
}

function linkScopedPackages(sourceScope: string, targetScope: string) {
  mkdirSync(targetScope, { recursive: true });
  for (const entry of readdirSync(sourceScope)) {
    linkEntry(path.join(sourceScope, entry), path.join(targetScope, entry));
  }
}

function linkEntry(sourceEntry: string, targetEntry: string) {
  rmSync(targetEntry, { force: true, recursive: true });
  symlinkSync(
    sourceEntry,
    targetEntry,
    process.platform === "win32" && lstatSync(sourceEntry).isDirectory()
      ? "junction"
      : undefined,
  );
}
