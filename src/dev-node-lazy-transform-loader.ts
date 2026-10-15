import remapping, { type SourceMapInput } from '@jridgewell/remapping';
import type { LoaderDefinition } from '@rspack/core';
import { transformNodeLazyImports } from './dev-node-lazy-transform.js';

const loader: LoaderDefinition<{ runtimeRequest: string }> = function (
  source,
  inputMap
) {
  const callback = this.async();
  try {
    const result = transformNodeLazyImports(
      String(source),
      this.resourcePath,
      this.getOptions().runtimeRequest
    );
    const map =
      result.map && inputMap
        ? JSON.parse(
            remapping(
              [result.map as SourceMapInput, inputMap as SourceMapInput],
              () => null
            ).toString()
          )
        : (result.map ?? inputMap);
    callback(null, result.code, map ?? undefined);
  } catch (error) {
    callback(error instanceof Error ? error : new Error(String(error)));
  }
};
export default loader;
