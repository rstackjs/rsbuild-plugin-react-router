import { useLoaderData, type LoaderFunctionArgs } from "react-router";

export const loader = ({ request }: LoaderFunctionArgs) => ({
  cookies: request.headers.get("Cookie")
});

export default function IndexRoute() {
  const { cookies } = useLoaderData<typeof loader>();

  return (
    <div id="get-cookies">
      <h2 data-title>Get Cookies</h2>
      <p data-cookies>{cookies}</p>
    </div>
  );
}