import { json, redirect, type ActionFunctionArgs, type HeadersFunction } from '@remix-run/node';
import { Form, Link, useActionData, useFetcher, useLoaderData, useNavigation } from '@remix-run/react';
import { useState } from 'react';
import { mutateState, readState } from '../state.server';

export function loader() {
  return json(readState(), { headers: { 'X-Remix2-Loader': 'native' } });
}

export async function action({ request }: ActionFunctionArgs) {
  const data = await request.formData();
  if (data.get('intent') === 'redirect') {
    return redirect('/next?redirected=1', {
      status: 303,
      headers: { 'X-Remix2-Redirect': 'native' },
    });
  }
  const revision = mutateState();
  return json(
    { submitted: String(data.get('message')), revision },
    { status: 201, headers: { 'X-Remix2-Action': 'native' } },
  );
}

export const headers: HeadersFunction = ({ loaderHeaders, actionHeaders }) => ({
  'X-Remix2-Loader': loaderHeaders.get('X-Remix2-Loader') || 'native',
  ...(actionHeaders.has('X-Remix2-Action') ? { 'X-Remix2-Action': 'native' } : {}),
});

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const fetcher = useFetcher<typeof action>();
  const navigation = useNavigation();
  const [count, setCount] = useState(0);
  return (
    <main>
      <p data-testid="loader-message">{data.message}</p>
      <p data-testid="loader-revision">{data.revision}</p>
      <button onClick={() => setCount(count + 1)}>Count {count}</button>
      <p data-testid="navigation-state">{navigation.state}</p>
      <nav>
        <Link to="/next">Next loader</Link>{' '}
        <Link to="/deferred">Deferred route</Link>
      </nav>
      <Form method="post">
        <input aria-label="Form message" name="message" defaultValue="form-native" />
        <button type="submit">Submit form</button>
      </Form>
      <p data-testid="action-result">{actionData?.submitted || 'no-action'}</p>
      <fetcher.Form method="post">
        <input aria-label="Fetcher message" name="message" defaultValue="fetcher-native" />
        <button type="submit">Submit fetcher</button>
      </fetcher.Form>
      <p data-testid="fetcher-result">{fetcher.data?.submitted || 'no-fetcher'}</p>
      <p data-testid="fetcher-state">{fetcher.state}</p>
      <Form method="post">
        <button name="intent" value="redirect" type="submit">Redirect action</button>
      </Form>
    </main>
  );
}
