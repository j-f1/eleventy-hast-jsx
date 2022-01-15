// @ts-check

const h = require("hastscript");
const stringifyPosition = require("unist-util-stringify-position");

/** @typedef {import('./types').createElement} createElement */

/**
 * @param {any[]} children
 * @returns {import("hast").Node[]}
 */
const processChildren = (children) =>
  children
    .flat(20)
    .flatMap((ch) =>
      typeof ch === "string"
        ? [{ type: "text", value: ch }]
        : typeof ch === "number"
        ? [{ type: "text", value: ch.toString() }]
        : ch == null || typeof ch === "boolean"
        ? []
        : [ch]
    );

/** @type {createElement} */
exports.createElement = Object.assign(
  (
    /** @type {any} */ type,
    /** @type {any} */ props,
    /** @type {any} */ ...children
  ) => {
    const { __position, ...properties } = props ?? {};
    try {
      const p = (/** @type {import("hast").Element} */ node) =>
        Array.isArray(node)
          ? node
          : Object.assign(node, { position: __position });
      if (typeof type === "string") {
        return p(h(type, properties, processChildren(children)));
      } else if (typeof type === "function") {
        return p(
          type({
            ...properties,
            children: processChildren(children),
          })
        );
      } else if (type === exports.createElement.Fragment) {
        return processChildren(children);
      } else {
        throw new Error(`Invalid component type: ${type}`);
      }
    } catch (e) {
      e.message = `[${stringifyPosition(__position)}] ${e.message}`;
      throw e;
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
