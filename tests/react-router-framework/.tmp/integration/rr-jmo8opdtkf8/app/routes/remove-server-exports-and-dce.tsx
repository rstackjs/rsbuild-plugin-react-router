
import fs from "node:fs";
import { useLoaderData } from "react-router";

import { serverOnly as serverOnlyFile } from "../utils.server";
import { serverOnly as serverOnlyDir } from "../.server/utils";

export const loader = () => {
  let contents = fs.readFileSync("server_only.txt");
  return { serverOnlyFile, serverOnlyDir, contents }
}

export const action = () => {
  let contents = fs.readFileSync("server_only.txt");
  console.log({ serverOnlyFile, serverOnlyDir, contents });
  return null;
}

export default function() {
  let { data } = useLoaderData<typeof loader>();
  return <pre>{JSON.stringify(data)}</pre>;
}
    