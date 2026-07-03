
import cssUrl from "../assets/test.css?url";
import { useLoaderData } from "react-router"

export const loader: LoaderFunction = () => {
  return { cssUrl };
};

export default function SsrOnlyCssUrlFilesRoute() {
  const loaderData = useLoaderData();
  return (
    <div>
      <a href={loaderData.cssUrl}>cssUrl</a>
    </div>
  );
}
              