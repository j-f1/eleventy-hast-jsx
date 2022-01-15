// @ts-check

/** @type {any} */
const { absolutePath } = require("@11ty/eleventy/src/TemplatePath");

/** @typedef {{default: (data: unknown) => import('hast').RootContent | import('hast').RootContent[], data?: unknown}} Instance */
/** @typedef {{babel?: import('@babel/core').TransformOptions, toHtml?: import('hast-util-to-html').Options }} Options */

/** @type {(eleventyConfig: import("@11ty/eleventy/src/UserConfig"), opts: Options) => void} */
exports.plugin = (eleventyConfig, { babel: babelOptions, toHtml } = {}) => {
  eleventyConfig.addTemplateFormats(["tsx", "jsx"]);

  const babelOpts = {
    babelrc: false,
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

  const extension = {
    read: false,
    getInstanceFromInputPath: (/** @type {string} */ inputPath) =>
      require(absolutePath(inputPath)),
    getData: true,
    async compile(/** @type {null} */ _, /** @type{string} */ inputPath) {
      const instance = require(absolutePath(inputPath));

      const { toHtml: hastToHtml } = await import("hast-util-to-html");

      return async (/** @type {unknown} */ data) => {
        const hast = await instance.default(data);

        try {
          const html = hastToHtml(
            {
              type: "root",
              children: Array.isArray(hast) ? hast : [hast],
            },
            { allowDangerousHtml: true, ...toHtml }
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
  };

  eleventyConfig.addExtension("jsx", extension);
  eleventyConfig.addExtension("tsx", extension);
};
