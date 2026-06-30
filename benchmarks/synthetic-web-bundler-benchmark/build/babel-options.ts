import type { PluginItem } from "@babel/core";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const directory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(directory, "..");
const configPath = path.join(root, "synthetic.config.json");
const reactCompilerEnv = "SYNTHETIC_REACT_COMPILER";
const reactCompilerModes = [
  "with-react-compiler",
  "without-react-compiler",
] as const;

export type ReactCompilerMode = (typeof reactCompilerModes)[number];

export function createBabelPlugins({
  reactCompilerMode = resolveReactCompilerMode(),
  stripRestricted,
}: {
  reactCompilerMode?: ReactCompilerMode;
  stripRestricted: boolean;
}): PluginItem[] {
  const plugins: PluginItem[] = [];

  if (reactCompilerMode === "with-react-compiler") {
    plugins.push([
      require.resolve("babel-plugin-react-compiler"),
      {
        compilationMode: "annotation",
        target: "19",
      },
    ]);
  }

  plugins.push(
    [
      require.resolve("babel-plugin-formatjs"),
      {
        ast: true,
        idInterpolationPattern: "[sha512:contenthash:base64:6]",
        removeDefaultMessage: false,
      },
    ],
    path.join(directory, "babel-plugin-secret-hash.cjs"),
    ...(stripRestricted
      ? [path.join(directory, "babel-plugin-restricted-imports.cjs")]
      : [])
  );

  return plugins;
}

export function resolveReactCompilerMode(
  env: NodeJS.ProcessEnv = process.env
): ReactCompilerMode {
  const envMode = env[reactCompilerEnv];
  if (envMode !== undefined) {
    return validateReactCompilerMode(envMode, reactCompilerEnv);
  }

  const config = JSON.parse(fs.readFileSync(configPath, "utf8")) as {
    reactCompilerMode?: unknown;
  };
  return validateReactCompilerMode(
    config.reactCompilerMode ?? "with-react-compiler",
    "synthetic.config.json reactCompilerMode"
  );
}

function validateReactCompilerMode(
  value: unknown,
  source: string
): ReactCompilerMode {
  if (
    typeof value === "string" &&
    reactCompilerModes.includes(value as ReactCompilerMode)
  ) {
    return value as ReactCompilerMode;
  }

  throw new Error(
    `${source} must be ${reactCompilerModes.join(" or ")}, received ${String(
      value
    )}`
  );
}
