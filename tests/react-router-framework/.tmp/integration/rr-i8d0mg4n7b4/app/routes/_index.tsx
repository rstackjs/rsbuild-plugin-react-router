
import { useState, useEffect } from "react";

import { serverOnly1, serverOnly2 } from "../utils.server";

export const loader = () => {
  return { serverOnly1 }
}

export const action = () => {
  console.log(serverOnly2)
  return null
}

export default function() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <h2>Index</h2>
      {!mounted ? <h3>Loading...</h3> : <h3 data-mounted>Mounted</h3>}
    </>
  );
}
              