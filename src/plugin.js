// @ts-check

const stealthyRequire = require("stealthy-require");

/** @type {any} */
const { absolutePath } = require("@11ty/eleventy/src/TemplatePath");

/** @typedef {{default: (data: unknown) => import('hast').RootContent | import('hast').RootContent[], data?: unknown}} Instance */
/** @typedef {{babelOptions?: import('@babel/core').TransformOptions, htmlOptions?: import('hast-util-to-html').Options }} Options */

/** @type {(eleventyConfig: import("@11ty/eleventy/src/UserConfig"), opts: Options) => void} */
module.exports = (eleventyConfig, { babelOptions, htmlOptions } = {}) => {
  eleventyConfig.addTemplateFormats("jsx");

  const babelOpts = {
    babelrc: false,
    extensions: [".jsx"],
    cache: false,
    ...babelOptions,
    plugins: [
      "@babel/plugin-syntax-jsx",
      [
        "@babel/plugin-transform-react-jsx",
        {
          runtime: "classic",
          pragma: "createElement",
          pragmaFrag: "createElement.Fragment",
          useSpread: true,
        },
      ],
      ...(babelOptions?.plugins ?? []),
    ],
  };

  require("@babel/register")(babelOpts);

  const cache = new Map();
  const getInstance = (/** @type {string} */ inputPath) => {
    const absPath = absolutePath(inputPath);
    if (cache.has(absPath)) return cache.get(absPath);
    cache.set(
      absPath,
      stealthyRequire(
        require.cache,
        function loadTemplate() {
          return require(absPath);
        },
        function toKeep() {
          require(".");
        },
        module
      )
    );
    return cache.get(absPath);
  };

  eleventyConfig.on("eleventy.beforeWatch", () => cache.clear());

  eleventyConfig.addExtension("jsx", {
    read: false,
    getInstanceFromInputPath: getInstance,
    getData: true,
    async compile(/** @type {null} */ _, /** @type{string} */ inputPath) {
      const instance = getInstance(inputPath);

      if (!instance)
        throw new ReferenceError(
          `Module for path ${inputPath} was not loaded before compiling`
        );

      const { toHtml } = await import("hast-util-to-html");

      return async (/** @type {unknown} */ data) => {
        const hast = await instance.default(data);

        try {
          const html = toHtml(
            {
              type: "root",
              children: Array.isArray(hast) ? hast : [hast],
            },
            { allowDangerousHtml: true, ...htmlOptions }
          );
          return html;
        } catch (/** @type {any} */ e) {
          const err = new e.constructor(`[${inputPath}] ${e.message}`);
          err.stack = `[${inputPath}] ${e.stack}`;
          throw err;
        }
      };
    },

    compileOptions: {
      spiderJavaScriptDependencies: true,
      permalink: () => (/** @type {any} */ data) => {
        if (typeof data.permalink === "function") {
          return data.permalink(data);
        }
        return data.permalink;
      },
    },
  });
};
