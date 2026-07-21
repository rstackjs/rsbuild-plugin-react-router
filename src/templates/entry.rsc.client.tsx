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

// The single `rsc:update` navigate handler for RSC dev HMR. This is the
// hand-written mirror of the generated route-chunk snippet
// (`RSC_HMR_NAVIGATE_SNIPPET` in `src/rsc-route-transforms.ts`); keep the two in
// lockstep. The `inject-hmr-runtime` virtual module only self-accepts and no
// longer registers a second, racing handler here.
//
// The dev server emits `rsc:update` with no payload; there is no `reload` flag
// (full reloads travel through the HMR runtime's own `full-reload` message), so
// this handler always navigates.
const hot = (
  import.meta as unknown as {
    webpackHot?: {
      on(event: string, handler: () => void): void;
    };
  }
).webpackHot;

hot?.on('rsc:update', () => {
  requestAnimationFrame(() => {
    const router = (
      window as typeof window & { __reactRouterDataRouter?: DataRouter }
    ).__reactRouterDataRouter;
    if (router?.navigate) {
      const basename = router.basename || '/';
      let pathname = window.location.pathname;
      if (basename !== '/' && pathname.startsWith(basename)) {
        pathname = pathname.slice(basename.length) || '/';
        // A trailing-slash basename (e.g. "/mybase/") consumes the leading
        // slash, yielding a relative path that react-router resolves against
        // the current location and doubles. Force it back to absolute.
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
