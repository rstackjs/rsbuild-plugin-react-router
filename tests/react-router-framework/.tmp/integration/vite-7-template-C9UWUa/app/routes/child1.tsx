import type { Expect, Equal } from "../expect-type"
import type { Route } from "./+types/child1"

export function loader({ params }: Route.LoaderArgs) {
  type Test = Expect<Equal<typeof params, { p: string, r: string, c1a: string,  c1b: string }>>
  return null
}