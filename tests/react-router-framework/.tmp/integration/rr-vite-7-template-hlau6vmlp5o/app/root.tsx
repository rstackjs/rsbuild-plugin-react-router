
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
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

let count = 0;
export function clientLoader() {
  return ++count;
}

export default function Root({ loaderData }) {
  return (
    <>
      <h1>{loaderData}</h1>
      <Outlet />
    </>
  );
}
              