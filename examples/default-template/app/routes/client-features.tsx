import { Link, useFetcher, useLoaderData } from 'react-router';

import type { Route } from './+types/client-features';

export async function loader() {
  return { source: 'server' };
}

export async function clientLoader() {
  return { source: 'client' };
}

export async function action() {
  return { source: 'server', status: 'submitted' };
}

export async function clientAction() {
  return { source: 'client', status: 'submitted' };
}

export default function ClientFeatures() {
  const data = useLoaderData<Route.ComponentProps["loaderData"]>();
  const fetcher = useFetcher<Route.ComponentProps["actionData"]>();

  return (
    <div className="page-container">
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Client Features
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Loader source: <span data-testid="loader-source">{data?.source ?? 'unknown'}</span>
        </p>
        <fetcher.Form method="post">
          <button
            type="submit"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Run client action
          </button>
        </fetcher.Form>
        <p className="text-gray-600 dark:text-gray-300 mt-4">
          Action source:{' '}
          <span data-testid="action-source">
            {fetcher.data?.source ?? 'idle'}
          </span>
        </p>
        <Link
          to="/"
          className="inline-block mt-6 text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
