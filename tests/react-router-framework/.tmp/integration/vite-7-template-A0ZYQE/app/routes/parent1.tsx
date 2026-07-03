import { Outlet } from "react-router"

export function loader() {
  return { parent1: 1 }
}

export default function Component() {
  return (
    <section>
      <h1>Parent1</h1>
      <Outlet />
    </section>
  )
}