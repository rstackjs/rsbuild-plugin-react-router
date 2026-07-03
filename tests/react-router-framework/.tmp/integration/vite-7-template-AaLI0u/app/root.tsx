import { Outlet } from "react-router"

export const handle = { rootHandle: "root/handle" }
export const loader = () => ({ rootLoader: "root/loader" })
export const action = () => ({ rootAction: "root/action" })

export default function Component() {
  return (
    <>
      <h1>Root</h1>
      <Outlet />
    </>
  )
}