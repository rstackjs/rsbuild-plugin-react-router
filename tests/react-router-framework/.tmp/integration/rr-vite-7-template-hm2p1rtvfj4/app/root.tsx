
import * as React from "react";
import { Form, Link, Links, Meta, Outlet, Scripts, useLoaderData } from "react-router";

export function meta() {
  return [{
    title: "Root Title"
  }];
}

export function links() {
  return [{
    rel: "stylesheet",
    href: "styles-root.css"
  }];
}

export function loader() {
  return { message: "Root Loader Data" };
}

export default function Root() {
  let id = React.useId();
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
          <h1 data-root>Root</h1>
          <pre data-use-id>{id}</pre>
          <nav>
            <Link to="/about">/about</Link>
            <br/>

            <Form method="post" action="/about">
              <button type="submit">
                Submit /about
              </button>
            </Form>
            <br/>

            <Link to="/error">/error</Link>
            <br/>

            <Form method="post" action="/error">
              <button type="submit">
                Submit /error
              </button>
            </Form>
            <br/>
          </nav>
          <Outlet />
        <Scripts />
      </body>
    </html>
  );
}

export function HydrateFallback() {
  const id = React.useId();
  const loaderData = useLoaderData();
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <h1 data-loading>Loading SPA...</h1>
        <p data-loader-data>{loaderData?.message}</p>
        <pre data-use-id>{id}</pre>
        {hydrated ? <h3 data-hydrated>Hydrated</h3> : null}
        <Scripts />
      </body>
    </html>
  );
}
              