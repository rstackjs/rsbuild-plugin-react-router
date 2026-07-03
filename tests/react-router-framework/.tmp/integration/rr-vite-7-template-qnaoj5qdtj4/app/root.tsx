
import { Outlet, Scripts } from "react-router";

export default function Root() {
  return (
    <html lang="en">
      <head></head>
      <body>
        <h1 data-root>Root</h1>
        <Scripts />
      </body>
    </html>
  );
}

export function HydrateFallback() {
  return (
    <html lang="en">
      <head></head>
      <body>
        <h1 data-loading>Loading SPA...</h1>
        <Scripts />
      </body>
    </html>
  );
}
              