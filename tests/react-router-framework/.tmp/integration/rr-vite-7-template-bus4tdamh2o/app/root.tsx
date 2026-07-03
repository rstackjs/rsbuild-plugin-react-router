
import { Links, Meta, Outlet, Scripts } from "react-router";
import { logImport } from "./routeImportTracker";
logImport("app/root.tsx");

export default function Root() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        hello world
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
        