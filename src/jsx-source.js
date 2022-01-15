// @ts-check
// based on https://github.com/babel/babel/blob/8035ad90f995891e65e446a08b570d1c28901214/packages/babel-plugin-transform-react-jsx-source/src/index.ts
// changed to output a unist `Position` value

const t = require("@babel/core").types;

/**
 * @param {any} object
 * @returns {import("@babel/types").Expression}
 */
function toExpression(object, k = "??") {
  switch (typeof object) {
    case "number":
      return t.numericLiteral(object);
    case "object":
      return t.objectExpression(
        Object.entries(object).map(([k, v]) =>
          t.objectProperty(t.identifier(k), toExpression(v, k))
        )
      );
    case "undefined":
      console.log(k);
      return t.identifier("undefined");
    default:
      throw new Error("unexpected value " + JSON.stringify(object));
  }
}

/** @type {import('@babel/core').PluginObj} */
module.exports = {
  name: "transform-jsx-unist-posiiton",
  visitor: {
    JSXElement(path) {
      const id = t.jsxIdentifier("__position");
      const location = path.node.loc;
      if (!location) {
        // the element was generated and doesn't have location information
        return;
      }

      const attributes = path.node.openingElement.attributes;
      for (const attribute of attributes) {
        if (
          attribute.type === "JSXAttribute" &&
          attribute.name?.name === id.name
        ) {
          // The __position attribute already exists
          return;
        }
      }

      attributes.push(
        t.jsxAttribute(id, t.jsxExpressionContainer(toExpression(location)))
      );
    },
  },
};
