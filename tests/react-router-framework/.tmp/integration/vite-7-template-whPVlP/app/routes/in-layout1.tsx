import type { Expect, Equal } from "../expect-type"
import type { Route } from "./+types/in-layout1"

export function loader({ params }: Route.LoaderArgs) {
  type Test = Expect<Equal<typeof params, { id: string }>>
  return null
}