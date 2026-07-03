
import {
  Meta,
  Links,
  Outlet,
  Routes,
  Route,
  Scripts,
  ScrollRestoration,
} from "react-router";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <div data-layout>
          {children}
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return (
    <>
      <h1 data-root>Root</h1>
      <Routes>
        <Route path="/" element={<h2 data-index>Index</h2>} />
      </Routes>
    </>
  );
}
              