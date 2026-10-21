import {
  defer,
  json,
  type EntryContext,
  type LinksFunction,
} from '@remix-run/node';
import {
  Await,
  RemixBrowser,
  RemixServer,
  useActionData,
  useLoaderData,
} from '@remix-run/react';
import { Link } from 'react-router-dom6';
import { defer as explicitDefer } from 'rsbuild-plugin-react-router/compat/remix-node';
import { RemixBrowser as ExplicitRemixBrowser } from 'rsbuild-plugin-react-router/compat/remix-react';

export const loader = () =>
  defer({
    value: Promise.resolve('ok'),
    count: 1,
  });

export const action = () => json({ saved: true }, { status: 201 });

const data = useLoaderData<typeof loader>();
data.value.then(value => value.toUpperCase());
data.count.toFixed();
const actionData = useActionData<typeof action>();
actionData?.saved.valueOf();

const links: LinksFunction = () => [];
const context = {} as EntryContext;
void [
  Await,
  RemixBrowser,
  RemixServer,
  Link,
  links,
  context,
  actionData,
  explicitDefer,
  ExplicitRemixBrowser,
];
