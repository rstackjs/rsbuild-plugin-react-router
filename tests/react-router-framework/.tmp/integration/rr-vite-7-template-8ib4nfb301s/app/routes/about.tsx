
import * as React  from "react";
import { logImport } from "../routeImportTracker";
logImport("app/routes/about.tsx");

// This should not cause an error on SSR because the module is not loaded
console.log(window);

export default function Component() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <>
      {!mounted ? <span>Unmounted</span> : <span data-mounted>Mounted</span>}
    </>
  );
}
        