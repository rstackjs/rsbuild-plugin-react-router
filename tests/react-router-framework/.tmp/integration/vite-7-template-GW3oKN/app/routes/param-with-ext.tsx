import type { Expect, Equal } from "../expect-type"
import type { Route } from "./+types/param-with-ext"

export function loader({ params }: Route.LoaderArgs) {
  type Test = Expect<Equal<typeof params, { lang: string }>>
  return null
}