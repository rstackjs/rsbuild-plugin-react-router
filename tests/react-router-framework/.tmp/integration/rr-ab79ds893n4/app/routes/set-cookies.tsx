import type { LoaderFunction } from "react-router";

export const loader: LoaderFunction = () => {
  const headers = new Headers();

  headers.append(
    "Set-Cookie",
    "first=one; Domain=localhost; Path=/; SameSite=Lax"
  );

  headers.append(
    "Set-Cookie",
    "second=two; Domain=localhost; Path=/; SameSite=Lax"
  );

  headers.append(
    "Set-Cookie",
    "third=three; Domain=localhost; Path=/; SameSite=Lax"
  );

  headers.set("location", "http://localhost:34539/get-cookies");

  const response = new Response(null, {
    headers,
    status: 302,
  });

  return response;
};