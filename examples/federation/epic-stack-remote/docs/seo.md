# SEO

Remix has built-in support for setting up `meta` tags on a per-route basis which
you can read about
[in the Remix Metadata docs](https://remix.run/docs/en/main/route/meta).

The Epic Stack also has built-in support for `/robots.txt` and `/sitemap.xml`
via [resource routes](https://remix.run/docs/en/main/guides/resource-routes)
using [`@nasa-gcn/remix-seo`](https://github.com/nasa-gcn/remix-seo). By
default, all routes are included in the `sitemap.xml` file, but you can
configure which routes are included using the `handle` export in the route. Only
public-facing pages should be included in the `sitemap.xml` file.

Here are two quick examples of how to customize the sitemap on a per-route basis
from the `@nasa-gcn/remix-seo` docs:

```tsx
// routes/blog/_layout.tsx
import { type SEOHandle } from '@nasa-gcn/remix-seo'

export const handle: SEOHandle = {
	async getSitemapEntries(request) {
		const blogs = await db.blog.findMany()
		return blogs.map((blog) => {
			return { route: `/blog/${blog.slug}`, priority: 0.7 }
		})
	},
}
```

Keep sitemap data server-only by loading it from server route modules or other server-only files.

```tsx
// in your routes/url-that-doesnt-need-sitemap
import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { type Route } from './+types/sitemap[.]xml.ts'

export async function loader({ request }: Route.LoaderArgs) {
	/**/
}

export const handle: SEOHandle = {
	getSitemapEntries: () => null,
}
```
