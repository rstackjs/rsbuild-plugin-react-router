import { useState, useEffect } from "react";
import { useLoaderData } from "react-router";

export const loader = () => {
  return {
    loaderContent: process.env.ENV_VAR_FROM_DOTENV_FILE,
  }
}

export default function DotenvRoute() {
  const { loaderContent } = useLoaderData();

  const [clientContent, setClientContent] = useState('');
  useEffect(() => {
    try {
      setClientContent("process.env.ENV_VAR_FROM_DOTENV_FILE shouldn't be available on the client, found: " + process.env.ENV_VAR_FROM_DOTENV_FILE);
    } catch (err) {
      setClientContent("process.env.ENV_VAR_FROM_DOTENV_FILE not available on the client, which is a good thing");
    }
  }, []);

  return <>
    <div data-dotenv-route-loader-content>{loaderContent}</div>
    <div data-dotenv-route-client-content>{clientContent}</div>
  </>
}