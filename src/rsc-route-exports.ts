export type RscRouteComponentExport = {
  readonly routeProperty:
    | 'Component'
    | 'Layout'
    | 'ErrorBoundary'
    | 'HydrateFallback';
  readonly clientExport:
    | 'default'
    | 'Layout'
    | 'ErrorBoundary'
    | 'HydrateFallback';
  readonly serverExport:
    | 'ServerComponent'
    | 'ServerLayout'
    | 'ServerErrorBoundary'
    | 'ServerHydrateFallback';
};

export type RscClientComponentExport = RscRouteComponentExport['clientExport'];
export type RscServerComponentExport = RscRouteComponentExport['serverExport'];

export const RSC_ROUTE_COMPONENT_EXPORTS: readonly RscRouteComponentExport[] = [
  {
    routeProperty: 'Component',
    clientExport: 'default',
    serverExport: 'ServerComponent',
  },
  {
    routeProperty: 'Layout',
    clientExport: 'Layout',
    serverExport: 'ServerLayout',
  },
  {
    routeProperty: 'ErrorBoundary',
    clientExport: 'ErrorBoundary',
    serverExport: 'ServerErrorBoundary',
  },
  {
    routeProperty: 'HydrateFallback',
    clientExport: 'HydrateFallback',
    serverExport: 'ServerHydrateFallback',
  },
] as const;

export const RSC_MUTUALLY_EXCLUSIVE_ROUTE_EXPORTS: readonly (readonly [
  RscClientComponentExport,
  RscServerComponentExport,
])[] = RSC_ROUTE_COMPONENT_EXPORTS.map(
  ({ clientExport, serverExport }) => [clientExport, serverExport] as const
);

export const RSC_CLIENT_COMPONENT_EXPORTS: readonly RscClientComponentExport[] =
  RSC_ROUTE_COMPONENT_EXPORTS.map(({ clientExport }) => clientExport);

export const RSC_SERVER_COMPONENT_EXPORTS: readonly RscServerComponentExport[] =
  RSC_ROUTE_COMPONENT_EXPORTS.map(({ serverExport }) => serverExport);

export const describeRscRouteExportConflict = (
  clientExport: string,
  serverExport: string
): string => {
  const clientDescription =
    clientExport === 'default'
      ? 'a default export'
      : `a ${clientExport} export`;
  return `Module cannot have both ${clientDescription} and a ${serverExport} export`;
};
