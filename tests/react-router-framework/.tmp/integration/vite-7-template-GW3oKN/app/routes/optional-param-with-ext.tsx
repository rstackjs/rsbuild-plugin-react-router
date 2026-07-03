import type { Expect, Equal } from "../expect-type"
import type { Route } from "./+types/optional-param-with-ext"

export function loader({ params }: Route.LoaderArgs) {
  type Test = Expect<Equal<typeof params, { user?: string }>>
  return null
}