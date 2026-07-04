// imports
import { direct } from "../direct-hdr-dep"
import { MyComponent } from "../component";
import { useLoaderData } from "react-router"
import { useState, useEffect } from "react";

export const meta = () => [{ title: "HMR updated title: 1" }]

// loader
export const loader = () => ({ message: "HDR updated: route & " + direct });

export default function IndexRoute() {
  // hooks
const { message } = useLoaderData<typeof loader>();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div id="index">
      <h2 data-title>Index</h2>
      <input />
      <p data-mounted>Mounted: {mounted ? "yes" : "no"}</p>
      <p data-hmr>HMR updated: 3</p>
      {/* elements */}
<MyComponent />
<p data-hdr>{message}</p>
    </div>
  );
}