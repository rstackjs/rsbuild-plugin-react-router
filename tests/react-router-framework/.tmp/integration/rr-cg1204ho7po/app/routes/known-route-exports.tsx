import { useMatches } from "react-router";

export const meta = () => [{
  title: "HMR meta: 0"
}]

export const links = () => [{
  rel: "icon",
  href: "/favicon.ico",
  type: "image/png",
  "data-link": "HMR links: 0",
}]

export const handle = {
  data: "HMR handle: 0"
};

export default function TestRoute() {
  const matches = useMatches();

  return (
    <div id="known-route-export-hmr">
      <input />
      <p data-hmr>HMR component: 0</p>
      <p data-handle>{matches[1].handle.data}</p>
    </div>
  );
}