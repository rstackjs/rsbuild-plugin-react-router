import { resolve } from 'pathe';
import type { Route } from './types.js';

const js = String.raw;

type RouteNode = Route & {
  children?: RouteNode[];
};

const sortRoutes = (routes: RouteNode[]): RouteNode[] =>
  [...routes].sort((a, b) => a.id.localeCompare(b.id));

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

  const sortChildren = (route: RouteNode): RouteNode => {
    if (route.children?.length) {
      route.children = sortRoutes(route.children).map(sortChildren);
    } else {
      delete route.children;
    }
    return route;
  };

  return sortRoutes(roots).map(sortChildren);
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

export const createRscRouteConfig = ({
  appDirectory,
  routes,
}: {
  appDirectory: string;
  routes: Record<string, Route>;
}): string => {
  let code = js`
function frameworkRoute(lazy) {
  return async () => {
    const mod = await lazy();
    let Component;
    let Layout;
    let ErrorBoundary;
    let HydrateFallback;
    if ("default" in mod && mod.default) {
      if ("ServerComponent" in mod && mod.ServerComponent) {
        throw new Error("Module cannot have both a default export and a ServerComponent export");
      }
      Component = mod.default;
    } else if ("ServerComponent" in mod && mod.ServerComponent) {
      Component = mod.ServerComponent;
    }
    if ("Layout" in mod && mod.Layout) {
      if ("ServerLayout" in mod && mod.ServerLayout) {
        throw new Error("Module cannot have both a Layout export and a ServerLayout export");
      }
      Layout = mod.Layout;
    } else if ("ServerLayout" in mod && mod.ServerLayout) {
      Layout = mod.ServerLayout;
    }
    if ("ErrorBoundary" in mod && mod.ErrorBoundary) {
      if ("ServerErrorBoundary" in mod && mod.ServerErrorBoundary) {
        throw new Error("Module cannot have both an ErrorBoundary export and a ServerErrorBoundary export");
      }
      ErrorBoundary = mod.ErrorBoundary;
    } else if ("ServerErrorBoundary" in mod && mod.ServerErrorBoundary) {
      ErrorBoundary = mod.ServerErrorBoundary;
    }
    if ("HydrateFallback" in mod && mod.HydrateFallback) {
      if ("ServerHydrateFallback" in mod && mod.ServerHydrateFallback) {
        throw new Error("Module cannot have both a HydrateFallback export and a ServerHydrateFallback export");
      }
      HydrateFallback = mod.HydrateFallback;
    } else if ("ServerHydrateFallback" in mod && mod.ServerHydrateFallback) {
      HydrateFallback = mod.ServerHydrateFallback;
    }

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
