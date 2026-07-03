
import { useLoaderData } from "react-router"

export const loader: LoaderFunction = async () => {
  const lib = await import("../ssr-code-split-lib");
  return lib.ssrCodeSplitTest();
};

export default function SsrCodeSplitRoute() {
  const loaderData = useLoaderData();
  return (
    <div data-ssr-code-split>{loaderData}</div>
  );
}
              