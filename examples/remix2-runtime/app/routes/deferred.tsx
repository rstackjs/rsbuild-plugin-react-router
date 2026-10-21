import { defer } from '@remix-run/node';
import { Await, Link, useLoaderData } from '@remix-run/react';
import { Suspense } from 'react';

export function loader() {
  return defer(
    {
      resolved: Promise.resolve('already-resolved-native'),
      pending: new Promise<string>(resolve => {
        setTimeout(() => resolve('pending-resolved-native'), 650);
      }),
      rejected: new Promise<string>((_resolve, reject) => {
        setTimeout(() => reject(new Error('intentional-native-defer-rejection')), 850);
      }),
    },
    { headers: { 'X-Remix2-Defer': 'native' } },
  );
}

export default function Deferred() {
  const data = useLoaderData<typeof loader>();
  return (
    <main>
      <Suspense fallback={<p>Resolved waiting</p>}>
        <Await resolve={data.resolved}>
          {value => <p data-testid="defer-resolved">{value}</p>}
        </Await>
      </Suspense>
      <Suspense fallback={<p data-testid="defer-pending-fallback">Pending waiting</p>}>
        <Await resolve={data.pending}>
          {value => <p data-testid="defer-pending">{value}</p>}
        </Await>
      </Suspense>
      <Suspense fallback={<p data-testid="defer-rejected-fallback">Rejected waiting</p>}>
        <Await
          resolve={data.rejected}
          errorElement={<p data-testid="defer-rejected">Rejected handled natively</p>}
        >
          {value => <p>{value}</p>}
        </Await>
      </Suspense>
      <Link to="/">Home</Link>
    </main>
  );
}
