
import { useLoaderData } from "react-router";

export const loader = async () => {
  let { txtUrl } = await import("../ssr-only-asset.server");
  return { txtUrl };
};

export default function SsrOnlyAssetsRoute() {
  const loaderData = useLoaderData<typeof loader>();
  return <a href={loaderData.txtUrl}>txtUrl</a>;
}
      