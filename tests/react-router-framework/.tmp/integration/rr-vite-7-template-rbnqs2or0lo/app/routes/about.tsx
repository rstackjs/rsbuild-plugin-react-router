
import { useActionData, useLoaderData } from "react-router";

export function meta({ loaderData }) {
  return [{
    title: "About Title: " + loaderData
  }];
}

export function clientLoader() {
  return "About Loader Data";
}

export function clientAction() {
  return "About Action Data";
}

export default function Component() {
  let data = useLoaderData();
  let actionData = useActionData();

  return (
    <>
      <h2 data-route>About</h2>
      <p data-loader-data>{data}</p>
      <p data-action-data>{actionData}</p>
    </>
  );
}
              