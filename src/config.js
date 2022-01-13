const fs = require("node:fs/promises");
const { statSync } = require("node:fs");
const Module = require("node:module");

const ts = require("typescript");
const { absolutePath } = require("@11ty/eleventy/src/TemplatePath");

const AsyncFunction = (async () => {}).constructor;

/** @typedef {{default: (data: unknown) => import('hast').RootContent | import('hast').RootContent[], data?: unknown}} Instance */
/** @typedef {{typescript?: import('typescript').CompilerOptions, toHtml?: import('hast-util-to-html').Options }} Options */

/** @type {(eleventyConfig: import("@11ty/eleventy/src/UserConfig"), opts: Options) => void} */
module.exports = (eleventyConfig, { typescript, toHtml } = {}) => {
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

  /** @type {Map<string, number>} */
  const mtimes = new Map();

  /** @type {(_: string) => Promise<Instance>} */
  const getInstance = async (inputPath) => {
    let inst = instances.get(inputPath);
    if (inst) return inst;

    const fileName = absolutePath(inputPath);
    const childModule = new Module(fileName, module);
    childModule.filename = fileName;

    const input = await fs.readFile(fileName, "utf-8");
    const transpiledSource = ts.transpile(input, tsOptions, fileName);

    await AsyncFunction(
      "module",
      "exports",
      "require",
      transpiledSource
    )(childModule, childModule.exports, Module.createRequire(fileName));

    instances.set(inputPath, childModule.exports);

    return childModule.exports;
  };

  const extension = {
    read: false,
    getInstanceFromInputPath: (path) => {
      console.log("gIFIP", path);
      return getInstance(path);
    },
    getData: true,
    async compile(/** @type {null} */ _, /** @type{string} */ inputPath) {
      console.log(`Compiling ${inputPath}`);
      const instance = await getInstance(inputPath);
      return async (/** @type {unknown} */ data) => {
        const [hast, { toHtml: hastToHtml }] = await Promise.all([
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
      cache: true,
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
