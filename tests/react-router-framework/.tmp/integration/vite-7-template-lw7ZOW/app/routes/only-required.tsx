import type { Expect, Equal } from "../expect-type"
import type { Route } from "./+types/only-required"
export function loader({ params }: Route.LoaderArgs) {
  type Test = Expect<Equal<typeof params, { id: string }>>
  return null
}