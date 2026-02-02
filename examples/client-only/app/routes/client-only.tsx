import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getClientValue } from '../client-value.client';

export default function ClientOnlyRoute() {
  const [value, setValue] = useState('server');

  useEffect(() => {
    if (typeof getClientValue === 'function') {
      setValue(getClientValue());
    }
  }, []);

  return (
    <div>
      <h1>Client-only route</h1>
      <p data-testid="client-value">{value}</p>
      <p>
        <Link to="/">Back home</Link>
      </p>
    </div>
  );
}
