
import { Outlet, Scripts } from "react-router";

export default function Root() {
  return (
    <>
      <h1 data-root>Root</h1>
      <Outlet />
      <Scripts />
    </>
  );
}

export function HydrateFallback() {
  return (
    <>
      <h1 data-loading>Loading SPA...</h1>
      <Scripts />
    </>
  );
}
              