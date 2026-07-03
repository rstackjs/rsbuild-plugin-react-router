
import txtUrl from "../assets/test.txt?url";
import { useLoaderData } from "react-router"

export const loader: LoaderFunction = () => {
  return { txtUrl };
};

export default function SsrOnlyAssetsRoute() {
  const loaderData = useLoaderData();
  return (
    <div>
      <a href={loaderData.txtUrl}>txtUrl</a>
    </div>
  );
}
              