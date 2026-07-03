
import { Links, Meta, Outlet, Scripts } from "react-router";

export default function Root() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <div id="content">
          <h1>Root</h1>
          <Outlet />
        </div>
        <Scripts />
      </body>
    </html>
  );
}
              