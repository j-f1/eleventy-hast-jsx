// @ts-check

exports.renderComponent = Symbol("renderComponent");

/** @type {(eleventyConfig: import("@11ty/eleventy/src/UserConfig"), opts: import("./types").PluginOptions) => void} */
exports.default = (
  eleventyConfig,
  { babelOptions, htmlOptions, componentsDir = "_components", jsxRuntime } = {}
) => {
  const pkg = require("../package.json");
  try {
    eleventyConfig.versionCheck(pkg["11ty"].compatibility);
  } catch (/** @type {any} */ e) {
    console.error(
      e.message
        // 1.x
        .replace("This project", "The " + pkg.name + " plugin")
        // 2.x
        .replace(
          "We found Eleventy version",
          pkg.name + " found Eleventy version"
        )
    );
  }

  eleventyConfig.addTemplateFormats("jsx");

  // @ts-expect-error This is actually always set to a valid value
  eleventyConfig.ignores.add(componentsDir);

  const loader = require("./loader")(babelOptions, jsxRuntime);
  eleventyConfig.on("eleventy.beforeWatch", () => loader.clearCache());

  const shortcodes = require("./shortcodes")(loader, {
    componentsDir,
    htmlOptions,
  });
  eleventyConfig.addNunjucksAsyncShortcode(
    "component",
    shortcodes.nunjucksAndJS
  );
  eleventyConfig.addJavaScriptFunction("component", shortcodes.nunjucksAndJS);
  eleventyConfig.addLiquidShortcode("component", shortcodes.liquid);
  eleventyConfig.addHandlebarsHelper("component", shortcodes.handlebars);

  // @ts-expect-error Hacky!
  eleventyConfig[exports.renderComponent] = shortcodes.nunjucksAndJS;

  /** @type {import('./render.mjs').createRenderer} */
  let createRenderer;

  eleventyConfig.addExtension("jsx", {
    async init() {
      ({ createRenderer } = await import("./render.mjs"));
    },
    getInstanceFromInputPath: loader.getInstance,
    read: false,
    getData: true,
    compile(/** @type {null} */ _, /** @type {string} */ inputPath) {
      const instance = loader.getInstance(inputPath);

      if (!instance)
        throw new ReferenceError(
          `Module for path '${inputPath}' was not loaded before compiling`
        );

      return createRenderer(instance, htmlOptions);
    },

    compileOptions: {
      spiderJavaScriptDependencies: true,
      permalink(/** @type {null} */ _, /** @type {string} */ inputPath) {
        const instance = loader.getInstance(inputPath);

        if (!instance)
          throw new ReferenceError(
            `Module for path '${inputPath}' was not loaded before requesting permalink`
          );

        const { data: { permalink } = { permalink: undefined } } = instance;

        return (/** @type {any} */ data) =>
          typeof permalink === "function" ? permalink(data) : permalink;
      },
    },
  });
};
