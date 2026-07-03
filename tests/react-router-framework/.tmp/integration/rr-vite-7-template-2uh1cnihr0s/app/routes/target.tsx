
import { useRouteLoaderData } from 'react-router';
export default function Comp() {
  return <h2>{useRouteLoaderData('root')}</h2>;
}
              