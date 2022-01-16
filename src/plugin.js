// @ts-check

/** @type {(eleventyConfig: import("@11ty/eleventy/src/UserConfig"), opts: import("./types").PluginOptions) => void} */
module.exports = (eleventyConfig, { babelOptions, htmlOptions } = {}) => {
  eleventyConfig.addTemplateFormats("jsx");

  const loader = require("./loader")(babelOptions);

  eleventyConfig.on("eleventy.beforeWatch", () => loader.clearCache());

  eleventyConfig.addExtension("jsx", {
    read: false,
    getInstanceFromInputPath: loader.getInstance,
    getData: true,
    async compile(/** @type {null} */ _, /** @type {string} */ inputPath) {
      const instance = loader.getInstance(inputPath);

      if (!instance)
        throw new ReferenceError(
          `Module for path ${inputPath} was not loaded before compiling`
        );

      const { toHtml } = await import("hast-util-to-html");

      return async (/** @type {unknown} */ data) => {
        const hast = await instance.default(data);

        const html = toHtml(
          {
            type: "root",
            children: Array.isArray(hast) ? hast : [hast],
          },
          { allowDangerousHtml: true, ...htmlOptions }
        );
        return html;
      };
    },

    compileOptions: {
      spiderJavaScriptDependencies: true,
      permalink: "raw",
    },
  });
};
