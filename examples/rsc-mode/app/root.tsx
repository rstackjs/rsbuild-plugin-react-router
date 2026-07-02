import type { Route } from './+types/root';
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
} from 'react-router';

import './styles.css';

export function meta() {
  return [
    { title: 'Rsbuild RSC example' },
    {
      name: 'description',
      content: 'React Router RSC Framework Mode with Rsbuild',
    },
  ];
}

export function ServerLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <header className="site-header">
          <Link className="brand" to="/">
            RSC Mode
          </Link>
          <nav aria-label="Primary navigation">
            <Link to="/">Server route</Link>
            <Link to="/client">Client route</Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}

export function ServerComponent() {
  return <Outlet />;
}

export function ServerErrorBoundary({ error }: Route.ServerErrorBoundaryProps) {
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Unknown error';

  return (
    <section className="page-shell">
      <h1>Route error</h1>
      <p>{message}</p>
    </section>
  );
}
