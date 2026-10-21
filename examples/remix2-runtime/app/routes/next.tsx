import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';

export async function loader() {
  await new Promise(resolve => setTimeout(resolve, 200));
  return json({ message: 'native-next-loader' }, { headers: { 'X-Remix2-Next': 'native' } });
}

export default function Next() {
  const data = useLoaderData<typeof loader>();
  return (
    <main>
      <p data-testid="next-message">{data.message}</p>
      <Link to="/">Home</Link>
    </main>
  );
}
