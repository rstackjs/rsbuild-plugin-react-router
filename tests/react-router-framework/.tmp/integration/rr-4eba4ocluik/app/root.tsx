
// THIS IS A ROUTE FILE
import { Links, Meta, Outlet, Scripts } from "react-router";

export default function Root() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
  