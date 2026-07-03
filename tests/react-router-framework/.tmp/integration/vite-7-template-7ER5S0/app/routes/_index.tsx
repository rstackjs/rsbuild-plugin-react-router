import type { Expect, Equal } from "../expect-type"
import type { Route } from "./+types/_index"

export function loader() {
  return { server: "server" }
}

export function clientLoader() {
  return { client: "client" }
}
clientLoader.hydrate = true as const

export function HydrateFallback() {
  return <h1>Loading...</h1>
}

export default function Component({ loaderData }: Route.ComponentProps) {
  type Test = Expect<Equal<typeof loaderData, { client: string }>>
  return <h1>Hello from {loaderData.client}!</h1>
}