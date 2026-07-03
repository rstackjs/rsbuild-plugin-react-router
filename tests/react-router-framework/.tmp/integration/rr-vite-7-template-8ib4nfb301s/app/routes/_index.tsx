
import { logImport } from "../routeImportTracker";
logImport("app/routes/_index.tsx");

// This should not cause an error on SSR because the module is not loaded
console.log(window);

export default function Component() {
  return "index";
}
        