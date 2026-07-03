
import { useLoaderData } from "react-router";

export const loader = () => {
  return {
    loaderContent: process.env.ENV_VAR_FROM_DOTENV_FILE ?? '.env file was NOT loaded, which is a good thing',
  }
}

export default function DotenvRoute() {
  const { loaderContent } = useLoaderData();

  return <div data-dotenv-route-loader-content>{loaderContent}</div>;
}
              