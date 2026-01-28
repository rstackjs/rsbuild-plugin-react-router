import { Link } from 'react-router';

export default function Index() {
  return (
    <div>
      <h1>Welcome</h1>
      <p>
        This example demonstrates <code>.client</code> modules.
      </p>
      <p>
        <Link to="/client-only">Go to client-only route</Link>
      </p>
    </div>
  );
}
