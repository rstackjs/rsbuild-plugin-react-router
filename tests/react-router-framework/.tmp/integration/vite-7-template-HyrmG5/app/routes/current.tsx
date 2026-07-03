import type { Expect, Equal } from "../expect-type"
import type { Route } from "./+types/current"

export function loader() {
  return { current: 3 }
}

export function meta({ matches }: Route.MetaArgs) {
  const parent1 = matches[1]
  type Test1 = Expect<Equal<typeof parent1.loaderData, { parent1: number }>>

  const parent2 = matches[2]
  type Test2 = Expect<Equal<typeof parent2.loaderData, { parent2: number }>>

  const current = matches[3]
  type Test3 = Expect<Equal<typeof current.loaderData, { current: number }>>

  const child1 = matches[4]
  type Test4a = Expect<undefined extends typeof child1 ? true : false>
  if (child1) {
    type Test4b = Expect<Equal<typeof child1.loaderData, unknown>>
  }
  return []
}

export default function Component({ matches }: Route.ComponentProps) {
  const parent1 = matches[1]
  type Test1 = Expect<Equal<typeof parent1.loaderData, { parent1: number }>>

  const parent2 = matches[2]
  type Test2 = Expect<Equal<typeof parent2.loaderData, { parent2: number }>>

  const current = matches[3]
  type Test3 = Expect<Equal<typeof current.loaderData, { current: number }>>

  const child1 = matches[4]
  type Test4a = Expect<undefined extends typeof child1 ? true : false>
  if (child1) {
    type Test4b = Expect<Equal<typeof child1.loaderData, unknown>>
  }
}