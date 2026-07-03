
import * as React  from "react";
import { useLoaderData } from "react-router";

export async function clientLoader({ request }) {
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
              