import type { Expect, Equal } from "../expect-type"
import type { Route } from "./+types/layout"

export function loader({ params }: Route.LoaderArgs) {
  type Test = Expect<Equal<typeof params, { id: string, other?: undefined } | { id: string, other: string } >>
  return null
}