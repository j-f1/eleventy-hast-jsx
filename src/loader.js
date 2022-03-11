// @ts-check

const stealthyRequire = require("./cached-require");

const { TemplatePath } = require("@11ty/eleventy-utils");

/** @param {import('./types').PluginOptions['babelOptions']} options */
module.exports = (options) => {
  require("@babel/register")({
    babelrc: false,
    extensions: [".jsx"],
    ...options,
    plugins: options?.overridePlugins
      ? options?.plugins
      : [
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
