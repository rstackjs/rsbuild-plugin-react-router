import type { Expect, Equal } from "../expect-type"
import type { Route } from "./+types/route"

export function loader() {
  return { route: "world" }
}

export default function Component({ params, matches }: Route.ComponentProps) {
  type Test = Expect<Equal<typeof params,
    | {
          base: string;
          home: string;
          changelog?: undefined;
          "*"?: undefined;
          other?: undefined;
        }
      | {
          base: string;
          home?: undefined;
          changelog: string;
          "*"?: undefined;
          other?: undefined;
        }
      | {
          base: string;
          home?: undefined;
          changelog?: undefined;
          "*": string;
          other?: undefined;
        }
      | {
          base?: undefined;
          home?: undefined;
          changelog?: undefined;
          "*"?: undefined;
          other: string;
        }
  >>
  return <h1>Hello, world!</h1>
}