'use client';

import { useState } from 'react';

export function ClientCounter() {
  const [count, setCount] = useState(0);

  return (
    <button
      className="counter-button"
      type="button"
      onClick={() => setCount(current => current + 1)}
    >
      Client island count: {count}
    </button>
  );
}
