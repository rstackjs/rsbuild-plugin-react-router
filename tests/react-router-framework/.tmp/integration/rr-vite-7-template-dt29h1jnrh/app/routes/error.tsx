
import { useRouteError } from "react-router";

export async function clientLoader({ serverLoader }) {
  await serverLoader();
  return null;
}

export async function clientAction({ serverAction }) {
  await serverAction();
  return null;
}

export default function Component() {
  return <h2>Error</h2>;
}

export function ErrorBoundary() {
  let error = useRouteError();
  return <pre data-error>{error.data}</pre>
}
              