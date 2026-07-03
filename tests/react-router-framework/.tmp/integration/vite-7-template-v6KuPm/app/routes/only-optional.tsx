import type { Expect, Equal } from "../expect-type"
import type { Route } from "./+types/only-optional"
export function loader({ params }: Route.LoaderArgs) {
  type Test = Expect<Equal<typeof params.id, string | undefined>>
  return null
}