// @ts-check

const path = require("node:path");

/** @type {import('./render.mjs').render} */
let unsafeSyncRender;
import("./render.mjs").then(({ render }) => (unsafeSyncRender = render));

module.exports = (componentsDir = "_components") => ({
  /**
   * @param {string} name
   * @param {any} props
   */
  async nunjucksAndJS(name, props) {
    const { render } = await import("./render.mjs");
    const templatePath = path.join(this.eleventy.env.root, componentsDir, name);

    let { default: component } = await import(templatePath);
    if (component.default) component = component.default;

    return render(await component(props));
  },
  /**
   * @param {string} name
   * @param {any[]} args
   */
  async liquid(name, ...args) {
    const { render } = await import("./render.mjs");
    const templatePath = path.join(this.eleventy.env.root, componentsDir, name);

    let { default: component } = await import(templatePath);
    if (component.default) component = component.default;

    return render(await component({ arg: args[0], args }));
  },
  /**
   * @param {string} name
   * @param {any[]} args
   */
  handlebars(name, ...args) {
    const templatePath = path.join(this.eleventy.env.root, componentsDir, name);

    let { default: component } = require(templatePath);
    if (component.default) component = component.default;

    return unsafeSyncRender(component({ arg: args[0], args }));
  },
});
