// imports
import { useState, useEffect } from "react";

export const meta = () => [{ title: "HMR updated title: 0" }]

// loader

export default function IndexRoute() {
  // hooks
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div id="index">
      <h2 data-title>Index</h2>
      <input />
      <p data-mounted>Mounted: {mounted ? "yes" : "no"}</p>
      <p data-hmr>HMR updated: 0</p>
      {/* elements */}
    </div>
  );
}