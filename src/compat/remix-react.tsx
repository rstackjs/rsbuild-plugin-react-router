import { createElement, type ReactElement } from 'react';
import { ServerRouter, type ServerRouterProps } from 'react-router';
import {
  useActionData as useActionDataRR,
  useLoaderData as useLoaderDataRR,
  useRouteLoaderData as useRouteLoaderDataRR,
} from 'react-router';
import type { SerializeFrom } from './responses.js';

export * from 'react-router';
export { HydratedRouter as RemixBrowser } from 'react-router/dom';
export type { HydratedRouterProps as RemixBrowserProps } from 'react-router/dom';
export { defer, json } from './responses.js';
export type {
  DeferFunction,
  JsonFunction,
  SerializeFrom,
  TypedDeferredData,
  TypedResponse,
} from './responses.js';

export function useLoaderData<T = unknown>(): SerializeFrom<T> {
  return useLoaderDataRR() as SerializeFrom<T>;
}

export function useActionData<T = unknown>(): SerializeFrom<T> | undefined {
  return useActionDataRR() as SerializeFrom<T> | undefined;
}

export function useRouteLoaderData<T = unknown>(
  routeId: string
): SerializeFrom<T> | undefined {
  return useRouteLoaderDataRR(routeId) as SerializeFrom<T> | undefined;
}

export interface RemixServerProps extends ServerRouterProps {
  /** @deprecated Abort the render stream in entry.server instead. */
  abortDelay?: number;
}

let warnedAboutAbortDelay = false;

export function RemixServer({
  abortDelay,
  ...props
}: RemixServerProps): ReactElement {
  if (abortDelay !== undefined && !warnedAboutAbortDelay) {
    warnedAboutAbortDelay = true;
    console.warn(
      '[rsbuild-plugin-react-router] RemixServer abortDelay does not control React Router streaming. Abort the render stream in entry.server instead.'
    );
  }
  return createElement(ServerRouter, props);
}
