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

module.exports = (
  /** @type {ReturnType<import('./loader')>} */ loader,
  /** @type {import('./types').PluginOptions} */ {
    componentsDir = "_components",
    htmlOptions,
  }
) => {
  /**
   * @param {import('./types').ShortcodeThis['eleventy']} eleventy
   * @param {string} name
   */
  const loadComponent = (eleventy, name) => {
    if (!eleventy) {
      throw new Error(
        "this template language is not supported on Eleventy 1.x"
      );
    }
    const templatePath = path.join(eleventy.env.root, componentsDir, name);

    let component = loader.getInstance(templatePath);
    if (typeof component !== "function") {
      const componentName = /** @type {string} */ (name.split("/").pop());
      if (typeof component.default === "function") {
        component = component.default;
      } else if (typeof component[componentName] === "function") {
        component = component[componentName];
      } else {
        throw new Error(
          [
            `Component '${componentName}' not found!`,
            `- In the '${componentsDir}' directory, found component at '${templatePath}'.`,
            `- 'module.exports' was not a function.`,
            `- looked for keys '${componentName}' or 'default' on module.exports, but they were not present or not functions.`,
            `- found these exports: ${Object.keys(component).join(", ")}`,
          ].join("\n")
        );
      }
    }
    return component;
  };

  return {
    /**
     * @this {import('./types').ShortcodeThis}
     * @param {string} name
     * @param {any} props
     */
    async nunjucksAndJS(name, props) {
      const { render } = await import("./render.mjs");
      const component = loadComponent(this.eleventy || this.ctx.eleventy, name);

      return render(await component(props), htmlOptions);
    },

    /**
     * @this {import('./types').ShortcodeThis}
     * @param {string} name
     * @param {any[]} args
     */
    async liquid(name, ...args) {
      const { render } = await import("./render.mjs");
      const component = loadComponent(this.eleventy, name);

      return render(await component(makeProps(args)), htmlOptions);
    },

    /**
     * @this {import('./types').ShortcodeThis}
     * @param {string} name
     * @param {any[]} args
     */
    handlebars(name, ...args) {
      const component = loadComponent(this.eleventy, name);

      return unsafeSyncRender(component(makeProps(args)), htmlOptions);
    },
  };
};
