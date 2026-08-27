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

type RscHydrationWindow = Window & {
  __reactRouterDataRouter?: DataRouter;
  __reactRouterHdrActive?: boolean;
};

const hydrationWindow = window as RscHydrationWindow;

const InitialRscDataLoadGuard = ({
  active,
  children,
}: {
  active: boolean;
  children?: React.ReactNode;
}): React.ReactNode => {
  React.useEffect(() => {
    if (!active) {
      return;
    }

    let frame: number;
    const clearGuardOnceDataLoadStarts = () => {
      const router = hydrationWindow.__reactRouterDataRouter;
      if (
        router &&
        (router.state.initialized || router.state.navigation.state !== 'idle')
      ) {
        hydrationWindow.__reactRouterHdrActive = false;
        return;
      }
      frame = requestAnimationFrame(clearGuardOnceDataLoadStarts);
    };
    frame = requestAnimationFrame(clearGuardOnceDataLoadStarts);
    return () => cancelAnimationFrame(frame);
  }, [active]);
  return children;
};

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
        const needsInitialDataLoadGuard =
          payload.type === 'render' &&
          payload.matches.some(
            match =>
              match.clientLoader != null &&
              !match.hasLoader &&
              match.hydrateFallbackElement != null
          );

        // React Router's RSC single-fetch hydration skips its request while the
        // router is both idle and uninitialized. An implicitly hydrating
        // clientLoader with a fallback and no server loader can race the layout
        // effect that starts initialization, leaving it with an empty result
        // for parent routes. Its HDR guard already means “the initial data
        // request is required”; keep that guard active until router
        // initialization starts, then clear it in the effect above.
        if (needsInitialDataLoadGuard) {
          hydrationWindow.__reactRouterHdrActive = true;
        }
        hydrateRoot(
          document,
          React.createElement(
            React.StrictMode,
            null,
            React.createElement(
              InitialRscDataLoadGuard,
              { active: needsInitialDataLoadGuard },
              React.createElement(RSCHydratedRouter, {
                createFromReadableStream,
                payload,
              })
            )
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
