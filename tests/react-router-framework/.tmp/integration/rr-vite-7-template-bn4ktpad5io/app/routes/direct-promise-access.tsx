
import * as React from "react";
import { useLoaderData, Link, Await } from "react-router";
export function loader() {
  return {
    bar: new Promise(async (resolve, reject) => {
      resolve("hamburger");
    }),
  };
}
let count = 0;
export default function Index() {
  let {bar} = useLoaderData();
  React.useEffect(() => {
    let aborted = false;
    bar.then((data) => {
      if (aborted) return;
      document.getElementById("content").innerHTML = data + " " + (++count);
      document.getElementById("content").setAttribute("data-done", "");
    });
    return () => {
      aborted = true;
    };
  }, [bar]);
  return (
    <div id="content">
      Waiting for client hydration....
    </div>
  )
}
        