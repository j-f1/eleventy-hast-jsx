// @ts-check

const h = require("hastscript");

/** @typedef {import('./types').createElement} createElement */

/**
 * @param {import("./types").Child[]} children
 * @param {string} name
 * @returns {import("hast").Node[]}
 */
const processChildren = (children, name) =>
  children
    .flat(20)
    .flatMap((ch) =>
      typeof ch === "string"
        ? [{ type: "text", value: ch }]
        : ch == null || typeof ch === "boolean"
        ? []
        : [ch]
    );

/** @type {createElement} */
exports.createElement = Object.assign(
  (
    /** @type {any} */ type,
    /** @type {any} */ properties,
    /** @type {any} */ ...children
  ) => {
    if (typeof type === "string") {
      return h(type, properties, processChildren(children, type));
    } else if (typeof type === "function") {
      return type({
        ...properties,
        children: processChildren(children, type.name),
      });
    } else if (type === exports.createElement.Fragment) {
      return processChildren(children, "Fragment");
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
