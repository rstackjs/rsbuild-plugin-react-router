import { createRsbuildConfig } from "./build/rsbuild-config-factory";

export default createRsbuildConfig({
  appBabel: false,
  devBuildCache: false,
  devServerOutput: "module",
  devSourceMap: false,
  devWriteToDisk: false,
  lightningcss: true,
  nodeTailwind: false,
  parallelBabel: true,
  parallelSvgr: true,
  tailwindOptimize: true,
});
