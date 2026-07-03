import type { Expect, Equal } from "../expect-type"
import type { Route } from "./+types/absolute"

export function loader({ params }: Route.LoaderArgs) {
  type Test = Expect<Equal<typeof params, { id: string }>>
  return { planet: "world" }
}

export default function Component({ loaderData }: Route.ComponentProps) {
  type Test = Expect<Equal<typeof loaderData.planet, string>>
  return <h1>Hello, {loaderData.planet}!</h1>
}