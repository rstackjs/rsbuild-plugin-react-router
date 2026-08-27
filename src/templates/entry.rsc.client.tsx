import 'virtual/react-router/unstable_rsc/inject-hmr-runtime';

import * as React from 'react';
import { startTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';
import type { DataRouter } from 'react-router';
import {
  unstable_createCallServer as createCallServer,
  unstable_getRSCStream as getRSCStream,
  unstable_RSCHydratedRouter as RSCHydratedRouter,
  type unstable_RSCPayload as RSCPayload,
} from 'react-router/dom';
import {
  createFromReadableStream,
  createTemporaryReferenceSet,
  encodeReply,
  setServerCallback,
} from 'react-server-dom-rspack/client.browser';

setServerCallback(
  createCallServer({
    createFromReadableStream,
    createTemporaryReferenceSet,
    encodeReply,
  })
);

const hydrate = () => {
  createFromReadableStream<RSCPayload>(getRSCStream()).then(
    payload => {
      startTransition(async () => {
        const formState =
          payload.type === 'render' ? await payload.formState : undefined;

        hydrateRoot(
          document,
          React.createElement(
            React.StrictMode,
            null,
            React.createElement(RSCHydratedRouter, {
              createFromReadableStream,
              payload,
            })
          ),
          {
            // @ts-expect-error React Router RSC formState is not typed yet.
            formState,
          }
        );
      });
    },
    error => {
      setTimeout(() => {
        throw error;
      });
    }
  );
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', hydrate, { once: true });
} else {
  hydrate();
}

// The RSC plugin emits an unqualified update for server-component changes; in
// that case navigate to refresh the route tree. The framework integration emits
// `{ revalidate: true }` for server-only data dependency changes, which can
// refresh loader data without remounting client or browser state.
//
// The RSC plugin's message has no payload; there is no `reload` flag (full
// reloads travel through the HMR runtime's own `full-reload` message).
const hot = (
  import.meta as unknown as {
    webpackHot?: {
      on(
        event: string,
        handler: (data?: { revalidate?: boolean }) => void
      ): void;
    };
  }
).webpackHot;

hot?.on('rsc:update', data => {
  requestAnimationFrame(() => {
    const router = (
      window as typeof window & { __reactRouterDataRouter?: DataRouter }
    ).__reactRouterDataRouter;
    if (data?.revalidate) {
      router?.revalidate();
      return;
    }
    if (router?.navigate) {
      const basename = router.basename || '/';
      let pathname = window.location.pathname;
      if (basename !== '/' && pathname.startsWith(basename)) {
        pathname = pathname.slice(basename.length) || '/';
        if (pathname[0] !== '/') pathname = '/' + pathname;
      }
      void router.navigate(
        pathname + window.location.search + window.location.hash,
        {
          replace: true,
          preventScrollReset: true,
        }
      );
    }
  });
});
