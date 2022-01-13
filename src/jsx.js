// @ts-check

const h = require("hastscript");

/** @typedef {import('./types').createElement} createElement */

/**
 * @param {import("./types").Child[]} children
 * @returns {import("hast").Node[]}
 */
const processChildren = (children) =>
  children
    .flat(1)
    .map((ch) => (typeof ch === "string" ? { type: "text", value: ch } : ch));

/** @type {createElement} */
exports.createElement = Object.assign(
  (
    /** @type {any} */ type,
    /** @type {any} */ properties,
    /** @type {any} */ ...children
  ) => {
    if (typeof type === "string") {
      return h(type, properties, processChildren(children));
    } else if (typeof type === "function") {
      return type({ ...properties, children: processChildren(children) });
    } else if (type === exports.createElement.Fragment) {
      return children;
    } else {
      throw new Error(`Invalid component type: ${type}`);
    }
  },
  { Fragment: Symbol("<createElement.Fragment />") }
);

/** @type {import('./types').Raw} */
exports.Raw = ({ html }) => ({ type: "raw", value: html });

/** @type {import('./types').DOCTYPE} */
exports.DOCTYPE = () => ({ type: "doctype", name: "html" });

/** @type {import('./types').Comment} */
exports.Comment = ({ children }) => ({ type: "comment", value: children });
