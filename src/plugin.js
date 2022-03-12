// @ts-check

/** @type {(eleventyConfig: import("@11ty/eleventy/src/UserConfig"), opts: import("./types").PluginOptions) => void} */
module.exports = (
  eleventyConfig,
  { babelOptions, htmlOptions, componentsDir } = {}
) => {
  const pkg = require("../package.json");
  try {
    eleventyConfig.versionCheck(pkg["11ty"].compatibility);
  } catch (/** @type {any} */ e) {
    console.error(
      e.message.replace("This project", "The " + pkg.name + " plugin")
    );
  }

  eleventyConfig.addTemplateFormats("jsx");

  const loader = require("./loader")(babelOptions);
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
