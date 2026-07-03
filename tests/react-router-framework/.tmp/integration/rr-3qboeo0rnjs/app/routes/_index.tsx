
import { useState, useEffect } from "react";
import { Link } from "react-router"

export default function IndexRoute() {
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
      <Link to="/other">other</Link>
    </div>
  );
}
  