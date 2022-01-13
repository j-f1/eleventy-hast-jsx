const fs = require("node:fs/promises");
const { statSync } = require("node:fs");
const Module = require("node:module");

const ts = require("typescript");
const { absolutePath } = require("@11ty/eleventy/src/TemplatePath");

const AsyncFunction = (async () => {}).constructor;

/** @typedef {{default: unknown, data?: unknown}} Instance */
/** @typedef {{typescript?: import('typescript').CompilerOptions, toHtml?: import('hast-util-to-html').Options }} Options */

/** @type {(eleventyConfig: import("@11ty/eleventy/src/UserConfig"), opts: Options) => void} */
export const config = (eleventyConfig, { typescript, toHtml } = {}) => {
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
  const getInstance = async (inputPath) => {
    let inst = instances.get(inputPath);
    if (inst) return inst;

    const fileName = absolutePath(inputPath);
    const input = await fs.readFile(fileName, "utf-8");
    const childModule = new Module(fileName, module);
    childModule.filename = fileName;

    await AsyncFunction(
      "module",
      "exports",
      "require",
      ts.transpile(input, tsOptions, fileName)
    )(childModule, childModule.exports, childModule.require);

    instances.set(inputPath, childModule.exports);
    return childModule.exports;
  };

  const extension = {
    read: false,
    getInstanceFromInputPath: getInstance,
    getData: true,
    async compile(/** @type {null} */ _, /** @type{string} */ inputPath) {
      const instance = await getInstance(inputPath);
      return async (data) => {
        const [hast, hastToHtml] = await Promise.all([
          instance.default(data),
          import("hast-util-to-html"),
        ]);
        return hastToHtml(
          {
            type: "root",
            children: Array.isArray(hast) ? hast : [hast],
          },
          toHtml
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
      getCacheKey: (/** @type {null} */ _, /** @type {string} */ inputPath) =>
        JSON.stringify({
          inputPath,
          mtime: statSync(inputPath, { throwIfNoEntry: true }).mtime,
        }),
    },
  };

  eleventyConfig.addExtension("jsx", extension);
  eleventyConfig.addExtension("tsx", extension);
};
