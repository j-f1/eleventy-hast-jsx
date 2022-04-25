// @ts-check

const h = require("hastscript");
const processChildren = require("./process-children");

/** @type {import('./types').createElement} */
exports.createElement = Object.assign(
  (
    /** @type {any} */ type,
    /** @type {any} */ properties,
    /** @type {any} */ ...children
  ) => {
    if (typeof type === "string") {
      return h(type, properties, processChildren(children));
    } else if (typeof type === "function") {
      return type({
        ...properties,
        children: processChildren(children),
      });
    } else if (type === exports.createElement.Fragment) {
      return processChildren(children);
    } else {
      throw new Error(`Invalid component type: ${type}`);
    }
  },
  { Fragment: Symbol("<createElement.Fragment />") }
);

/**
 * @param {{html: string}} props
 * @returns {import('hast-util-to-html/lib/types').Raw}
 */
exports.Raw = ({ html }) => ({ type: "raw", value: html });

/** @returns {import('hast').DocType} */
exports.DOCTYPE = () => ({ type: "doctype", name: "html" });

/**
 * @param {{children: import('hast').Text[]}} props
 * @returns {import('hast').Comment}
 */
exports.Comment = ({ children }) => ({
  type: "comment",
  value: children.map((child) => child.value).join(""),
});
