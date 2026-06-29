import type { Route } from './+types/_index';
import { Link } from 'react-router';

import { ClientCounter } from '~/client-counter';
import { getRscShowcase } from '~/rsc-data';

export async function loader() {
  return getRscShowcase();
}

export function ServerComponent({ loaderData }: Route.ServerComponentProps) {
  return (
    <section className="page-shell hero-panel">
      <div className="hero-copy">
        <h1>Rsbuild React Router RSC</h1>
        <p data-testid="server-message">{loaderData.message}</p>
        <p className="server-element">{loaderData.element}</p>
      </div>

      <div className="interaction-panel">
        <p>
          This route renders through React Router RSC Framework Mode and mounts a
          small client island inside the server-first route.
        </p>
        <ClientCounter />
        <Link className="text-link" to="/client">
          Visit the client-first route
        </Link>
      </div>
    </section>
  );
}
