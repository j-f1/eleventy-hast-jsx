const h = require("hastscript");

exports.h = /** @type {import('./types').h} */ Object.assign(
  (
    /** @type {string | function | import('./types').h['frag'] | typeof exports.Raw} */ type,
    /** @type {any} */ properties,
    /** @type {any} */ ...children
  ) => {
    if (typeof type === "string") {
      return h(type, properties, children.flat(1));
    } else if (typeof type === "function") {
      return type({ ...properties, children: children.flat(1) });
    } else if (type === exports.h.frag) {
      return children;
    } else if (type === exports.Raw) {
      return { type: "raw", value: properties.html };
    } else {
      throw new Error(`Invalid component type: ${type}`);
    }
  },
  { frag: Symbol("<Fragment />") }
);

exports.Raw = Symbol("<Raw />");
