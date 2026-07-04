import { Link, useLocation, type LoaderFunction, type MetaFunction } from "react-router";

export const loader: LoaderFunction = ({ request }) => {
  if (request.url.includes("crash-loader")) {
    throw new Error("crash-loader");
  }
  return null;
};

export default function TestRoute() {
  const location = useLocation();

  if (import.meta.env.SSR && location.search.includes("crash-server-render")) {
    throw new Error("crash-server-render");
  }

  return (
    <div>
      <ul>
        {["crash-loader", "crash-server-render"].map(
          (v) => (
            <li key={v}>
              <Link to={"/?" + v}>{v}</Link>
            </li>
          )
        )}
      </ul>
    </div>
  );
}