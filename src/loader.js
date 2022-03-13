// @ts-check

const stealthyRequire = require("./cached-require");

const { TemplatePath } = require("@11ty/eleventy-utils");

/**
 * @param {import('./types').PluginOptions['babelOptions']} options
 * @param {import('./types').PluginOptions['jsxRuntime']} jsxRuntime
 */
module.exports = (options, jsxRuntime = "automatic") => {
  require("@babel/register")({
    sourceType: "unambiguous",
    babelrc: false,
    extensions: [".jsx"],
    ...options,
    plugins: options?.overridePlugins
      ? options?.plugins
      : [
          "@babel/plugin-syntax-jsx",
          [
            "@babel/plugin-transform-react-jsx",
            // https://babeljs.io/docs/en/babel-plugin-transform-react-jsx#options
            jsxRuntime === "classic"
              ? {
                  runtime: "classic",
                  pragma: "createElement",
                  pragmaFrag: "createElement.Fragment",
                  useSpread: true,
                }
              : {
                  runtime: "automatic",
                  importSource: "eleventy-hast-jsx",
                  useSpread: true,
                },
          ],
          ...(options?.plugins ?? []),
        ],
  });

  const cache = new Map();

  return {
    getInstance: (/** @type {string} */ inputPath) => {
      const absPath = TemplatePath.absolutePath(inputPath);
      if (cache.has(absPath)) return cache.get(absPath);
      cache.set(
        absPath,
        stealthyRequire(
          require.cache,
          function loadTemplate() {
            return require(absPath);
          },
          function toKeep() {
            for (const path of cache.keys()) {
              require(path);
            }
          },
          /** @type {NodeJS.Module} */ (module)
        )
      );
      return cache.get(absPath);
    },
    clearCache: () => cache.clear(),
  };
};
