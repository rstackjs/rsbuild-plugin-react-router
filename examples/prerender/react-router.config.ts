import type { Config } from '@react-router/dev/config';

export default {
  // Enable prerendering for static paths
  // This generates static HTML files for each specified path at build time
  ssr: false,
  prerender: [
    '/',
    '/about',
    '/docs',
    '/docs/getting-started',
    '/docs/advanced',
    '/projects',
  ],
} satisfies Config;
