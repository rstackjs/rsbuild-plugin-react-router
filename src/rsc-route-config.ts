import { resolve } from 'pathe';
import type { Route } from './types.js';
import {
  describeRscRouteExportConflict,
  RSC_ROUTE_COMPONENT_EXPORTS,
} from './rsc-route-exports.js';

const js = String.raw;

type RouteNode = Route & {
  children?: RouteNode[];
};

const createRouteTree = (routes: Record<string, Route>): RouteNode[] => {
  const nodes = new Map<string, RouteNode>();
  for (const route of Object.values(routes)) {
    nodes.set(route.id, { ...route, children: [] });
  }

  const roots: RouteNode[] = [];
  for (const route of nodes.values()) {
    if (route.parentId) {
      const parent = nodes.get(route.parentId);
      if (parent) {
        parent.children?.push(route);
        continue;
      }
    }
    roots.push(route);
  }

  const normalizeChildren = (route: RouteNode): RouteNode => {
    if (route.children?.length) {
      route.children = route.children.map(normalizeChildren);
    } else {
      delete route.children;
    }
    return route;
  };

  return roots.map(normalizeChildren);
};

const appendRoute = (
  code: string,
  route: RouteNode,
  appDirectory: string
): string => {
  const routeFile = resolve(appDirectory, route.file);
  code += '{';
  code += `lazy: frameworkRoute(() => import(${JSON.stringify(routeFile)})),`;
  code += `id: ${JSON.stringify(route.id)},`;
  if (typeof route.path === 'string') {
    code += `path: ${JSON.stringify(route.path)},`;
  }
  if (route.index) {
    code += 'index: true,';
  }
  if (route.caseSensitive) {
    code += 'caseSensitive: true,';
  }
  if (route.children?.length) {
    code += 'children:[';
    for (const child of route.children) {
      code = appendRoute(code, child, appDirectory);
    }
    code += ']';
  }
  code += '},';
  return code;
};

const createComponentResolutionCode = (): string =>
  RSC_ROUTE_COMPONENT_EXPORTS.map(
    ({ routeProperty, clientExport, serverExport }) => {
      const clientKey = JSON.stringify(clientExport);
      const serverKey = JSON.stringify(serverExport);
      const error = describeRscRouteExportConflict(clientExport, serverExport);
      return js`
    let ${routeProperty};
    if (${clientKey} in mod && mod[${clientKey}]) {
      if (${serverKey} in mod && mod[${serverKey}]) {
        throw new Error(${JSON.stringify(error)});
      }
      ${routeProperty} = mod[${clientKey}];
    } else if (${serverKey} in mod && mod[${serverKey}]) {
      ${routeProperty} = mod[${serverKey}];
    }`;
    }
  ).join('\n');

export const createRscRouteConfig = ({
  appDirectory,
  routes,
}: {
  appDirectory: string;
  routes: Record<string, Route>;
}): string => {
  const componentResolutionCode = createComponentResolutionCode();
  let code = js`
function frameworkRoute(lazy) {
  return async () => {
    const mod = await lazy();
${componentResolutionCode}

    const {
      action,
      clientAction,
      clientLoader,
      clientMiddleware,
      handle,
      headers,
      links,
      loader,
      meta,
      middleware,
      shouldRevalidate,
    } = mod;

    return {
      Component,
      ErrorBoundary,
      HydrateFallback,
      Layout,
      action,
      clientAction,
      clientLoader,
      clientMiddleware,
      handle,
      headers,
      links,
      loader,
      meta,
      middleware,
      shouldRevalidate,
    };
  };
}
export default [`;

  for (const route of createRouteTree(routes)) {
    code = appendRoute(code, route, appDirectory);
  }

  return `${code}];\n`;
};

export const createRscInternalClientModule = (): string => js`
"use client";

export {
  BrowserRouter,
  Form,
  HashRouter,
  Link,
  Links,
  MemoryRouter,
  Meta,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Router,
  RouterProvider,
  Routes,
  ScrollRestoration,
  StaticRouter,
  StaticRouterProvider,
  UNSAFE_AwaitContextProvider,
  UNSAFE_WithComponentProps,
  UNSAFE_WithErrorBoundaryProps,
  UNSAFE_WithHydrateFallbackProps,
  unstable_HistoryRouter,
} from "react-router";
`;
