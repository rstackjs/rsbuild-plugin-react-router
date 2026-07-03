
import { useState, useEffect } from "react";
import { useLoaderData } from 'react-router'
export async function clientLoader() {
  await new Promise(resolve => setTimeout(resolve, 500))
  return "CHILD"
}
export function HydrateFallback() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <>
      <p id="loading">Loading...</p>
      <p data-mounted>Mounted: {mounted ? "yes" : "no"}</p>
    </>
  );
}
export default function Child() {
  const data = useLoaderData()
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <>
      <p id="child">{data}</p>
      <p data-mounted>Mounted: {mounted ? "yes" : "no"}</p>
    </>
  );
}
              