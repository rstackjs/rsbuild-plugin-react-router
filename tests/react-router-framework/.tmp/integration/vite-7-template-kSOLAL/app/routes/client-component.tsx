import type { Expect, Equal } from "../expect-type"
import type { Route } from "./+types/client-component"

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

export default function ClientComponent({
  loaderData,
  actionData
}: Route.ComponentProps) {
  type TestLoaderData = Expect<Equal<typeof loaderData, { server: string } | { client: string }>>
  type TestActionData = Expect<Equal<typeof actionData, { server: string } | { client: string } | undefined>>

  return (
    <>
      <h1>default (Component)</h1>
      <p>Loader data: {"server" in loaderData ? loaderData.server : loaderData.client}</p>
      {actionData && <p>Action data: {"server" in actionData ? actionData.server : actionData.client}</p>}
    </>
  )
}

export function ErrorBoundary({
  loaderData,
  actionData
}: Route.ErrorBoundaryProps) {
  type TestLoaderData = Expect<Equal<typeof loaderData, { server: string } | { client: string } | undefined>>
  type TestActionData = Expect<Equal<typeof actionData, { server: string } | { client: string } | undefined>>

  return (
    <>
      <h1>ErrorBoundary</h1>
      {loaderData && <p>Loader data: {"server" in loaderData ? loaderData.server : loaderData.client}</p>}
      {actionData && <p>Action data: {"server" in actionData ? actionData.server : actionData.client}</p>}
    </>
  )
}

export function HydrateFallback({
  loaderData,
  actionData
}: Route.HydrateFallbackProps) {
  type TestLoaderData = Expect<Equal<typeof loaderData, { server: string } | { client: string } | undefined>>
  type TestActionData = Expect<Equal<typeof actionData, { server: string } | { client: string } | undefined>>

  return (
    <>
      <h1>HydrateFallback</h1>
      {loaderData && <p>Loader data: {"server" in loaderData ? loaderData.server : loaderData.client}</p>}
      {actionData && <p>Action data: {"server" in actionData ? actionData.server : actionData.client}</p>}
    </>
  )
}