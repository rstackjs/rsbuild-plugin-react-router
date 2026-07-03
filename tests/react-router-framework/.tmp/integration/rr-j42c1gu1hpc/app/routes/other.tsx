
import { useLoaderData } from "react-router";

export const loader = () => {
  return "other-loader";
};

export default function OtherRoute() {
  const loaderData = useLoaderData()

  return (
    <div id="other">
      <p>{loaderData}</p>
    </div>
  );
}
  