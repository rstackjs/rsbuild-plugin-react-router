
import "./styles-bundled.css";
import postcssLinkedStyles from "./styles-postcss-linked.css?url";
import cssModulesStyles from "./styles.module.css";
import "./styles-vanilla-global.css";
import * as stylesVanillaLocal from "./styles-vanilla-local.css";

// Workaround for "Generated an empty chunk" warnings in RSC Framework Mode
export function loader() {
  return null;
}



function TestRoute() {
  return (
    <>
      <input />
      <link rel="stylesheet" href={postcssLinkedStyles} precedence="default" />
      <div id="entry-client" className="entry-client">
        <div id="css-modules" className={cssModulesStyles.index}>
          <div id="css-postcss-linked" className="css-with-floated-link-postcss-linked">
            <div id="css-bundled" className="css-with-floated-link-bundled">
              <div id="css-vanilla-global" className="css-with-floated-link-vanilla-global">
                <div id="css-vanilla-local" className={stylesVanillaLocal.index}>
                  <h2>CSS test</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TestRoute;
        