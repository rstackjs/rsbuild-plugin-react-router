"use strict";

module.exports = function syntheticSecretHashPlugin({ types: t }) {
  return {
    name: "synthetic-secret-hash",
    visitor: {
      CallExpression(path) {
        if (!path.get("callee").isIdentifier({ name: "__syntheticSecret" })) {
          return;
        }

        const args = path.get("arguments");
        if (args.length !== 1 || !args[0].isStringLiteral()) {
          throw path.buildCodeFrameError(
            "__syntheticSecret expects exactly one string literal"
          );
        }

        let hash = 0x811c9dc5;
        for (const character of args[0].node.value) {
          hash ^= character.codePointAt(0);
          hash = Math.imul(hash, 0x01000193);
        }
        path.replaceWith(t.numericLiteral(hash >>> 0));
      },
    },
  };
};
