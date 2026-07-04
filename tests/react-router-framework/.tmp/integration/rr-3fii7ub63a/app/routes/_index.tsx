import { readServerSecret } from "rsc-server-only-package";

export async function loader() {
  return { secret: readServerSecret() };
}

export default function IndexRoute() {
  return <h1 data-route>Index route</h1>;
}