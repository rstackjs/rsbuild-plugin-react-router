import { Outlet } from "react-router"

export function loader() {
  return { parent2: 2 }
}

export default function Component() {
  return (
    <section>
      <h2>Parent2</h2>
      <Outlet />
    </section>
  )
}