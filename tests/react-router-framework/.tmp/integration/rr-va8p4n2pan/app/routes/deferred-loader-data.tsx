import { Suspense } from "react";
import { Await, useLoaderData } from "react-router";

export function loader() {
  let deferred = new Promise((resolve) => {
    setTimeout(() => resolve(true), 1000)
  });
  return { deferred };
}

export default function IndexRoute() {
  const { deferred } = useLoaderData<typeof loader>();

  return (
    <div id="index">
      <Suspense fallback={<p data-defer>Defer finished: no</p>}>
        <Await resolve={deferred}>{() => <p data-defer>Defer finished: yes</p>}</Await>
      </Suspense>
    </div>
  );
}