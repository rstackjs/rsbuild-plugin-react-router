type LoaderCallback = (
  error: Error | null,
  code?: string | Buffer,
  map?: unknown
) => void;

type TransformArgs = {
  code: string;
  resource: string;
  resourcePath: string;
  resourceQuery?: string;
  environment: { name: string };
};

type TransformResult = {
  code: string;
  map?: unknown;
};

type ReactRouterRscTransform = (
  args: TransformArgs
) => Promise<TransformResult>;

type LoaderCompiler = {
  __reactRouterRscRouteTransform?: ReactRouterRscTransform;
};

type RscRouteTransformLoaderContext = {
  _compiler?: LoaderCompiler;
  async(): LoaderCallback;
  getOptions(): {
    getEnvironment(): { name: string };
  };
  resource: string;
  resourcePath: string;
  resourceQuery?: string;
};

export default function rscRouteTransformLoader(
  this: RscRouteTransformLoaderContext,
  source: string | Buffer,
  map: unknown
): void {
  const callback = this.async();
  const transform = this._compiler?.__reactRouterRscRouteTransform;

  if (!transform) {
    callback(null, source, map);
    return;
  }

  transform({
    code: source.toString(),
    resource: this.resource,
    resourcePath: this.resourcePath,
    resourceQuery: this.resourceQuery,
    environment: this.getOptions().getEnvironment(),
  })
    .then(result => {
      callback(null, result.code, result.map ?? map);
    })
    .catch(error => {
      callback(error instanceof Error ? error : new Error(String(error)));
    });
}
