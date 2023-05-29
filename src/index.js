// @ts-check

/** @typedef {import('./types').RenderComponent} RenderComponent */

module.exports = {
  plugin: require("./plugin").default,
  renderComponent: require("./plugin").renderComponent,
  ...require("./jsx"),
};
