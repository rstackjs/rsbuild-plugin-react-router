
import { Link, Outlet } from 'react-router';
let count = 0;
export function clientLoader() {
  return ++count;
}
export default function Component({ loaderData }) {
  return (
    <>
      <h1>Parent: {loaderData}</h1>
      <Link to="./child">Go to child</Link>
      <Outlet />
    </>
  )
}
              