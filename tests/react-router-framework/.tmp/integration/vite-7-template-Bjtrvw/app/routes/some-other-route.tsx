import { href } from "react-router"

// @ts-expect-error
href("/does-not-exist")

href("/optional-static")
href("/optional-static/opt")
// @ts-expect-error
href("/optional-static/opt?")

href("/no-params")

// @ts-expect-error
href("/required-param/:req")
href("/required-param/:req", { req: "hello" })

// @ts-expect-error
href("/optional-param")
// @ts-expect-error
href("/optional-param/:opt", { opt: "hello" })
href("/optional-param/:opt?")
href("/optional-param/:opt?", { opt: "hello" })

href("/leading-and-trailing-slash")
// @ts-expect-error
href("/leading-and-trailing-slash/")

export default function Component() {}