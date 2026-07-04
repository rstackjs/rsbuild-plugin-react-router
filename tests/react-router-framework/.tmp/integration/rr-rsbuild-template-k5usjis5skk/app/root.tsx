
import { Links, Meta, Outlet, Scripts } from "react-router";

export const loader = () => "ROOT_DATA";

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
          