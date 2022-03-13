// @ts-check

const h = require("hastscript");
const processChildren = require("./process-children");

/**
 * @param {string | ((props: object) => unknown)} type
 * @param {any} param1
 */
const jsx = (type, { children: rawChildren, ...props }) => {
  const children = processChildren(rawChildren);
  if (typeof type === "string") {
    return h(type, props, ...children);
  } else if (typeof type === "function") {
    return type({ children, ...props });
  } else {
    throw new Error(`Invalid type: ${type}`);
  }
};

/** @type {import('./types').jsx} */ exports.jsx = jsx;
/** @type {import('./types').jsxs} */ exports.jsxs = jsx;

/** @type {<T>(props: {children: T}) => T} */
exports.Fragment = ({ children }) => children;
