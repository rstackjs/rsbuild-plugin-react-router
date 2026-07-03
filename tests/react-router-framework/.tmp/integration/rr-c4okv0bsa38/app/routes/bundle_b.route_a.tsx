
// THIS IS A ROUTE FILE
import { Outlet } from "react-router";
import { useState, useEffect } from "react";

export default function Route() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <>
      <div data-route-file="bundle_b.route_a.tsx">
        Route: bundle_b.route_a.tsx
        {mounted ? <span data-mounted> (Mounted)</span> : null}
      </div>
      <Outlet />
    </>
  );
}
    