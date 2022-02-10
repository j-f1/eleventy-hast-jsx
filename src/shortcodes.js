// @ts-check

const path = require("node:path");

/** @type {import('./render.mjs').render} */
let unsafeSyncRender;
import("./render.mjs").then(({ render }) => (unsafeSyncRender = render));

const makeProps = (/** @type {any[]} */ args) => {
  if (args.length === 1 && typeof args[0] === "object") {
    return {
      ...args[0],
      arg: args[0],
      args,
    };
  }

  return {
    arg: args[0],
    args,
  };
};

module.exports = (componentsDir = "_components") => ({
  /**
   * @this {import('./types').ShortcodeThis}
   * @param {string} name
   * @param {any} props
   */
  async nunjucksAndJS(name, props) {
    const { render } = await import("./render.mjs");
    const templatePath = path.join(this.eleventy.env.root, componentsDir, name);

    let component = require(templatePath);
    if (component.default) component = component.default;

    return render(await component(props));
  },
  /**
   * @this {import('./types').ShortcodeThis}
   * @param {string} name
   * @param {any[]} args
   */
  async liquid(name, ...args) {
    const { render } = await import("./render.mjs");
    const templatePath = path.join(this.eleventy.env.root, componentsDir, name);

    let { default: component } = await import(templatePath);
    if (component.default) component = component.default;

    return render(await component(makeProps(args)));
  },
  /**
   * @this {import('./types').ShortcodeThis}
   * @param {string} name
   * @param {any[]} args
   */
  handlebars(name, ...args) {
    const templatePath = path.join(this.eleventy.env.root, componentsDir, name);

    let { default: component } = require(templatePath);
    if (component.default) component = component.default;

    return unsafeSyncRender(component(makeProps(args)));
  },
});
