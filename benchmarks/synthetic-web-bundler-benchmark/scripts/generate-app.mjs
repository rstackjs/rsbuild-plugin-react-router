import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const GENERATOR_VERSION = 7;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const configPath = path.join(root, 'synthetic.config.json');
const manifestPath = path.join(root, 'app/generated/.manifest.json');
const force = process.argv.includes('--force');
const configSource = await fs.readFile(configPath, 'utf8');
const config = {
  ...JSON.parse(configSource),
  ...readConfigOverrides(process.env),
};
const generatorHash = createHash('sha256')
  .update(`${GENERATOR_VERSION}\0${JSON.stringify(config)}`)
  .digest('hex');

function readConfigOverrides(env) {
  const routes = readPositiveIntegerEnv(env, 'SYNTHETIC_ROUTES');
  return routes == null ? {} : { routes };
}

function readPositiveIntegerEnv(env, name) {
  const value = env[name];
  if (value == null || value === '') {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer`);
  }
  return parsed;
}

if (!force) {
  try {
    const existing = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    await fs.access(path.join(root, 'public/generated/locales'));
    if (existing.generatorHash === generatorHash) {
      console.log(
        `Synthetic graph is current (${existing.stats.codeModules.toLocaleString()} code modules).`
      );
      process.exit(0);
    }
  } catch {
    // A missing or stale graph is regenerated below.
  }
}

const generatedRoot = path.join(root, 'app/generated');
const publicGeneratedRoot = path.join(root, 'public/generated');
await fs.rm(generatedRoot, { force: true, recursive: true });
await fs.rm(publicGeneratedRoot, { force: true, recursive: true });

const files = [];
const addFile = (relativePath, contents) => {
  files.push([path.join(root, relativePath), contents]);
};
const pad = (value, width = 4) => String(value).padStart(width, '0');
const syntheticTokens = (scope, count, width = 78) =>
  JSON.stringify(
    Array.from(
      { length: count },
      (_, index) =>
        `${scope}-${pad(index)}-${'x'.repeat(Math.max(1, width - scope.length - 10))}`
    )
  );

addFile(
  'app/generated/shared/catalog.ts',
  `export const syntheticCatalog = ${syntheticTokens('shared-catalog', 96, 92)} as const;\n\n` +
    `export function catalogValue(index: number): string {\n` +
    `  return syntheticCatalog[index % syntheticCatalog.length];\n` +
    `}\n`
);
addFile(
  'app/generated/shared/types.ts',
  `export type SyntheticDatum = { id: string; label: string; score: number };\n` +
    `export type SyntheticCardProps = { feature: number; position: number };\n` +
    `export const sharedTypeTokens = ${syntheticTokens('shared-types', 64, 88)} as const;\n`
);

for (let index = 0; index < config.svgAssets; index += 1) {
  const id = pad(index);
  const decorativePaths = Array.from({ length: 30 }, (_, pathIndex) => {
    const offset = (index * 7 + pathIndex * 11) % 88;
    return `<path d="M${offset} ${pathIndex + 2}h${8 + (pathIndex % 7)}v${3 + (index % 5)}H${offset}z" opacity="${(
      0.2 +
      (pathIndex % 7) / 10
    ).toFixed(1)}"/>`;
  }).join('');
  addFile(
    `app/generated/assets/icons/icon-${id}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 96" role="img" aria-labelledby="title-${id}"><title id="title-${id}">Synthetic icon ${id}</title><defs><linearGradient id="gradient-${id}"><stop stop-color="#6ea8fe"/><stop offset="1" stop-color="#b197fc"/></linearGradient></defs><rect width="128" height="96" rx="18" fill="url(#gradient-${id})"/>${decorativePaths}<circle cx="64" cy="48" r="${18 + (index % 20)}" fill="none" stroke="white" stroke-width="3"/></svg>\n`
  );
}

for (let index = 0; index < config.cssModules; index += 1) {
  const id = pad(index);
  const rules = Array.from({ length: 40 }, (_, ruleIndex) => {
    const hue = (index * 13 + ruleIndex * 17) % 360;
    return `.token${ruleIndex}{--synthetic-hue:${hue};color:hsl(${hue} 70% 78%);border-color:hsl(${hue} 50% 42%);}`;
  }).join('\n');
  addFile(
    `app/generated/styles/style-${id}.module.css`,
    `.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:1rem;padding:1rem;}\n` +
      `.card{contain:content;padding:1rem;border:1px solid #384052;border-radius:.75rem;background:linear-gradient(145deg,#181c25,#11141b);}\n` +
      `.metric{font-variant-numeric:tabular-nums;color:#b8c4dc;}\n` +
      `.icon{width:2rem;height:2rem;float:right;}\n${rules}\n`
  );
}

for (let index = 0; index < config.restrictedModules; index += 1) {
  const id = pad(index);
  addFile(
    `app/generated/restricted/restricted-${id}.tsx`,
    `const restrictedDemoMarker = "synthetic-restricted-marker-${id}";\n` +
      `const restrictedPayload = ${syntheticTokens(`restricted-${id}`, 24, 84)} as const;\n\n` +
      `export function RestrictedCard() {\n` +
      `  return <aside data-marker={restrictedDemoMarker}>{restrictedPayload[0]}</aside>;\n` +
      `}\n`
  );
}

for (let index = 0; index < config.workers; index += 1) {
  const id = pad(index);
  addFile(
    `app/generated/workers/worker-${id}.ts`,
    `export {};\nconst weights = ${JSON.stringify(
      Array.from({ length: 128 }, (_, weightIndex) =>
        Number(((((index + 1) * (weightIndex + 3)) % 997) / 997).toFixed(6))
      )
    )};\n` +
      `self.onmessage = (event: MessageEvent<number[]>) => {\n` +
      `  const score = event.data.reduce((sum, value, position) => sum + value * weights[position % weights.length], 0);\n` +
      `  self.postMessage({ worker: ${index}, score });\n` +
      `};\n`
  );
}

const routeEntries = [];
let globalComponentIndex = 0;
for (let featureIndex = 0; featureIndex < config.routes; featureIndex += 1) {
  const featureId = pad(featureIndex);
  const featureRoot = `app/generated/features/feature-${featureId}`;
  routeEntries.push(
    `  route("feature/${featureId}", "generated/routes/route-${featureId}.tsx"),`
  );

  for (
    let utilityIndex = 0;
    utilityIndex < config.utilitiesPerRoute;
    utilityIndex += 1
  ) {
    const utilityId = pad(utilityIndex, 2);
    const previousImport =
      utilityIndex === 0
        ? `import { catalogValue } from "../../../shared/catalog";\n`
        : `import { compute${pad(utilityIndex - 1, 2)} } from "./utility-${pad(
            utilityIndex - 1,
            2
          )}";\n`;
    const previousExpression =
      utilityIndex === 0
        ? `catalogValue(input + ${featureIndex})`
        : `String(compute${pad(utilityIndex - 1, 2)}(input + ${utilityIndex}))`;
    addFile(
      `${featureRoot}/utils/utility-${utilityId}.ts`,
      previousImport +
        `const tokens = ${syntheticTokens(
          `feature-${featureId}-utility-${utilityId}`,
          28,
          90
        )} as const;\n` +
        `export function compute${utilityId}(input: number): number {\n` +
        `  const value = Math.abs(Math.trunc(input)) + ${featureIndex + utilityIndex};\n` +
        `  return value + ${previousExpression}.length + tokens[value % tokens.length].length;\n` +
        `}\n`
    );
  }

  for (
    let componentIndex = 0;
    componentIndex < config.componentsPerRoute;
    componentIndex += 1
  ) {
    const componentId = pad(componentIndex, 2);
    const componentName = `Feature${featureId}Card${componentId}`;
    const usesCompiler = globalComponentIndex % config.reactCompilerEvery === 0;
    const usesFormatJs = globalComponentIndex % config.formatJsEvery === 0;
    const usesSecret = globalComponentIndex % config.secretEvery === 0;
    const usesRestricted =
      globalComponentIndex % config.restrictedImportEvery === 0;
    const usesSvg = globalComponentIndex % 3 === 0;
    const iconIndex = globalComponentIndex % config.svgAssets;
    const restrictedIndex = globalComponentIndex % config.restrictedModules;
    const imports = [
      `import { catalogValue, syntheticCatalog } from "../../../shared/catalog";`,
      `import type { SyntheticCardProps, SyntheticDatum } from "../../../shared/types";`,
      ...Array.from(
        { length: config.utilitiesPerRoute },
        (_, utilityIndex) =>
          `import { compute${pad(utilityIndex, 2)} } from "../utils/utility-${pad(
            utilityIndex,
            2
          )}";`
      ),
      ...(usesFormatJs
        ? [`import { defineMessages, useIntl } from "react-intl";`]
        : []),
      ...(usesSvg
        ? [
            `import Icon from "../../../assets/icons/icon-${pad(
              iconIndex
            )}.svg?react";`,
          ]
        : []),
      ...(usesRestricted
        ? [
            `import { RestrictedCard } from "../../../restricted/restricted-${pad(
              restrictedIndex
            )}";`,
          ]
        : []),
    ].join('\n');
    const messageDeclaration = usesFormatJs
      ? `\nconst messages = defineMessages({\n  label: {\n    id: "synthetic.feature.${featureId}.card.${componentId}",\n    defaultMessage: "Synthetic card ${componentId} in feature ${featureId}",\n    description: "Label for a generated card in the public bundler benchmark.",\n  },\n});\n`
      : '';
    const payload = syntheticTokens(
      `feature-${featureId}-component-${componentId}`,
      config.payloadEntriesPerComponent,
      110
    );
    const secretDeclaration = usesSecret
      ? `const secretHash = __syntheticSecret("synthetic-secret-${featureId}-${componentId}");`
      : `const secretHash = ${featureIndex * 100 + componentIndex};`;
    const labelExpression = usesFormatJs
      ? `intl.formatMessage(messages.label)`
      : `catalogValue(feature + position)`;
    const compilerDirective = usesCompiler ? `  "use memo";\n` : '';
    addFile(
      `${featureRoot}/components/card-${componentId}.tsx`,
      `${imports}\n${messageDeclaration}\n` +
        `const payload = ${payload} as const;\n${secretDeclaration}\n\n` +
        `export function ${componentName}({ feature, position }: SyntheticCardProps) {\n` +
        compilerDirective +
        (usesFormatJs ? `  const intl = useIntl();\n` : '') +
        `  const computations = [${Array.from(
          { length: config.utilitiesPerRoute },
          (_, utilityIndex) =>
            `compute${pad(utilityIndex, 2)}(feature + position)`
        ).join(', ')}];\n` +
        `  const score = computations.reduce((sum, value) => sum + value, 0);\n` +
        `  const datum: SyntheticDatum = { id: payload[position % payload.length], label: ${labelExpression}, score };\n` +
        `  const shade = 0.2 + (Math.abs(score) % 10000) / 10000 * 0.7;\n` +
        `  const day = new Date(Date.UTC(2025, 0, position + 1)).toISOString().slice(0, 10);\n` +
        `  const className = \`synthetic-card grid gap-2 rounded-xl border p-4 shadow-sm min-h-[${
          32 + (globalComponentIndex % 800)
        }px] bg-[hsl(${globalComponentIndex % 360}_35%_18%)] \${syntheticCatalog.length > 0 ? "ready" : ""}\`;\n` +
        `  return (\n    <article className={className} data-secret-hash={secretHash} style={{ opacity: shade }}>\n` +
        (usesSvg ? `      <Icon aria-hidden width={32} height={32} />\n` : '') +
        `      <h2>{datum.label}</h2><p>{datum.id}</p><output>{datum.score}</output><time>{day}</time>\n` +
        (usesRestricted
          ? `      {__RESTRICTED__ ? <RestrictedCard /> : null}\n`
          : '') +
        `    </article>\n  );\n}\n`
    );
    globalComponentIndex += 1;
  }

  for (
    let lazyIndex = 0;
    lazyIndex < config.lazyModulesPerRoute;
    lazyIndex += 1
  ) {
    const lazyId = pad(lazyIndex, 2);
    const firstCard = pad((lazyIndex * 2) % config.componentsPerRoute, 2);
    const secondCard = pad((lazyIndex * 2 + 1) % config.componentsPerRoute, 2);
    addFile(
      `${featureRoot}/lazy/lazy-${lazyId}.tsx`,
      `import { Feature${featureId}Card${firstCard} } from "../components/card-${firstCard}";\n` +
        `import { Feature${featureId}Card${secondCard} } from "../components/card-${secondCard}";\n` +
        `const lazyPayload = ${syntheticTokens(
          `feature-${featureId}-lazy-${lazyId}`,
          32,
          96
        )} as const;\n\n` +
        `export default function Lazy${featureId}${lazyId}() {\n` +
        `  "use memo";\n` +
        `  return <section><p>{lazyPayload[0]}</p><Feature${featureId}Card${firstCard} feature={${featureIndex}} position={${
          lazyIndex * 2
        }} /><Feature${featureId}Card${secondCard} feature={${featureIndex}} position={${
          lazyIndex * 2 + 1
        }} /></section>;\n` +
        `}\n`
    );
  }

  const componentImports = Array.from(
    { length: config.componentsPerRoute },
    (_, componentIndex) => {
      const componentId = pad(componentIndex, 2);
      return `import { Feature${featureId}Card${componentId} } from "./components/card-${componentId}";`;
    }
  ).join('\n');
  const componentList = Array.from(
    { length: config.componentsPerRoute },
    (_, componentIndex) => `Feature${featureId}Card${pad(componentIndex, 2)}`
  ).join(', ');
  const lazyList = Array.from(
    { length: config.lazyModulesPerRoute },
    (_, lazyIndex) => `() => import("./lazy/lazy-${pad(lazyIndex, 2)}")`
  ).join(', ');
  const styleIndex = featureIndex % config.cssModules;
  const workerIndex = featureIndex % config.workers;
  const shellUsesCompiler = featureIndex % 2 === 0;
  const shellUsesFormat = featureIndex % 3 === 0;
  const shellUsesSecret = featureIndex % 4 === 0;
  addFile(
    `${featureRoot}/shell.tsx`,
    `${componentImports}\n` +
      (shellUsesFormat
        ? `import { defineMessages, useIntl } from "react-intl";\n`
        : '') +
      `import styles from "../../styles/style-${pad(styleIndex)}.module.css";\n` +
      (shellUsesFormat
        ? `const shellMessages = defineMessages({ title: { id: "synthetic.feature.${featureId}.title", defaultMessage: "Feature ${featureId}", description: "Heading for a generated benchmark feature route." } });\n`
        : '') +
      `const cards = [${componentList}] as const;\n` +
      `export const lazyPanels = [${lazyList}] as const;\n` +
      (shellUsesSecret
        ? `const shellSecret = __syntheticSecret("synthetic-shell-secret-${featureId}");\n`
        : `const shellSecret = ${featureIndex};\n`) +
      `export function Feature${featureId}Shell() {\n` +
      (shellUsesCompiler ? `  "use memo";\n` : '') +
      (shellUsesFormat ? `  const intl = useIntl();\n` : '') +
      `  const startWorker = () => { const worker = new Worker(new URL("../../workers/worker-${pad(
        workerIndex
      )}.ts", import.meta.url), { type: "module" }); worker.postMessage([${featureIndex}, cards.length]); };\n` +
      `  const loadLazyPanel = () => { void lazyPanels[${featureIndex} % lazyPanels.length](); };\n` +
      `  return <main data-feature="${featureId}" data-secret-hash={shellSecret}><header><h1>${
        shellUsesFormat
          ? '{intl.formatMessage(shellMessages.title)}'
          : `Feature ${featureId}`
      }</h1><button onClick={startWorker}>Run worker</button><button onClick={loadLazyPanel}>Load lazy panel</button></header><div className={styles.grid}>{cards.map((Card, position) => <Card key={position} feature={${featureIndex}} position={position} />)}</div></main>;\n` +
      `}\n`
  );

  addFile(
    `app/generated/routes/route-${featureId}.tsx`,
    `import { FormattedMessage } from "react-intl";\n` +
      `import { Feature${featureId}Shell } from "../features/feature-${featureId}/shell";\n` +
      `const routePayload = ${syntheticTokens(`route-${featureId}`, 24, 104)} as const;\n` +
      `export async function loader() { return { feature: ${featureIndex}, sample: routePayload[${
        featureIndex % 24
      }] }; }\n` +
      `export async function action() { return { accepted: true, feature: ${featureIndex} }; }\n` +
      `export async function clientLoader() { return { clientFeature: ${featureIndex}, sample: routePayload[${
        (featureIndex + 1) % 24
      }] }; }\n` +
      `export async function clientAction() { return { clientAccepted: true, feature: ${featureIndex} }; }\n` +
      `export function meta() { return [{ title: "Synthetic feature ${featureId}" }]; }\n` +
      `export function headers() { return { "x-synthetic-feature": "${featureId}" }; }\n` +
      `export function HydrateFallback() { return <p>Loading synthetic feature ${featureId}</p>; }\n` +
      `export function ErrorBoundary() { return <p>Synthetic feature ${featureId} failed safely.</p>; }\n` +
      `export function shouldRevalidate() { return true; }\n` +
      `export const handle = { syntheticFeature: ${featureIndex}, category: "benchmark" };\n` +
      `export default function Feature${featureId}Route() {\n` +
      `  "use memo";\n` +
      `  return <><span hidden><FormattedMessage id="synthetic.route.${featureId}" defaultMessage="Route ${featureId}" description="Hidden generated route label used to exercise FormatJS transforms." /></span><Feature${featureId}Shell /></>;\n` +
      `}\n`
  );
}

addFile(
  'app/generated/route-config.ts',
  `import { route, type RouteConfig } from "@react-router/dev/routes";\n\n` +
    `export const generatedRoutes = [\n${routeEntries.join('\n')}\n] satisfies RouteConfig;\n`
);

async function writeFiles(entries) {
  const batchSize = 64;
  for (let offset = 0; offset < entries.length; offset += batchSize) {
    await Promise.all(
      entries
        .slice(offset, offset + batchSize)
        .map(async ([filePath, contents]) => {
          await fs.mkdir(path.dirname(filePath), { recursive: true });
          await fs.writeFile(filePath, contents);
        })
    );
  }
}

await writeFiles(files);

const localeDirectory = path.join(publicGeneratedRoot, 'locales');
await fs.mkdir(localeDirectory, { recursive: true });
const baseLocaleBytes = Math.floor(
  config.localeTotalBytes / config.localeFiles
);
let localeBytesWritten = 0;
for (let index = 0; index < config.localeFiles; index += 1) {
  const targetBytes =
    baseLocaleBytes +
    (index < config.localeTotalBytes % config.localeFiles ? 1 : 0);
  const prefix = `{"locale":"synthetic-${pad(index, 3)}","payload":"`;
  const suffix = `"}\n`;
  const payloadBytes =
    targetBytes - Buffer.byteLength(prefix) - Buffer.byteLength(suffix);
  if (payloadBytes < 0) {
    throw new Error(
      `localeTotalBytes/localeFiles is too small: synthetic-${pad(
        index,
        3
      )}.json needs at least ${
        Buffer.byteLength(prefix) + Buffer.byteLength(suffix)
      } bytes`
    );
  }
  const contents = `${prefix}${'x'.repeat(payloadBytes)}${suffix}`;
  await fs.writeFile(
    path.join(localeDirectory, `synthetic-${pad(index, 3)}.json`),
    contents
  );
  localeBytesWritten += Buffer.byteLength(contents);
}

const stats = {
  codeModules:
    config.routes *
      (2 +
        config.componentsPerRoute +
        config.utilitiesPerRoute +
        config.lazyModulesPerRoute) +
    config.workers +
    config.restrictedModules +
    3,
  cssModules: config.cssModules,
  dynamicImports: config.routes * config.lazyModulesPerRoute,
  localeBytes: localeBytesWritten,
  localeFiles: config.localeFiles,
  routes: config.routes,
  svgAssets: config.svgAssets,
};
await fs.writeFile(
  manifestPath,
  `${JSON.stringify({ generatorHash, generatorVersion: GENERATOR_VERSION, stats }, null, 2)}\n`
);

console.log(`Generated ${stats.codeModules.toLocaleString()} code modules.`);
console.log(
  `Generated ${stats.routes.toLocaleString()} routes and ${stats.dynamicImports.toLocaleString()} dynamic imports.`
);
console.log(
  `Generated ${stats.svgAssets.toLocaleString()} SVGs and ${stats.cssModules.toLocaleString()} CSS modules.`
);
console.log(
  `Generated ${(stats.localeBytes / 1024 / 1024).toFixed(1)} MiB of public locale JSON.`
);
