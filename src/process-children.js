/**
 * @param {any[]} children
 * @returns {import("hast").Node[]}
 */
module.exports = (children) =>
  Array.isArray(children)
    ? children
        .flat(20)
        .flatMap((ch) =>
          typeof ch === "string"
            ? [{ type: "text", value: ch }]
            : typeof ch === "number"
            ? [{ type: "text", value: ch.toString() }]
            : ch == null || typeof ch === "boolean"
            ? []
            : [ch]
        )
    : [children];
