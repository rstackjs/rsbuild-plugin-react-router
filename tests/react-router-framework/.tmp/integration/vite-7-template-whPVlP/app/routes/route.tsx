import type { Expect, Equal } from "../expect-type"
import type { Route } from "./+types/route"

export function loader({ params }: Route.LoaderArgs) {
  type Test = Expect<Equal<typeof params,
    | { p: string, r: string, c1a?: undefined,  c1b?: undefined, c2a?: undefined, c2b?: undefined }
    | { p: string, r: string, c1a: string,  c1b: string, c2a?: undefined, c2b?: undefined }
    | { p: string, r: string, c1a?: undefined,  c1b?: undefined, c2a: string, c2b: string }
  >>
  return null
}