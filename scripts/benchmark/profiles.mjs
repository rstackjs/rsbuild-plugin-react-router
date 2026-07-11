export const profiles = {
  smoke: [{ id: 'synthetic-48-ssr-esm', routeCount: 48, variant: 'ssr-esm' }],
  default: [
    { id: 'synthetic-256-ssr-esm', routeCount: 256, variant: 'ssr-esm' },
    {
      id: 'synthetic-256-ssr-esm-split',
      routeCount: 256,
      variant: 'ssr-esm-split',
    },
    {
      id: 'synthetic-256-spa',
      routeCount: 256,
      variant: 'spa',
    },
    {
      id: 'synthetic-256-sourcemaps',
      routeCount: 256,
      variant: 'ssr-esm',
      sourceMap: true,
    },
  ],
  ci: [
    { id: 'synthetic-1024-ssr-esm', routeCount: 1024, variant: 'ssr-esm' },
    {
      id: 'synthetic-1024-ssr-esm-split',
      routeCount: 1024,
      variant: 'ssr-esm-split',
    },
  ],
  'ci-small': [
    { id: 'synthetic-48-ssr-esm', routeCount: 48, variant: 'ssr-esm' },
    { id: 'synthetic-256-ssr-esm', routeCount: 256, variant: 'ssr-esm' },
    {
      id: 'synthetic-256-ssr-esm-split',
      routeCount: 256,
      variant: 'ssr-esm-split',
    },
    {
      id: 'synthetic-256-sourcemaps',
      routeCount: 256,
      variant: 'ssr-esm',
      sourceMap: true,
    },
  ],
  'ci-large': [
    { id: 'synthetic-1024-ssr-esm', routeCount: 1024, variant: 'ssr-esm' },
    {
      id: 'synthetic-1024-ssr-esm-split',
      routeCount: 1024,
      variant: 'ssr-esm-split',
    },
    {
      id: 'large-355-ssr-esm',
      routeCount: 355,
      variant: 'ssr-esm',
      fixture: 'large',
      devRoutePathOffset: 0,
    },
  ],
  full: [
    { id: 'synthetic-48-ssr-esm', routeCount: 48, variant: 'ssr-esm' },
    { id: 'synthetic-256-ssr-esm', routeCount: 256, variant: 'ssr-esm' },
    { id: 'synthetic-1024-ssr-esm', routeCount: 1024, variant: 'ssr-esm' },
    {
      id: 'synthetic-256-ssr-esm-split',
      routeCount: 256,
      variant: 'ssr-esm-split',
    },
    {
      id: 'synthetic-1024-ssr-esm-split',
      routeCount: 1024,
      variant: 'ssr-esm-split',
    },
    {
      id: 'synthetic-256-sourcemaps',
      routeCount: 256,
      variant: 'ssr-esm',
      sourceMap: true,
    },
    {
      id: 'large-355-ssr-esm',
      routeCount: 355,
      variant: 'ssr-esm',
      fixture: 'large',
      devRoutePathOffset: 0,
    },
  ],
  large: [
    {
      id: 'large-355-ssr-esm',
      routeCount: 355,
      variant: 'ssr-esm',
      fixture: 'large',
      devRoutePathOffset: 0,
    },
  ],
};
