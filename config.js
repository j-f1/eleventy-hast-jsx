import ts from "typescript";
import fs from "node:fs/promises";
import { statSync } from "node:fs";
import { absolutePath } from "@11ty/eleventy/src/TemplatePath";
import Module from "node:module";

const AsyncFunction = (async () => {}).constructor;

/** @typedef {{default: unknown, data?: unknown}} Instance */

/** @type {(eleventyConfig: import("@11ty/eleventy/src/UserConfig")) => void} */
const config = (eleventyConfig) => {
  eleventyConfig.addTemplateFormats(["tsx", "jsx"]);

  /** @type {ts.CompilerOptions} */
  const tsOptions = {
    jsx: ts.JsxEmit.React,
    jsxFactory: "h",
    jsxFragmentFactory: "h.frag",
    module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
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
      return instance.default;
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
