import { useMatches } from "react-router";

export const meta = () => [{
  title: "HMR meta: 1"
}]

export const links = () => [{
  rel: "icon",
  href: "/favicon.ico",
  type: "image/png",
  "data-link": "HMR links: 1",
}]

export const handle = {
  data: "HMR handle: 1"
};

export default function TestRoute() {
  const matches = useMatches();

  return (
    <div id="known-route-export-hmr">
      <input />
      <p data-hmr>HMR component: 1</p>
      <p data-handle>{matches[1].handle.data}</p>
    </div>
  );
}