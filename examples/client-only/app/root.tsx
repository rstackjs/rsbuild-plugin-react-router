import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <header style={{ padding: 16, borderBottom: '1px solid #ddd' }}>
          <strong>Client-only modules</strong>
        </header>
        <main style={{ padding: 16 }}>{children}</main>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}
