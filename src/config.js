// @ts-check

const fs = require("node:fs/promises");
const { statSync } = require("node:fs");
const Module = require("node:module");

const ts = require("typescript");
/** @type {any} */
const { absolutePath } = require("@11ty/eleventy/src/TemplatePath");

const { createElement } = require("./jsx");

const AsyncFunction = (async () => {}).constructor;

/** @typedef {{default: (data: unknown) => import('hast').RootContent | import('hast').RootContent[], data?: unknown}} Instance */
/** @typedef {{typescript?: import('typescript').CompilerOptions, toHtml?: import('hast-util-to-html').Options }} Options */

/** @type {(eleventyConfig: import("@11ty/eleventy/src/UserConfig"), opts: Options) => void} */
exports.plugin = (eleventyConfig, { typescript, toHtml } = {}) => {
  eleventyConfig.addTemplateFormats(["tsx", "jsx"]);

  /** @type {ts.CompilerOptions} */
  const tsOptions = {
    jsx: ts.JsxEmit.React,
    jsxFactory: "createElement",
    jsxFragmentFactory: "createElement.Fragment",
    module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    ...typescript,
  };

  /** @type {Map<string, Instance>} */
  const instances = new Map();

  /** @type {(_: string) => Promise<Instance>} */
  const createInstance = async (inputPath) => {
    const fileName = absolutePath(inputPath);
    const childModule = new Module(fileName, /** @type {any} */ (module));
    childModule.filename = fileName;

    const input = await fs.readFile(fileName, "utf-8");
    const transpiledSource = ts.transpile(input, tsOptions, fileName);

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
  };

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

        return hastToHtml(
          {
            type: "root",
            children: Array.isArray(hast) ? hast : [hast],
          },
          { allowDangerousHtml: true, ...toHtml }
        );
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
