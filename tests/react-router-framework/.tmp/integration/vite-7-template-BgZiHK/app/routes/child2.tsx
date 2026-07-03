import type { Expect, Equal } from "../expect-type"
import type { Route } from "./+types/child2"

export function loader({ params }: Route.LoaderArgs) {
  type Test = Expect<Equal<typeof params, { p: string, r: string, c2a: string, c2b: string }>>
  return null
}