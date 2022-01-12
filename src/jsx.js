const h = require("hastscript");

/** @typedef {import('./types').createElement} createElement */

exports.createElement = /** @type {createElement} */ Object.assign(
  (
    /** @type {any} */ type,
    /** @type {any} */ properties,
    /** @type {any} */ ...children
  ) => {
    if (typeof type === "string") {
      return h(type, properties, children.flat(1));
    } else if (typeof type === "function") {
      return type({ ...properties, children: children.flat(1) });
    } else if (type === exports.createElement.Fragment) {
      return children;
    } else if (type === exports.Raw) {
      return { type: "raw", value: properties.html };
    } else {
      throw new Error(`Invalid component type: ${type}`);
    }
  },
  { Fragment: Symbol("<createElement.Fragment />") }
);

exports.Raw = Symbol("<Raw />");
