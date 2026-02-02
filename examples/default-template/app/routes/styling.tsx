import type { Route } from './+types/styling';

import lessStyles from './styling.module.less';
import scssStyles from './styling.module.scss';

export function meta(_: Route.MetaArgs) {
  return [{ title: 'Styling Demo' }];
}

export default function StylingRoute() {
  return (
    <div className="page-container">
      <h1 className="text-3xl font-bold mb-6">CSS Modules (LESS/SASS)</h1>

      <div className={lessStyles.card}>
        This box is styled by `styling.module.less`
      </div>

      <div className={scssStyles.block} style={{ marginTop: 12 }}>
        This box is styled by `styling.module.scss`
      </div>

      <p className="mt-6 text-gray-600 dark:text-gray-300">
        If these styles don’t apply, the dev server probably isn’t processing
        LESS/SASS in the framework-style route build.
      </p>
    </div>
  );
}
