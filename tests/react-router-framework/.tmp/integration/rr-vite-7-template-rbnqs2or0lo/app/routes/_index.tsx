
import * as React  from "react";
import { useLoaderData } from "react-router";

export function meta({ loaderData }) {
  return [{
    title: "Index Title: " + loaderData
  }];
}

export function links() {
  return [{
    rel: "stylesheet",
    href: "styles-index.css"
  }];
}

export async function clientLoader({ request }) {
  if (new URL(request.url).searchParams.has('slow')) {
    await new Promise(r => setTimeout(r, 1000));
  }
  return "Index Loader Data";
}

export default function Component() {
  let data = useLoaderData();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <>
      <h2 data-route>Index</h2>
      <p data-loader-data>{data}</p>
      {!mounted ? <h3>Unmounted</h3> : <h3 data-mounted>Mounted</h3>}
    </>
  );
}
              