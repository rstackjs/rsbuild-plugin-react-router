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

const startHydration = () => {
  hydrate();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startHydration, { once: true });
} else {
  startHydration();
}

const hot = (
  import.meta as unknown as {
    webpackHot?: {
      on(event: string, handler: () => void): void;
    };
  }
).webpackHot;

hot?.on('rsc:update', () => {
  requestAnimationFrame(() => {
    (
      window as unknown as { __reactRouterDataRouter?: DataRouter }
    ).__reactRouterDataRouter?.revalidate();
  });
});
