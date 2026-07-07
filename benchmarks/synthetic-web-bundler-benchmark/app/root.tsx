import type { LinksFunction, MetaFunction } from 'react-router';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import { IntlProvider } from 'react-intl';
import globalStyles from './styles/global.css?url';

export const meta: MetaFunction = () => [
  { title: 'Synthetic Web Bundler Benchmark' },
  {
    name: 'description',
    content: 'A deterministic, non-product Rsbuild and Rsbuild benchmark.',
  },
];

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: globalStyles },
];

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
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <IntlProvider locale="en" messages={{}}>
      <Outlet />
    </IntlProvider>
  );
}
