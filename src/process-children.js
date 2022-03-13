/**
 * @param {any[]} children
 * @returns {import("hast").Node[]}
 */
const processChildren = (children) =>
  [children]
    .flat(21)
    .flatMap((ch) =>
      typeof ch === "string"
        ? [{ type: "text", value: ch }]
        : typeof ch === "number"
        ? [{ type: "text", value: ch.toString() }]
        : ch == null || typeof ch === "boolean"
        ? []
        : [ch]
    );

module.exports = processChildren;
