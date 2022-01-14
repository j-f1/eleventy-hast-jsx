// @ts-check

const Module = require("node:module");

const { transformFileSync } = require("@babel/core");

/** @type {any} */
const { absolutePath } = require("@11ty/eleventy/src/TemplatePath");

const { createElement } = require("./jsx");

const AsyncFunction = (async () => {}).constructor;

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

  /** @type {Map<string, Instance>} */
  const instances = new Map();
  /** @type {(_: string) => Promise<Instance>} */
  async function createInstance(inputPath) {
    const fileName = absolutePath(inputPath);
    const childModule = new Module(fileName, /** @type {any} */ module);
    childModule.filename = fileName;

    const transpiledSource = transformFileSync(fileName, babelOpts);

    await AsyncFunction(
      "module",
      "exports",
      "require",
      "createElement",
      transpiledSource
    )(
      childModule,
      childModule.exports,
      Module.createRequire(fileName),
      createElement
    );

    return childModule.exports;
  }

  const extension = {
    read: false,
    async getInstanceFromInputPath(/** @type {string} */ inputPath) {
      const instance = await createInstance(inputPath);
      instances.set(inputPath, instance);
      return instance;
    },
    getData: true,
    async compile(/** @type {null} */ _, /** @type{string} */ inputPath) {
      const instance = instances.get(inputPath);
      if (!instance) throw new TypeError("Missing instance for " + inputPath);

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
