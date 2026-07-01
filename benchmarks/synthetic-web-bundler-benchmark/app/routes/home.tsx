import { FormattedMessage } from "react-intl";
import { Link } from "react-router";
import { VendorWorkload } from "../vendor-workload";

export default function Home() {
  "use memo";

  return (
    <main className="home-shell">
      <h1>
        <FormattedMessage
          id="benchmark.home.title"
          defaultMessage="Synthetic Web Bundler Benchmark"
          description="Heading on the synthetic benchmark home page."
        />
      </h1>
      <p>
        Generated code only. No product source, strings, data, or application
        dependency inventory is copied from a private application.
      </p>
      <Link to="/feature/0000">Open the first generated route</Link>
      <VendorWorkload />
    </main>
  );
}
