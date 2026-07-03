import { unstable_useRoute as useRoute } from "react-router"

import type { Expect, Equal } from "../expect-type"

export const handle = { currentHandle: "current/handle" }
export const loader = () => ({ currentLoader: "current/loader" })
export const action = () => ({ currentAction: "current/action" })

export default function Component() {
  const current = useRoute()
  type Test1 = Expect<Equal<typeof current, {
    handle: unknown,
    loaderData: unknown,
    actionData: unknown,
  }>>

  const root = useRoute("root")
  type Test2 = Expect<Equal<typeof root, {
    handle: { rootHandle: string },
    loaderData: { rootLoader: string } | undefined,
    actionData: { rootAction: string } | undefined,
  }>>

  const parent = useRoute("routes/parent")
  type Test3 = Expect<Equal<typeof parent, {
    handle: { parentHandle: string },
    loaderData: { parentLoader: string } | undefined,
    actionData: { parentAction: string } | undefined
  } | undefined>>

  const other = useRoute("routes/other")
  type Test4 = Expect<Equal<typeof other, {
    handle: { otherHandle: string },
    loaderData: { otherLoader: string } | undefined,
    actionData: { otherAction: string } | undefined,
  } | undefined>>

  return (
    <>
      <pre data-root>{root.loaderData?.rootLoader}</pre>
      <pre data-parent>{parent?.loaderData?.parentLoader}</pre>
      {/* @ts-expect-error */}
      <pre data-current>{current?.loaderData?.currentLoader}</pre>
      <pre data-other>{other === undefined ? "undefined" : "something else"}</pre>
    </>
  )
}