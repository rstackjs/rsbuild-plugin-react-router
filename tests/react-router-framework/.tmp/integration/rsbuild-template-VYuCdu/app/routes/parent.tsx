import { Outlet } from "react-router"

export const handle = { parentHandle: "parent/handle" }
export const loader = () => ({ parentLoader: "parent/loader" })
export const action = () => ({ parentAction: "parent/action" })

export default function Component() {
  return (
    <>
      <h2>Parent</h2>
      <Outlet />
    </>
  )
}