import { Outlet } from "react-router"
import type { Route } from "./+types/base"

export function loader() {
  return { base: "hello" }
}

export default function Component() {
  return (
    <>
      <h1>Layout</h1>
      <Outlet/>
    </>
  )
}