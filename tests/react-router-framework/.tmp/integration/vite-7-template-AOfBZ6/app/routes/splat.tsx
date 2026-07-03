import type { Expect, Equal } from "../expect-type"
import type { Route } from "./+types/splat"

export function loader({ params }: Route.LoaderArgs) {
  type Test = Expect<Equal<typeof params, { "*": string }>>
  return null
}