import {
  defer,
  json,
  type EntryContext,
  type LinksFunction,
  type SerializeFrom,
} from '@remix-run/node';
import {
  Await,
  RemixBrowser,
  RemixServer,
  useActionData,
  useLoaderData,
} from '@remix-run/react';
import { Link } from 'react-router-dom6';
import { NavLink } from 'react-router-dom';
import { defer as explicitDefer } from 'rsbuild-plugin-react-router/compat/remix-node';
import { RemixBrowser as ExplicitRemixBrowser } from 'rsbuild-plugin-react-router/compat/remix-react';

export const loader = () =>
  defer({
    value: Promise.resolve('ok'),
    count: 1,
  });

export const action = () => json({ saved: true }, { status: 201 });
export const jsonLoader = () =>
  json({
    created: new Date(),
    omitted: undefined,
    maybe: Math.random() ? 'value' : undefined,
    array: [new Date(), undefined, () => 'omitted'] as const,
    custom: { toJSON: () => ({ serialized: 'yes' as const }) },
  });
export const mixedLoader = (deferred: boolean) =>
  deferred
    ? defer({ tag: 'deferred' as const, created: new Date() })
    : json({ tag: 'json' as const, created: new Date() });
export const plainLoader = () => ({
  created: new Date(),
  promised: Promise.resolve(new Date()),
});

const data = useLoaderData<typeof loader>();
data.value.then(value => value.toUpperCase());
data.count.toFixed();
const actionData = useActionData<typeof action>();
actionData?.saved.valueOf();
const jsonData = null as unknown as SerializeFrom<typeof jsonLoader>;
const created: string = jsonData.created;
const maybe: string | undefined = jsonData.maybe;
const array: [string, null, null] = jsonData.array;
const custom: { serialized: 'yes' } = jsonData.custom;
// @ts-expect-error JSON object properties whose values are always undefined are omitted.
jsonData.omitted;
const mixedData = null as unknown as SerializeFrom<typeof mixedLoader>;
const mixedTag: 'json' | 'deferred' = mixedData.tag;
const mixedCreated: string | Date = mixedData.created;
const plainData = null as unknown as SerializeFrom<typeof plainLoader>;
const plainCreated: Date = plainData.created;
const promisedDate: Promise<Date> = plainData.promised;

const links: LinksFunction = () => [];
const context = {} as EntryContext;
void [
  Await,
  RemixBrowser,
  RemixServer,
  Link,
  NavLink,
  links,
  context,
  actionData,
  explicitDefer,
  ExplicitRemixBrowser,
  created,
  maybe,
  array,
  custom,
  mixedTag,
  mixedCreated,
  plainCreated,
  promisedDate,
];
