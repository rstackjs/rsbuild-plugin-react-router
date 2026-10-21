import { RemixBrowser } from '@remix-run/react';
import { startTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';

document.documentElement.dataset.remix2Entry = 'custom-client';
startTransition(() => {
  hydrateRoot(document, <RemixBrowser />);
});
