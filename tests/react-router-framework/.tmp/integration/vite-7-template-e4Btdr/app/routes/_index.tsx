import { useRouteLoaderData } from "react-router"

import type { Expect, Equal } from "../expect-type"
import type { Route } from "./+types/_index"

export function clientLoader({}: Route.ClientLoaderArgs) {
  return { fn: () => 0 }
}

export default function Component({ loaderData }: Route.ComponentProps) {
  type Test1 = Expect<Equal<typeof loaderData, { fn: () => number }>>

  const routeLoaderData = useRouteLoaderData<typeof clientLoader>("routes/_index")
  type Test2 = Expect<Equal<typeof routeLoaderData, { fn: () => number} | undefined>>

  return <h1>Hello, world!</h1>
}