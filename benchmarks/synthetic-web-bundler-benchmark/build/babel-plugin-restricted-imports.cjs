"use strict";

const RESTRICTED_SEGMENT = /(?:^|[/\\])restricted(?:[/\\]|$)/;

module.exports = function syntheticRestrictedImportsPlugin({ types: t }) {
  function isRestrictedBoundary(source, filename) {
    return (
      RESTRICTED_SEGMENT.test(source) && !RESTRICTED_SEGMENT.test(filename ?? "")
    );
  }

  function replaceReference(referencePath) {
    if (referencePath.removed) return;

    const parent = referencePath.parentPath;
    if (parent?.isJSXOpeningElement()) {
      const element = parent.parentPath;
      if (element?.isJSXElement() && !element.removed) {
        element.replaceWith(
          t.jsxFragment(
            t.jsxOpeningFragment(),
            t.jsxClosingFragment(),
            element.node.children
          )
        );
      }
      return;
    }
    if (parent?.isJSXClosingElement()) return;

    let target = referencePath;
    while (
      (target.parentPath?.isMemberExpression() &&
        target.parentPath.node.object === target.node) ||
      (target.parentPath?.isOptionalMemberExpression() &&
        target.parentPath.node.object === target.node) ||
      (target.parentPath?.isCallExpression() &&
        target.parentPath.node.callee === target.node) ||
      (target.parentPath?.isOptionalCallExpression() &&
        target.parentPath.node.callee === target.node)
    ) {
      target = target.parentPath;
    }
    if (!target.removed) target.replaceWith(t.unaryExpression("void", t.numericLiteral(0)));
  }

  return {
    name: "synthetic-restricted-imports",
    visitor: {
      ImportDeclaration(path, state) {
        const source = path.node.source.value;
        if (!isRestrictedBoundary(source, state.filename)) return;

        for (const specifier of path.node.specifiers) {
          const binding = path.scope.getBinding(specifier.local.name);
          for (const referencePath of binding?.referencePaths ?? []) {
            replaceReference(referencePath);
          }
        }
        path.remove();
      },
      Import(path, state) {
        const call = path.parentPath;
        if (!call?.isCallExpression()) return;
        const source = call.get("arguments.0");
        if (!source?.isStringLiteral()) return;
        if (!isRestrictedBoundary(source.node.value, state.filename)) return;
        call.replaceWith(
          t.callExpression(
            t.memberExpression(t.identifier("Promise"), t.identifier("reject")),
            [t.newExpression(t.identifier("Error"), [t.stringLiteral("restricted")])]
          )
        );
      },
    },
  };
};
