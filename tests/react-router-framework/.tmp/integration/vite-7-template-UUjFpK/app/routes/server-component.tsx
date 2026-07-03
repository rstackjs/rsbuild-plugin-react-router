import type { Expect, Equal } from "../expect-type"
import type { Route } from "./+types/server-component"

export function loader({ params }: Route.LoaderArgs) {
  type Test = Expect<Equal<typeof params, { id: string} >>
  return { server: "server" }
}

export function clientLoader() {
  return { client: "client" }
}

export function action() {
  return { server: "server" }
}

export function clientAction() {
  return { client: "client" }
}

export function ServerComponent({
  loaderData,
  actionData
}: Route.ServerComponentProps) {
  type TestLoaderData = Expect<Equal<typeof loaderData, { server: string }>>
  type TestActionData = Expect<Equal<typeof actionData, { server: string } | undefined>>

  return (
    <>
      <h1>ServerComponent</h1>
      <p>Loader data: {loaderData.server}</p>
      <p>Action data: {actionData?.server}</p>
    </>
  )
}

export function ServerErrorBoundary({
  loaderData,
  actionData
}: Route.ServerErrorBoundaryProps) {
  type TestLoaderData = Expect<Equal<typeof loaderData, { server: string } | undefined>>
  type TestActionData = Expect<Equal<typeof actionData, { server: string } | undefined>>

  return (
    <>
      <h1>ErrorBoundary</h1>
      <p>Loader data: {loaderData?.server}</p>
      <p>Action data: {actionData?.server}</p>
    </>
  )
}

export function ServerHydrateFallback({
  loaderData,
  actionData
}: Route.ServerHydrateFallbackProps) {
  type TestLoaderData = Expect<Equal<typeof loaderData, { server: string } | undefined>>
  type TestActionData = Expect<Equal<typeof actionData, { server: string } | undefined>>

  return (
    <>
      <h1>HydrateFallback</h1>
      <p>Loader data: {loaderData?.server}</p>
      <p>Action data: {actionData?.server}</p>
    </>
  )
}