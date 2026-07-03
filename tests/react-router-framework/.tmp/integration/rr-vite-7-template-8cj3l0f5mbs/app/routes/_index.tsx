
import { useLoaderData, Link } from "react-router";
export default function Index() {
  return (
    <div>
      <Link to="/redirect">Redirect</Link>
      <Link to="/direct-promise-access">Direct Promise Access</Link>
    </div>
  )
}
        